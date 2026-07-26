import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimpleMapViewProps {
  center: [number, number]; // [longitude, latitude]
  zoom?: number;
  markers?: Array<{
    longitude: number;
    latitude: number;
    color?: string;
    label?: string;
  }>;
}

export const SimpleMapView: React.FC<SimpleMapViewProps> = ({ 
  center, 
  zoom = 13, 
  markers = [] 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      try {
        const { data } = await supabase.functions.invoke('get-mapbox-token');
        const token = data?.token;
        
        if (!token) {
          toast({
            title: "Error",
            description: "Token de Mapbox no configurado",
            variant: "destructive"
          });
          return;
        }

        mapboxgl.accessToken = token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: center,
          zoom: zoom,
        });

        map.current.addControl(
          new mapboxgl.NavigationControl(),
          'top-right'
        );

        // Add markers
        markers.forEach(marker => {
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundColor = marker.color || '#3b82f6';
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          const markerInstance = new mapboxgl.Marker(el)
            .setLngLat([marker.longitude, marker.latitude])
            .addTo(map.current!);

          if (marker.label) {
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setText(marker.label);
            markerInstance.setPopup(popup);
          }

          markersRef.current.push(markerInstance);
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: "Error",
          description: "No se pudo inicializar el mapa",
          variant: "destructive"
        });
      }
    };

    initializeMap();

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, markers, toast]);

  return <div ref={mapContainer} className="w-full h-full" />;
};
