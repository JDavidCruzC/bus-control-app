import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useConfiguraciones } from '@/hooks/useConfiguraciones';
import { useRutasConGeometria } from '@/hooks/useRutasConGeometria';

interface RutaMapViewerProps {
  rutaId: string;
}

export function RutaMapViewer({ rutaId }: RutaMapViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapToken, setMapToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { getConfigValue } = useConfiguraciones();
  const { rutasGeom } = useRutasConGeometria();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapToken(data.token);
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapToken) return;

    mapboxgl.accessToken = mapToken;

    const defaultLat = parseFloat(getConfigValue?.('map_default_lat') || '-17.6396');
    const defaultLng = parseFloat(getConfigValue?.('map_default_lng') || '-71.3378');
    const defaultZoom = parseInt(getConfigValue?.('map_default_zoom') || '13');

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [defaultLng, defaultLat],
      zoom: defaultZoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapToken, getConfigValue]);

  // Display route geometry
  useEffect(() => {
    if (!map.current || !rutaId) return;

    const rutaGeom = rutasGeom.find(rg => rg.ruta_id === rutaId);
    if (!rutaGeom?.geom) return;

    // Parse WKT geometry to coordinates
    const wktString = rutaGeom.geom;
    let coordinates: [number, number][] = [];

    try {
      // Handle both WKT string and binary formats
      if (typeof wktString === 'string') {
        const coordsMatch = wktString.match(/LINESTRING\(([^)]+)\)/);
        if (coordsMatch) {
          coordinates = coordsMatch[1].split(',').map(point => {
            const [lng, lat] = point.trim().split(' ').map(Number);
            return [lng, lat] as [number, number];
          });
        }
      }

      if (coordinates.length < 2) return;

      // Wait for map to load
      if (map.current.isStyleLoaded()) {
        addRouteToMap(coordinates);
      } else {
        map.current.once('load', () => {
          addRouteToMap(coordinates);
        });
      }
    } catch (error) {
      console.error('Error parsing route geometry:', error);
    }
  }, [rutasGeom, rutaId]);

  const addRouteToMap = (coordinates: [number, number][]) => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Remove existing route layer if it exists
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    // Add route line
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      },
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3B82F6',
        'line-width': 4,
      },
    });

    // Fit map to show all points
    if (coordinates.length > 0) {
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.current.fitBounds(bounds, { padding: 50 });
    }

    // Add markers for start and end points
    new mapboxgl.Marker({ color: '#22C55E' })
      .setLngLat(coordinates[0])
      .setPopup(new mapboxgl.Popup().setText('Inicio'))
      .addTo(map.current);

    new mapboxgl.Marker({ color: '#EF4444' })
      .setLngLat(coordinates[coordinates.length - 1])
      .setPopup(new mapboxgl.Popup().setText('Fin'))
      .addTo(map.current);
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Visualización del trayecto de la ruta
      </p>
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg border" />
    </div>
  );
}
