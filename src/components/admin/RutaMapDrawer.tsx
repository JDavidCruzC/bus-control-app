import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, Undo } from 'lucide-react';
import { useConfiguraciones } from '@/hooks/useConfiguraciones';

interface RutaMapDrawerProps {
  /** Emite la ruta completa [lng, lat]; si es ida y vuelta incluye el regreso */
  onRouteChange?: (coordinates: [number, number][]) => void;
  initialRoute?: [number, number][]; // [lng, lat]
}

const dot = (bg: string, size: number, label = '') =>
  L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;color:#fff;font:bold 11px sans-serif;cursor:grab">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
const pointIcon = dot('#3B82F6', 14);
const startIcon = dot('#16A34A', 24, 'A');
const endIcon = dot('#DC2626', 24, 'B');

// distancia de un punto a un segmento (en píxeles)
function segDist(p: L.Point, a: L.Point, b: L.Point) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export function RutaMapDrawer({ onRouteChange, initialRoute = [] }: RutaMapDrawerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);
  const fitted = useRef(false);
  const [coordinates, setCoordinates] = useState<[number, number][]>(initialRoute);
  const [idaVuelta, setIdaVuelta] = useState(false);
  const { getConfigValue, configuraciones } = useConfiguraciones();
  const onChangeRef = useRef(onRouteChange);
  onChangeRef.current = onRouteChange;

  // Emitir al padre cada vez que cambian puntos o modo
  useEffect(() => {
    const full = idaVuelta && coordinates.length > 1
      ? [...coordinates, ...coordinates.slice(0, -1).reverse()]
      : coordinates;
    onChangeRef.current?.(full);
  }, [coordinates, idaVuelta]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const lat = parseFloat(getConfigValue?.('map_default_lat') || '-17.6396');
    const lng = parseFloat(getConfigValue?.('map_default_lng') || '-71.3378');
    const zoom = parseInt(getConfigValue?.('map_default_zoom') || '13');

    const m = L.map(mapContainer.current).setView([lat, lng], zoom);
    const capas: Record<string, L.TileLayer> = {
      'Estándar': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19,
      }),
      'Satélite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri', maxZoom: 19,
      }),
      'Relieve': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap, © OpenStreetMap contributors', maxZoom: 17,
      }),
      'Nocturno': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CARTO, © OpenStreetMap contributors', maxZoom: 19,
      }),
      'Claro': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CARTO, © OpenStreetMap contributors', maxZoom: 19,
      }),
    };
    capas['Estándar'].addTo(m);
    L.control.layers(capas, undefined, { position: 'topright', collapsed: true }).addTo(m);
    layerGroup.current = L.layerGroup().addTo(m);

    m.on('click', (e: L.LeafletMouseEvent) => {
      const pt: [number, number] = [e.latlng.lng, e.latlng.lat];
      setCoordinates((prev) => {
        // Si el clic cae cerca de un tramo, insertar el punto en medio
        if (prev.length >= 2) {
          const p = m.latLngToContainerPoint(e.latlng);
          let best = -1, bestD = 12;
          for (let i = 0; i < prev.length - 1; i++) {
            const a = m.latLngToContainerPoint([prev[i][1], prev[i][0]]);
            const b = m.latLngToContainerPoint([prev[i + 1][1], prev[i + 1][0]]);
            const d = segDist(p, a, b);
            if (d < bestD) { bestD = d; best = i; }
          }
          if (best >= 0) {
            const copy = [...prev];
            copy.splice(best + 1, 0, pt);
            return copy;
          }
        }
        return [...prev, pt];
      });
    });

    map.current = m;
    // Recalcular tamaño cuando el contenedor aparece o cambia (pestañas/diálogos)
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(mapContainer.current);
    setTimeout(() => m.invalidateSize(), 200);
    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Centrar en la ubicación configurada cuando cargue (si aún no hay puntos)
  useEffect(() => {
    const m = map.current;
    if (!m || configuraciones.length === 0 || coordinates.length > 0) return;
    const lat = parseFloat(getConfigValue('map_default_lat') || '-17.6396');
    const lng = parseFloat(getConfigValue('map_default_lng') || '-71.3378');
    const zoom = parseInt(getConfigValue('map_default_zoom') || '13');
    m.setView([lat, lng], zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuraciones]);


  // Redibujar marcadores y línea
  useEffect(() => {
    const m = map.current;
    const g = layerGroup.current;
    if (!m || !g) return;
    g.clearLayers();
    const latlngs = coordinates.map(([lng, lat]) => L.latLng(lat, lng));
    if (latlngs.length >= 2) {
      L.polyline(latlngs, { color: '#3B82F6', weight: 5 }).addTo(g);
      if (idaVuelta) {
        L.polyline([...latlngs].reverse(), { color: '#F97316', weight: 3, dashArray: '8 8', offset: 4 } as any).addTo(g);
      }
    }
    latlngs.forEach((ll, i) => {
      const isStart = i === 0;
      const isEnd = i === latlngs.length - 1 && latlngs.length > 1;
      const marker = L.marker(ll, {
        icon: isStart ? startIcon : isEnd ? endIcon : pointIcon,
        draggable: true,
        zIndexOffset: isStart || isEnd ? 1000 : 0,
      }).addTo(g);
      marker.bindTooltip(
        isStart ? 'Inicio (arrastra para mover)' : isEnd ? (idaVuelta ? 'Retorno' : 'Fin') : `Punto ${i + 1} · doble clic para eliminar`,
        { direction: 'top' }
      );
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        setCoordinates((prev) => prev.map((c, j) => (j === i ? [p.lng, p.lat] : c)));
      });
      marker.on('dblclick', (ev) => {
        L.DomEvent.stop(ev as any);
        setCoordinates((prev) => prev.filter((_, j) => j !== i));
      });
    });
    if (!fitted.current && latlngs.length > 1) {
      m.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
      fitted.current = true;
    }
  }, [coordinates, idaVuelta]);

  const handleUndo = () => setCoordinates((prev) => prev.slice(0, -1));
  const handleClear = () => setCoordinates([]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Haz clic en el mapa para trazar la ruta ({coordinates.length} puntos)
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleUndo} disabled={coordinates.length === 0}>
            <Undo className="h-4 w-4 mr-1" />
            Deshacer
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleClear} disabled={coordinates.length === 0}>
            <Trash2 className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="ida-vuelta" checked={idaVuelta} onCheckedChange={setIdaVuelta} />
        <Label htmlFor="ida-vuelta" className="text-sm">
          Ida y vuelta (regresa por el mismo camino)
        </Label>
      </div>
      <div ref={mapContainer} className="w-full h-[450px] rounded-lg border z-0" />
      <p className="text-xs text-muted-foreground">
        <b>A</b> = inicio, <b>B</b> = fin. Arrastra cualquier punto para moverlo, haz clic sobre la línea para agregar un punto en medio y doble clic en un punto para borrarlo.
      </p>
    </div>
  );
}
