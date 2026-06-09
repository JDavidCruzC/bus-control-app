import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, X, Locate } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useConfiguraciones } from '@/hooks/useConfiguraciones';
import { BusEnRuta, useBusesEnRuta } from '@/hooks/useBusesEnRuta';

interface MapaRutasPublicasProps {
  empresaId?: string;
  mostrarRutas?: boolean;
  mostrarParaderos?: boolean;
  mostrarBuses?: boolean;
}

type MapStyleId = 'estandar' | 'satelite' | 'relieve' | 'nocturno' | 'claro';

const MAP_STYLES: Array<{
  id: MapStyleId;
  label: string;
  preview: string;
  url: string;
  attribution: string;
  maxZoom: number;
}> = [
  {
    id: 'estandar',
    label: 'Estándar',
    preview:
      'https://a.tile.openstreetmap.org/13/2310/3956.png',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
  },
  {
    id: 'satelite',
    label: 'Satélite',
    preview:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/3956/2310',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
  },
  {
    id: 'relieve',
    label: 'Relieve',
    preview: 'https://a.tile.opentopomap.org/13/2310/3956.png',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
    maxZoom: 17,
  },
  {
    id: 'nocturno',
    label: 'Nocturno',
    preview: 'https://a.basemaps.cartocdn.com/dark_all/13/2310/3956.png',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    maxZoom: 19,
  },
  {
    id: 'claro',
    label: 'Claro',
    preview: 'https://a.basemaps.cartocdn.com/light_all/13/2310/3956.png',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    maxZoom: 19,
  },
];

const ROUTE_COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777'];

const createDivIcon = (html: string, className = '') =>
  L.divIcon({
    html,
    className,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

const escapeHtml = (value?: string | number | null) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const extractLineCoordinates = (geom: unknown): [number, number][] => {
  if (!geom) return [];
  if (typeof geom === 'object' && geom !== null && 'coordinates' in geom) {
    const coordinates = (geom as { coordinates?: unknown }).coordinates;
    if (Array.isArray(coordinates)) {
      return coordinates
        .map((coord) => (Array.isArray(coord) ? ([Number(coord[0]), Number(coord[1])] as [number, number]) : null))
        .filter((c): c is [number, number] => Boolean(c && Number.isFinite(c[0]) && Number.isFinite(c[1])));
    }
  }
  if (typeof geom === 'string') {
    const match = geom.match(/LINESTRING\s*\(([^)]+)\)/i);
    if (!match) return [];
    return match[1]
      .split(',')
      .map((point) => {
        const [lng, lat] = point.trim().split(/\s+/).map(Number);
        return [lng, lat] as [number, number];
      })
      .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));
  }
  return [];
};

