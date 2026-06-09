import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  icon: string;
  url: string;
  attribution: string;
}> = [
  {
    id: 'estandar',
    label: 'Estándar',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
  },
  {
    id: 'satelite',
    label: 'Satélite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  {
    id: 'relieve',
    label: 'Relieve',
    icon: '⛰️',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
  },
  {
    id: 'nocturno',
    label: 'Nocturno',
    icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
  },
  {
    id: 'claro',
    label: 'Claro',
    icon: '☀️',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
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
        .map((coord) => (Array.isArray(coord) ? [Number(coord[0]), Number(coord[1])] as [number, number] : null))
        .filter((coord): coord is [number, number] => Boolean(coord && Number.isFinite(coord[0]) && Number.isFinite(coord[1])));
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
  const baseLayer = useRef<L.TileLayer | null>(null);
  const routeLayerGroup = useRef<L.LayerGroup | null>(null);
  const stopLayerGroup = useRef<L.LayerGroup | null>(null);
  const busLayerGroup = useRef<L.LayerGroup | null>(null);
  const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyRef = useRef<L.Circle | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<MapStyleId>('estandar');
  const [isMapReady, setIsMapReady] = useState(false);
  const { getConfigValue } = useConfiguraciones();
  const { buses } = useBusesEnRuta(empresaId);

  const selectedStyle = useMemo(
    () => MAP_STYLES.find((style) => style.id === currentStyle) ?? MAP_STYLES[0],
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
          .select(`
            id,
            ruta_id,
            geom,
            ruta:rutas (
              id,
              codigo,
              nombre,
              empresa_id
            )
          `);

        rutasGeom?.forEach((rutaGeom: any, index) => {
          const ruta = rutaGeom.ruta;
          if (!rutaGeom.geom || !ruta) return;
          if (empresaId && ruta.empresa_id !== empresaId) return;

          const coordinates = extractLineCoordinates(rutaGeom.geom);
          if (coordinates.length < 2) return;

          const latLngs = coordinates.map(([lng, lat]) => L.latLng(lat, lng));
          const color = ROUTE_COLORS[index % ROUTE_COLORS.length];

          L.polyline(latLngs, {
            color,
            weight: 6,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          })
            .bindPopup(`
              <div style="min-width: 170px">
                <strong>Línea ${escapeHtml(ruta.codigo)}</strong><br />
                <span>${escapeHtml(ruta.nombre)}</span>
              </div>
            `)
            .addTo(routeLayerGroup.current!);

          latLngs.forEach((latLng) => bounds.extend(latLng));
        });
      }

      if (mostrarParaderos) {
        let paraderosQuery = supabase
          .from('paraderos')
          .select('*')
          .eq('activo', true);

        if (empresaId) {
          paraderosQuery = paraderosQuery.eq('empresa_id', empresaId);
        }

        const { data: paraderos } = await paraderosQuery;

        paraderos?.forEach((paradero: any) => {
          if (!Number.isFinite(Number(paradero.latitud)) || !Number.isFinite(Number(paradero.longitud))) return;

          const latLng = L.latLng(Number(paradero.latitud), Number(paradero.longitud));
          const marker = L.marker(latLng, {
            icon: createDivIcon(`
              <div style="width:30px;height:30px;border-radius:999px;background:#7c3aed;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(0,0,0,.28);border:2px solid white;font-size:16px">🚏</div>
            `),
          }).bindPopup(`
            <div style="min-width: 200px">
              <strong>${escapeHtml(paradero.nombre)}</strong>
              ${paradero.direccion ? `<p style="margin:6px 0;color:#4b5563">${escapeHtml(paradero.direccion)}</p>` : ''}
              <div style="font-size:12px;line-height:1.6">
                <div>${paradero.tiene_asientos ? '✅' : '❌'} Asientos</div>
                <div>${paradero.tiene_techado ? '✅' : '❌'} Techado</div>
              </div>
            </div>
          `);

          marker.addTo(stopLayerGroup.current!);
          bounds.extend(latLng);
        });
      }

      if (bounds.isValid()) {
        map.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 16 });
      }
    } catch (error) {
      console.error('Error cargando rutas y paraderos:', error);
      setMapError('No se pudieron cargar rutas o paraderos. El mapa base sigue disponible.');
    }
  }, [empresaId, mostrarParaderos, mostrarRutas]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const defaultLat = parseFloat(getConfigValue?.('map_default_lat') || '-17.6396');
    const defaultLng = parseFloat(getConfigValue?.('map_default_lng') || '-71.3378');
    const defaultZoom = parseInt(getConfigValue?.('map_default_zoom') || '13');

    map.current = L.map(mapContainer.current, {
      center: [defaultLat, defaultLng],
      zoom: defaultZoom,
      zoomControl: false,
      attributionControl: true,
    });

    baseLayer.current = L.tileLayer(selectedStyle.url, {
      attribution: selectedStyle.attribution,
      maxZoom: selectedStyle.id === 'relieve' ? 17 : 19,
      crossOrigin: true,
    }).addTo(map.current);

    routeLayerGroup.current = L.layerGroup().addTo(map.current);
    stopLayerGroup.current = L.layerGroup().addTo(map.current);
    busLayerGroup.current = L.layerGroup().addTo(map.current);

    L.control.zoom({ position: 'topright' }).addTo(map.current);
    L.control.scale({ metric: true, imperial: false, position: 'bottomright' }).addTo(map.current);

    setIsMapReady(true);
    setLoading(false);

    setTimeout(() => map.current?.invalidateSize(), 150);

    return () => {
      map.current?.stopLocate();
      map.current?.remove();
      map.current = null;
      setIsMapReady(false);
    };
  }, [getConfigValue, selectedStyle.attribution, selectedStyle.id, selectedStyle.url]);

  useEffect(() => {
    if (!map.current || !baseLayer.current) return;

    map.current.removeLayer(baseLayer.current);
    baseLayer.current = L.tileLayer(selectedStyle.url, {
      attribution: selectedStyle.attribution,
      maxZoom: selectedStyle.id === 'relieve' ? 17 : 19,
      crossOrigin: true,
    }).addTo(map.current);
    baseLayer.current.bringToBack();
  }, [selectedStyle]);

  useEffect(() => {
    if (!isMapReady) return;
    cargarRutasYParaderos();
  }, [cargarRutasYParaderos, isMapReady]);

  useEffect(() => {
    if (!map.current || !busLayerGroup.current || !mostrarBuses) return;

    const busIds = new Set(buses.map((bus) => bus.id));

    busMarkersRef.current.forEach((marker, busId) => {
      if (!busIds.has(busId)) {
        marker.remove();
        busMarkersRef.current.delete(busId);
      }
    });

    buses.forEach((bus: BusEnRuta) => {
      if (!Number.isFinite(bus.latitud) || !Number.isFinite(bus.longitud)) return;

      const latLng = L.latLng(bus.latitud, bus.longitud);
      const popup = `
        <div style="min-width: 210px">
          <strong>${escapeHtml(bus.nombre)}</strong>
          <div style="margin-top:8px;font-size:13px;line-height:1.7">
            <div><span style="color:#6b7280">Línea:</span> <strong>${escapeHtml(bus.rutaCodigo)}</strong></div>
            <div><span style="color:#6b7280">Velocidad:</span> <strong>${Math.round(bus.velocidad)} km/h</strong></div>
            <div><span style="color:#6b7280">Progreso:</span> <strong>${Math.round(bus.progreso)}%</strong></div>
            ${bus.placa ? `<div><span style="color:#6b7280">Placa:</span> <strong>${escapeHtml(bus.placa)}</strong></div>` : ''}
          </div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;color:#059669;font-size:12px;font-weight:700">● EN VIVO</div>
        </div>
      `;

      const existingMarker = busMarkersRef.current.get(bus.id);

      if (existingMarker) {
        existingMarker.setLatLng(latLng);
        existingMarker.setPopupContent(popup);
        return;
      }

      const marker = L.marker(latLng, {
        icon: createDivIcon(`
          <div style="position:relative;width:36px;height:36px">
            <div style="width:34px;height:34px;border-radius:999px;background:#16a34a;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 22px rgba(0,0,0,.35);border:2px solid white;font-size:18px">🚌</div>
            <div style="position:absolute;right:0;top:0;width:10px;height:10px;border-radius:999px;background:#86efac;border:1px solid white"></div>
          </div>
        `),
      }).bindPopup(popup);

      marker.addTo(busLayerGroup.current!);
      busMarkersRef.current.set(bus.id, marker);
    });
  }, [buses, mostrarBuses]);

  const ubicarUsuario = () => {
    if (!map.current) return;
    setMapError(null);

    map.current.locate({
      setView: true,
      maxZoom: 17,
      watch: true,
      enableHighAccuracy: true,
      timeout: 12000,
    });

    map.current.off('locationfound');
    map.current.off('locationerror');

    map.current.on('locationfound', (event) => {
      const latLng = event.latlng;

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(latLng, {
          icon: createDivIcon(`
            <div style="width:34px;height:34px;border-radius:999px;background:#0284c7;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(2,132,199,.45);border:3px solid white;font-size:17px">📍</div>
          `),
        })
          .bindPopup('Tu ubicación actual')
          .addTo(map.current!);
      } else {
        userMarkerRef.current.setLatLng(latLng);
      }

      if (!userAccuracyRef.current) {
        userAccuracyRef.current = L.circle(latLng, {
          radius: event.accuracy,
          color: '#0284c7',
          fillColor: '#38bdf8',
          fillOpacity: 0.16,
          weight: 2,
        }).addTo(map.current!);
      } else {
        userAccuracyRef.current.setLatLng(latLng);
        userAccuracyRef.current.setRadius(event.accuracy);
      }
    });

    map.current.on('locationerror', () => {
      setMapError('No se pudo obtener tu ubicación. Revisa permisos de GPS/navegador.');
    });
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted">
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-muted">
      <div ref={mapContainer} className="h-full min-h-[420px] w-full" />

      {mapError && (
        <div className="absolute left-1/2 top-4 z-[1000] w-[min(92%,460px)] -translate-x-1/2 rounded-lg border border-destructive bg-background/95 p-3 text-center shadow-xl backdrop-blur">
          <p className="text-sm font-semibold text-destructive">⚠️ {mapError}</p>
        </div>
      )}

      <div className="absolute left-4 top-4 z-[900] flex flex-col gap-1 rounded-lg border border-border bg-background/95 p-1 shadow-lg backdrop-blur">
        {MAP_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => setCurrentStyle(style.id)}
            title={style.label}
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              currentStyle === style.id
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <span>{style.icon}</span>
            <span className="hidden sm:inline">{style.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={ubicarUsuario}
        className="absolute right-4 top-32 z-[900] flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/95 text-lg shadow-lg backdrop-blur transition-colors hover:bg-muted"
        title="Mostrar mi ubicación real"
      >
        📍
      </button>

      {mostrarBuses && buses.length > 0 && (
        <div className="absolute right-16 top-4 z-[900] flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground shadow-lg">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary-foreground" />
          EN VIVO
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-[900] rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
        <div className="grid grid-cols-2 gap-3 text-xs">
          {mostrarBuses && (
            <div>
              <div className="text-muted-foreground">Buses Activos</div>
              <div className="text-lg font-bold text-primary">{buses.length}</div>
            </div>
          )}
          <div>
            <div className="text-muted-foreground">Vista</div>
            <div className="text-lg font-bold text-primary">{selectedStyle.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}