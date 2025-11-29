import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useConfiguraciones } from '@/hooks/useConfiguraciones';

interface ParaderoMapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export function ParaderoMapPicker({ latitude, longitude, onLocationChange }: ParaderoMapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapToken, setMapToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { getConfigValue } = useConfiguraciones();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.log('Geolocation not available, using default location', error);
        }
      );
    }
  }, []);

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

    // Priority: user location > config default > provided coordinates (if valid) > Ilo, Peru
    let initialLng = defaultLng;
    let initialLat = defaultLat;
    
    // Use user location if available
    if (userLocation) {
      initialLng = userLocation[0];
      initialLat = userLocation[1];
    }
    
    // Override with provided coordinates only if they are valid (not 0,0)
    if (longitude !== 0 && latitude !== 0) {
      initialLng = longitude;
      initialLat = latitude;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: defaultZoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Enable scroll zoom for better interaction
    map.current.scrollZoom.enable();

    // Add initial marker
    marker.current = new mapboxgl.Marker({ draggable: true, color: '#FF6B6B' })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current);

    // Update coordinates when marker is dragged
    marker.current.on('dragend', () => {
      const lngLat = marker.current!.getLngLat();
      onLocationChange(lngLat.lat, lngLat.lng);
    });

    // Allow clicking on map to move marker
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      marker.current?.setLngLat([lng, lat]);
      onLocationChange(lat, lng);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapToken, userLocation, getConfigValue]);

  // Update marker position when props change
  useEffect(() => {
    if (marker.current && latitude && longitude) {
      marker.current.setLngLat([longitude, latitude]);
      map.current?.flyTo({ center: [longitude, latitude], zoom: 15 });
    }
  }, [latitude, longitude]);

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
        Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación
      </p>
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg border" />
    </div>
  );
}