export function MapaRutasPublicas({
  empresaId,
  mostrarRutas = true,
  mostrarParaderos = true,
  mostrarBuses = true,
}: MapaRutasPublicasProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const routeLayerGroup = useRef<L.LayerGroup | null>(null);
  const stopLayerGroup = useRef<L.LayerGroup | null>(null);
  const busLayerGroup = useRef<L.LayerGroup | null>(null);
  const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyRef = useRef<L.Circle | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<MapStyleId>('estandar');
  const [stylePickerOpen, setStylePickerOpen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const { getConfigValue } = useConfiguraciones();
  const { buses } = useBusesEnRuta(empresaId);

  const selectedStyle = useMemo(
    () => MAP_STYLES.find((s) => s.id === currentStyle) ?? MAP_STYLES[0],
    [currentStyle]
  );

  const cargarRutasYParaderos = useCallback(async () => {
    if (!map.current || !routeLayerGroup.current || !stopLayerGroup.current) return;
    routeLayerGroup.current.clearLayers();
    stopLayerGroup.current.clearLayers();

    try {
      const bounds = L.latLngBounds([]);

      if (mostrarRutas) {
        const { data: rutasGeom } = await supabase
          .from('rutas_geometria')
          .select(`id, ruta_id, geom, ruta:rutas (id, codigo, nombre, empresa_id)`);

        rutasGeom?.forEach((rutaGeom: any, index) => {
          const ruta = rutaGeom.ruta;
          if (!rutaGeom.geom || !ruta) return;
          if (empresaId && ruta.empresa_id !== empresaId) return;
          const coords = extractLineCoordinates(rutaGeom.geom);
          if (coords.length < 2) return;
          const latLngs = coords.map(([lng, lat]) => L.latLng(lat, lng));
          const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
          L.polyline(latLngs, { color, weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' })
            .bindPopup(`<div style="min-width:170px"><strong>Línea ${escapeHtml(ruta.codigo)}</strong><br/><span>${escapeHtml(ruta.nombre)}</span></div>`)
            .addTo(routeLayerGroup.current!);
          latLngs.forEach((ll) => bounds.extend(ll));
        });
      }

      if (mostrarParaderos) {
        let q = supabase.from('paraderos').select('*').eq('activo', true);
        if (empresaId) q = q.eq('empresa_id', empresaId);
        const { data: paraderos } = await q;
        paraderos?.forEach((p: any) => {
          if (!Number.isFinite(Number(p.latitud)) || !Number.isFinite(Number(p.longitud))) return;
          const latLng = L.latLng(Number(p.latitud), Number(p.longitud));
          L.marker(latLng, {
            icon: createDivIcon(`<div style="width:30px;height:30px;border-radius:999px;background:#7c3aed;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(0,0,0,.28);border:2px solid white;font-size:16px">🚏</div>`),
          })
            .bindPopup(`<div style="min-width:200px"><strong>${escapeHtml(p.nombre)}</strong>${p.direccion ? `<p style="margin:6px 0;color:#4b5563">${escapeHtml(p.direccion)}</p>` : ''}</div>`)
            .addTo(stopLayerGroup.current!);
          bounds.extend(latLng);
        });
      }

      if (bounds.isValid()) map.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 16 });
    } catch (error) {
      console.error('Error cargando rutas y paraderos:', error);
      setMapError('No se pudieron cargar rutas o paraderos. El mapa base sigue disponible.');
    }
  }, [empresaId, mostrarParaderos, mostrarRutas]);

  // Initialize map ONCE
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const defaultLat = parseFloat(getConfigValue?.('map_default_lat') || '-17.6396');
    const defaultLng = parseFloat(getConfigValue?.('map_default_lng') || '-71.3378');
    const defaultZoom = parseInt(getConfigValue?.('map_default_zoom') || '13');

    const instance = L.map(mapContainer.current, {
      center: [defaultLat, defaultLng],
      zoom: defaultZoom,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    });
    map.current = instance;

    baseLayerRef.current = L.tileLayer(MAP_STYLES[0].url, {
      attribution: MAP_STYLES[0].attribution,
      maxZoom: MAP_STYLES[0].maxZoom,
      crossOrigin: true,
    }).addTo(instance);

    routeLayerGroup.current = L.layerGroup().addTo(instance);
    stopLayerGroup.current = L.layerGroup().addTo(instance);
    busLayerGroup.current = L.layerGroup().addTo(instance);

    L.control.zoom({ position: 'topright' }).addTo(instance);
    L.control.scale({ metric: true, imperial: false, position: 'bottomright' }).addTo(instance);

    setIsMapReady(true);
    setLoading(false);
    setTimeout(() => instance.invalidateSize(), 150);

    return () => {
      instance.stopLocate();
      instance.remove();
      map.current = null;
      baseLayerRef.current = null;
      setIsMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smooth style change: add new layer, remove old on load (no flicker)
  useEffect(() => {
    const instance = map.current;
    if (!instance || !baseLayerRef.current) return;
    if (baseLayerRef.current.options.attribution === selectedStyle.attribution &&
        (baseLayerRef.current as any)._url === selectedStyle.url) return;

    const oldLayer = baseLayerRef.current;
    const newLayer = L.tileLayer(selectedStyle.url, {
      attribution: selectedStyle.attribution,
      maxZoom: selectedStyle.maxZoom,
      crossOrigin: true,
    });
    newLayer.addTo(instance);
    baseLayerRef.current = newLayer;

    const removeOld = () => {
      try { instance.removeLayer(oldLayer); } catch {}
    };
    newLayer.once('load', removeOld);
    // safety fallback
    setTimeout(removeOld, 1500);
  }, [selectedStyle]);

  useEffect(() => {
    if (!isMapReady) return;
    cargarRutasYParaderos();
  }, [cargarRutasYParaderos, isMapReady]);

  useEffect(() => {
    if (!map.current || !busLayerGroup.current || !mostrarBuses) return;
    const busIds = new Set(buses.map((b) => b.id));
    busMarkersRef.current.forEach((marker, id) => {
      if (!busIds.has(id)) { marker.remove(); busMarkersRef.current.delete(id); }
    });
    buses.forEach((bus: BusEnRuta) => {
      if (!Number.isFinite(bus.latitud) || !Number.isFinite(bus.longitud)) return;
      const latLng = L.latLng(bus.latitud, bus.longitud);
      const popup = `<div style="min-width:210px"><strong>${escapeHtml(bus.nombre)}</strong><div style="margin-top:8px;font-size:13px;line-height:1.7"><div>Línea: <strong>${escapeHtml(bus.rutaCodigo)}</strong></div><div>Velocidad: <strong>${Math.round(bus.velocidad)} km/h</strong></div><div>Progreso: <strong>${Math.round(bus.progreso)}%</strong></div>${bus.placa ? `<div>Placa: <strong>${escapeHtml(bus.placa)}</strong></div>` : ''}</div><div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;color:#059669;font-size:12px;font-weight:700">● EN VIVO</div></div>`;
      const existing = busMarkersRef.current.get(bus.id);
      if (existing) {
        existing.setLatLng(latLng);
        existing.setPopupContent(popup);
        return;
      }
      const marker = L.marker(latLng, {
        icon: createDivIcon(`<div style="position:relative;width:36px;height:36px"><div style="width:34px;height:34px;border-radius:999px;background:#16a34a;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 22px rgba(0,0,0,.35);border:2px solid white;font-size:18px">🚌</div><div style="position:absolute;right:0;top:0;width:10px;height:10px;border-radius:999px;background:#86efac;border:1px solid white"></div></div>`),
      }).bindPopup(popup);
      marker.addTo(busLayerGroup.current!);
      busMarkersRef.current.set(bus.id, marker);
    });
  }, [buses, mostrarBuses]);

  const ubicarUsuario = () => {
    if (!map.current) return;
    setMapError(null);
    map.current.locate({ setView: true, maxZoom: 17, watch: true, enableHighAccuracy: true, timeout: 12000 });
    map.current.off('locationfound');
    map.current.off('locationerror');
    map.current.on('locationfound', (event) => {
      const latLng = event.latlng;
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(latLng, {
          icon: createDivIcon(`<div style="width:34px;height:34px;border-radius:999px;background:#0284c7;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(2,132,199,.45);border:3px solid white;font-size:17px">📍</div>`),
        }).bindPopup('Tu ubicación actual').addTo(map.current!);
      } else {
        userMarkerRef.current.setLatLng(latLng);
      }
      if (!userAccuracyRef.current) {
        userAccuracyRef.current = L.circle(latLng, { radius: event.accuracy, color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.16, weight: 2 }).addTo(map.current!);
      } else {
        userAccuracyRef.current.setLatLng(latLng);
        userAccuracyRef.current.setRadius(event.accuracy);
      }
    });
    map.current.on('locationerror', () => {
      setMapError('No se pudo obtener tu ubicación. Revisa permisos de GPS/navegador.');
    });
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-muted">
      <div ref={mapContainer} className="h-full min-h-[420px] w-full" />

      {loading && (
        <div className="absolute inset-0 z-[950] flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Cargando mapa...</p>
        </div>
      )}

      {mapError && (
        <div className="absolute left-1/2 top-4 z-[1000] w-[min(92%,460px)] -translate-x-1/2 rounded-lg border border-destructive bg-background/95 p-3 text-center shadow-xl backdrop-blur">
          <p className="text-sm font-semibold text-destructive">⚠️ {mapError}</p>
        </div>
      )}

      {/* Floating layer button (Google Maps style) */}
      <button
        onClick={() => setStylePickerOpen(true)}
        className="absolute right-4 top-16 z-[900] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/95 shadow-lg backdrop-blur transition-transform hover:scale-105"
        title="Tipo de mapa"
      >
        <Layers className="h-5 w-5 text-foreground" />
      </button>

      <button
        onClick={ubicarUsuario}
        className="absolute right-4 top-32 z-[900] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/95 shadow-lg backdrop-blur transition-transform hover:scale-105"
        title="Mi ubicación real"
      >
        <Locate className="h-5 w-5 text-primary" />
      </button>

      {mostrarBuses && buses.length > 0 && (
        <div className="absolute left-4 top-4 z-[900] flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground shadow-lg">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-foreground" />
          EN VIVO · {buses.length}
        </div>
      )}

      {/* Map style picker modal (Google Maps style) */}
      {stylePickerOpen && (
        <div
          className="absolute inset-0 z-[1100] flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setStylePickerOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-t-2xl bg-background p-5 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tipo de mapa</h3>
              <button
                onClick={() => setStylePickerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
              {MAP_STYLES.map((style) => {
                const active = style.id === currentStyle;
                return (
                  <button
                    key={style.id}
                    onClick={() => {
                      setCurrentStyle(style.id);
                      setStylePickerOpen(false);
                    }}
                    className="flex flex-col items-center gap-2 focus:outline-none"
                  >
                    <div
                      className={`relative h-20 w-20 overflow-hidden rounded-2xl border-4 transition-all ${
                        active ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <img
                        src={style.preview}
                        alt={style.label}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-foreground'}`}>
                      {style.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
