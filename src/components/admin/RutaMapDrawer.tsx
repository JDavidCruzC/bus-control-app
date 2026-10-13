import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Trash2, Undo } from 'lucide-react';
import { useConfiguraciones } from '@/hooks/useConfiguraciones';

interface RutaMapDrawerProps {
  onRouteChange?: (coordinates: [number, number][]) => void;
  initialRoute?: [number, number][]; // [lng, lat]
}

const pointIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#3B82F6;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.5)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export function RutaMapDrawer({ onRouteChange, initialRoute = [] }: RutaMapDrawerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);
  const fitted = useRef(false);
  const [coordinates, setCoordinates] = useState<[number, number][]>(initialRoute);
  const { getConfigValue } = useConfiguraciones();
  const onChangeRef = useRef(onRouteChange);
  onChangeRef.current = onRouteChange;

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
        const updated = [...prev, pt];
        onChangeRef.current?.(updated);
        return updated;
      });
    });

    map.current = m;
    setTimeout(() => m.invalidateSize(), 200);
    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw markers and line
  useEffect(() => {
    const m = map.current;
    const g = layerGroup.current;
    if (!m || !g) return;
    g.clearLayers();
    const latlngs = coordinates.map(([lng, lat]) => L.latLng(lat, lng));
    latlngs.forEach((ll) => L.marker(ll, { icon: pointIcon }).addTo(g));
    if (latlngs.length >= 2) {
      L.polyline(latlngs, { color: '#3B82F6', weight: 4 }).addTo(g);
    }
    if (!fitted.current && latlngs.length > 1) {
      m.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
      fitted.current = true;
    }
  }, [coordinates]);

  const handleUndo = () => {
    setCoordinates((prev) => {
      const updated = prev.slice(0, -1);
      onRouteChange?.(updated);
      return updated;
    });
  };

  const handleClear = () => {
    setCoordinates([]);
    onRouteChange?.([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
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
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg border z-0" />
    </div>
  );
}
