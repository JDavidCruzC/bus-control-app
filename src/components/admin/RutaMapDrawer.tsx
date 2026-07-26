import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Trash2, Undo } from 'lucide-react';
import { useConfiguraciones } from '@/hooks/useConfiguraciones';

interface RutaMapDrawerProps {
  onRouteChange?: (coordinates: [number, number][]) => void;
  initialRoute?: [number, number][];
}

export function RutaMapDrawer({ onRouteChange, initialRoute = [] }: RutaMapDrawerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapToken, setMapToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<[number, number][]>(initialRoute);
  const { getConfigValue } = useConfiguraciones();

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

    // Get default location from config or use Ilo, Peru as default
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

    // Add click handler to add points
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      const newCoords: [number, number] = [lng, lat];
      
      setCoordinates((prev) => {
        const updated = [...prev, newCoords];
        onRouteChange?.(updated);
        return updated;
      });

      // Add marker
      new mapboxgl.Marker({ color: '#3B82F6' })
        .setLngLat([lng, lat])
        .addTo(map.current!);
    });

    // Initialize with existing route if any
    if (initialRoute.length > 0) {
      setCoordinates(initialRoute);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapToken, getConfigValue]);

  // Update route line on map
  useEffect(() => {
    if (!map.current || coordinates.length < 2) return;

    const updateRoute = () => {
      if (!map.current) return;

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
    };

    // Check if style is loaded, if not wait for load event
    if (map.current.isStyleLoaded()) {
      updateRoute();
    } else {
      map.current.once('load', updateRoute);
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
    
    // Clear all markers
    if (map.current) {
      const markers = document.querySelectorAll('.mapboxgl-marker');
      markers.forEach((marker) => marker.remove());
      
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }
    }
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Haz clic en el mapa para trazar la ruta ({coordinates.length} puntos)
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={coordinates.length === 0}
          >
            <Undo className="h-4 w-4 mr-1" />
            Deshacer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={coordinates.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg border" />
    </div>
  );
}
