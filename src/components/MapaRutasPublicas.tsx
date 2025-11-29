import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useConfiguraciones } from '@/hooks/useConfiguraciones';
import { useBusesEnRuta } from '@/hooks/useBusesEnRuta';

interface MapaRutasPublicasProps {
  empresaId?: string;
  mostrarRutas?: boolean;
  mostrarParaderos?: boolean;
  mostrarBuses?: boolean;
}

export function MapaRutasPublicas({ 
  empresaId,
  mostrarRutas = true,
  mostrarParaderos = true,
  mostrarBuses = true
}: MapaRutasPublicasProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapToken, setMapToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { getConfigValue } = useConfiguraciones();
  const { buses } = useBusesEnRuta(empresaId);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Fetch Mapbox token
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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapToken) return;
    if (map.current) return;

    mapboxgl.accessToken = mapToken;

    const defaultLat = parseFloat(getConfigValue?.('map_default_lat') || '-17.6396');
    const defaultLng = parseFloat(getConfigValue?.('map_default_lng') || '-71.3378');
    const defaultZoom = parseInt(getConfigValue?.('map_default_zoom') || '13');

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [defaultLng, defaultLat],
      zoom: defaultZoom,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (map.current?.isStyleLoaded()) {
        cargarRutasYParaderos();
      }
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, [mapToken, getConfigValue]);

  // Cargar rutas y paraderos
  const cargarRutasYParaderos = async () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    try {
      // Cargar geometrías de rutas
      if (mostrarRutas) {
        let query = supabase
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

        const { data: rutasGeom } = await query;

        rutasGeom?.forEach((rutaGeom, index) => {
          if (!rutaGeom.geom || !rutaGeom.ruta) return;
          
          // Filtrar por empresa si se especifica
          if (empresaId && rutaGeom.ruta.empresa_id !== empresaId) return;

          let coordinates: [number, number][] = [];
          if (typeof rutaGeom.geom === 'object' && rutaGeom.geom && 'coordinates' in rutaGeom.geom) {
            coordinates = (rutaGeom.geom as any).coordinates;
          }

          if (coordinates.length < 2) return;

          const sourceId = `route-${rutaGeom.ruta_id}`;
          const layerId = `route-layer-${rutaGeom.ruta_id}`;

          // Colores variados para diferentes rutas
          const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
          const color = colors[index % colors.length];

          if (!map.current!.getSource(sourceId)) {
            map.current!.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  codigo: rutaGeom.ruta.codigo,
                  nombre: rutaGeom.ruta.nombre
                },
                geometry: {
                  type: 'LineString',
                  coordinates: coordinates,
                },
              },
            });

            map.current!.addLayer({
              id: layerId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': color,
                'line-width': 4,
                'line-opacity': 0.8,
              },
            });

            // Agregar popup al hacer clic en la ruta
            map.current!.on('click', layerId, (e) => {
              if (!e.features || e.features.length === 0) return;
              const props = e.features[0].properties;
              
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                  <div class="p-2">
                    <h3 class="font-bold">Línea ${props?.codigo}</h3>
                    <p class="text-sm">${props?.nombre}</p>
                  </div>
                `)
                .addTo(map.current!);
            });

            map.current!.on('mouseenter', layerId, () => {
              map.current!.getCanvas().style.cursor = 'pointer';
            });

            map.current!.on('mouseleave', layerId, () => {
              map.current!.getCanvas().style.cursor = '';
            });
          }
        });
      }

      // Cargar paraderos
      if (mostrarParaderos) {
        let paraderosQuery = supabase
          .from('paraderos')
          .select('*')
          .eq('activo', true);

        if (empresaId) {
          paraderosQuery = paraderosQuery.eq('empresa_id', empresaId);
        }

        const { data: paraderos } = await paraderosQuery;

        paraderos?.forEach(paradero => {
          const el = document.createElement('div');
          el.className = 'paradero-marker';
          el.innerHTML = `
            <div class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg cursor-pointer hover:scale-110 transition-transform">
              🚏
            </div>
          `;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-3 min-w-[200px]">
              <h3 class="font-bold text-lg mb-2">${paradero.nombre}</h3>
              ${paradero.direccion ? `<p class="text-sm text-gray-600 mb-2">${paradero.direccion}</p>` : ''}
              <div class="text-xs space-y-1">
                <div class="flex items-center gap-2">
                  <span>${paradero.tiene_asientos ? '✅' : '❌'}</span>
                  <span>Asientos</span>
                </div>
                <div class="flex items-center gap-2">
                  <span>${paradero.tiene_techado ? '✅' : '❌'}</span>
                  <span>Techado</span>
                </div>
              </div>
            </div>
          `);

          const marker = new mapboxgl.Marker(el)
            .setLngLat([paradero.longitud, paradero.latitud])
            .setPopup(popup)
            .addTo(map.current!);

          markersRef.current.push(marker);
        });
      }
    } catch (error) {
      console.error('Error cargando rutas y paraderos:', error);
    }
  };

  // Actualizar marcadores de buses (optimizado - sin recrear)
  useEffect(() => {
    if (!map.current || !mostrarBuses || !map.current.isStyleLoaded()) return;

    // Crear un mapa de buses actuales por ID
    const busMap = new Map(buses.map(b => [b.id, b]));
    
    // Actualizar o remover marcadores existentes
    markersRef.current = markersRef.current.filter(marker => {
      const el = marker.getElement();
      if (!el.classList.contains('bus-marker')) return true; // Mantener paraderos
      
      const busId = el.getAttribute('data-bus-id');
      const bus = busId ? busMap.get(busId) : null;
      
      if (bus) {
        // Actualizar posición del marcador existente
        marker.setLngLat([bus.longitud, bus.latitud]);
        
        // Actualizar popup
        const popup = marker.getPopup();
        if (popup) {
          popup.setHTML(`
            <div class="p-3 min-w-[200px]">
              <h3 class="font-bold text-lg mb-2">${bus.nombre}</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Línea:</span>
                  <span class="font-semibold">${bus.rutaCodigo}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Velocidad:</span>
                  <span class="font-semibold">${Math.round(bus.velocidad)} km/h</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Progreso:</span>
                  <span class="font-semibold">${Math.round(bus.progreso)}%</span>
                </div>
                ${bus.placa ? `
                  <div class="flex justify-between">
                    <span class="text-gray-600">Placa:</span>
                    <span class="font-mono font-semibold">${bus.placa}</span>
                  </div>
                ` : ''}
              </div>
              <div class="mt-2 pt-2 border-t flex items-center gap-2 text-xs text-green-600">
                <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span class="font-semibold">EN VIVO</span>
              </div>
            </div>
          `);
        }
        
        busMap.delete(busId!);
        return true;
      } else {
        // Remover marcador si el bus ya no existe
        marker.remove();
        return false;
      }
    });

    // Crear marcadores para buses nuevos
    busMap.forEach(bus => {
      const el = document.createElement('div');
      el.className = 'bus-marker';
      el.setAttribute('data-bus-id', bus.id);
      el.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-125 transition-transform">
            🚌
          </div>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2">${bus.nombre}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Línea:</span>
              <span class="font-semibold">${bus.rutaCodigo}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Velocidad:</span>
              <span class="font-semibold">${Math.round(bus.velocidad)} km/h</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Progreso:</span>
              <span class="font-semibold">${Math.round(bus.progreso)}%</span>
            </div>
            ${bus.placa ? `
              <div class="flex justify-between">
                <span class="text-gray-600">Placa:</span>
                <span class="font-mono font-semibold">${bus.placa}</span>
              </div>
            ` : ''}
          </div>
          <div class="mt-2 pt-2 border-t flex items-center gap-2 text-xs text-green-600">
            <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span class="font-semibold">EN VIVO</span>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([bus.longitud, bus.latitud])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [buses, mostrarBuses]);

  if (loading) {
    return (
      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Indicador en vivo */}
      {mostrarBuses && buses.length > 0 && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          EN VIVO
        </div>
      )}

      {/* Estadísticas */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg">
        <div className="grid grid-cols-2 gap-3 text-xs">
          {mostrarBuses && (
            <div>
              <div className="text-gray-600">Buses Activos</div>
              <div className="font-bold text-green-600 text-lg">{buses.length}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
