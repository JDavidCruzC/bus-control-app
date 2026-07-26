import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VehicleMapData {
  id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  año?: number;
  color?: string;
  numero_interno?: string;
  capacidad_pasajeros?: number;
  tiene_gps: boolean;
  tiene_aire: boolean;
  activo: boolean;
  empresa_id?: string;
  created_at: string;
  updated_at: string;
  // Simulated real-time data for map display
  latitud?: number;
  longitud?: number;
  velocidad?: number;
  conductor_nombre?: string;
  estado_operativo?: string;
}

interface ParaderoMapData {
  id: string;
  nombre: string;
  descripcion?: string;
  latitud: number;
  longitud: number;
  direccion?: string;
  activo: boolean;
  tiene_asientos: boolean;
  tiene_techado: boolean;
  created_at: string;
  updated_at: string;
  // Simulated real-time data
  pasajeros_esperando?: number;
}

interface MapboxMapProps {
  selectedLayer: string;
  isRealTime: boolean;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ selectedLayer, isRealTime }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [vehicles, setVehicles] = useState<VehicleMapData[]>([]);
  const [paraderos, setParaderos] = useState<ParaderoMapData[]>([]);
  const [vehicleMarkers, setVehicleMarkers] = useState<mapboxgl.Marker[]>([]);
  const [paraderoMarkers, setParaderoMarkers] = useState<mapboxgl.Marker[]>([]);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Get Mapbox token from Supabase secrets
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
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-79.92, -2.17], // Guayaquil, Ecuador por defecto
          zoom: 12,
          pitch: 45,
        });

        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        map.current.on('style.load', () => {
          loadData();
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
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load vehicles and paraderos data
  const loadData = async () => {
    try {
      // Load real-time vehicle locations from ubicaciones_tiempo_real
      const { data: ubicacionesData } = await supabase
        .from('ubicaciones_tiempo_real')
        .select('*')
        .order('timestamp_gps', { ascending: false });

      if (ubicacionesData && ubicacionesData.length > 0) {
        // Group by vehiculo_id to get latest location for each vehicle
        const latestLocations = new Map();
        ubicacionesData.forEach((ub: any) => {
          if (ub.vehiculo_id && !latestLocations.has(ub.vehiculo_id)) {
            latestLocations.set(ub.vehiculo_id, ub);
          }
        });

        // Get vehicle details
        const vehiculoIds = Array.from(latestLocations.keys());
        const { data: vehiculosData } = await supabase
          .from('vehiculos')
          .select('*')
          .in('id', vehiculoIds);

        const vehiclesWithLocation = Array.from(latestLocations.values())
          .map((ub: any) => {
            const vehiculo = vehiculosData?.find((v: any) => v.id === ub.vehiculo_id);
            if (!vehiculo) return null;
            return {
              id: vehiculo.id,
              placa: vehiculo.placa,
              marca: vehiculo.marca,
              modelo: vehiculo.modelo,
              año: vehiculo.año,
              color: vehiculo.color,
              numero_interno: vehiculo.numero_interno,
              capacidad_pasajeros: vehiculo.capacidad_pasajeros,
              tiene_gps: vehiculo.tiene_gps ?? false,
              tiene_aire: vehiculo.tiene_aire ?? false,
              activo: vehiculo.activo ?? false,
              empresa_id: vehiculo.empresa_id,
              created_at: vehiculo.created_at,
              updated_at: vehiculo.updated_at,
              latitud: parseFloat(ub.latitud),
              longitud: parseFloat(ub.longitud),
              velocidad: ub.velocidad ? parseFloat(ub.velocidad) : 0,
              conductor_nombre: 'Conductor Asignado',
              estado_operativo: vehiculo.activo ? 'en_servicio' : 'fuera_servicio'
            } as VehicleMapData;
          })
          .filter((v): v is VehicleMapData => v !== null);

        setVehicles(vehiclesWithLocation);

        // Center map on first vehicle if available
        if (vehiclesWithLocation.length > 0 && map.current) {
          const firstVehicle = vehiclesWithLocation[0];
          if (firstVehicle.latitud && firstVehicle.longitud) {
            map.current.flyTo({
              center: [firstVehicle.longitud, firstVehicle.latitud],
              zoom: 13
            });
          }
        }
      }

      // Load paraderos (without fake passenger data)
      const { data: paraderosData } = await supabase
        .from('paraderos')
        .select('*')
        .eq('activo', true);

      if (paraderosData) {
        setParaderos(paraderosData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del mapa",
        variant: "destructive"
      });
    }
  };

  // Update vehicle markers
  useEffect(() => {
    if (!map.current || !vehicles.length) return;

    // Clear existing vehicle markers
    vehicleMarkers.forEach(marker => marker.remove());

    const newMarkers = vehicles.map(vehicle => {
      if (!vehicle.latitud || !vehicle.longitud) return null;

      // Create custom vehicle marker
      const el = document.createElement('div');
      el.className = 'vehicle-marker';
      el.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg ${
            vehicle.activo ? 'bg-green-500' : 'bg-gray-500'
          }">
            🚌
          </div>
          ${vehicle.activo ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>' : ''}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-primary mb-2">${vehicle.placa}</h3>
          <div class="space-y-1 text-sm">
            <p><strong>Marca:</strong> ${vehicle.marca || 'N/A'}</p>
            <p><strong>Modelo:</strong> ${vehicle.modelo || 'N/A'}</p>
            <p><strong>Estado:</strong> <span class="capitalize ${vehicle.activo ? 'text-green-600' : 'text-red-600'}">${vehicle.activo ? 'Activo' : 'Inactivo'}</span></p>
            <p><strong>Velocidad:</strong> ${vehicle.velocidad} km/h</p>
            <p><strong>Capacidad:</strong> ${vehicle.capacidad_pasajeros || 0} pasajeros</p>
          </div>
          <div class="mt-2 flex items-center gap-2 text-xs">
            <div class="w-2 h-2 rounded-full ${vehicle.activo ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}"></div>
            <span class="text-muted-foreground">${vehicle.activo ? 'En tiempo real' : 'Fuera de servicio'}</span>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([vehicle.longitud, vehicle.latitud])
        .setPopup(popup)
        .addTo(map.current!);

      return marker;
    }).filter(Boolean) as mapboxgl.Marker[];

    setVehicleMarkers(newMarkers);
  }, [vehicles, selectedLayer]);

  // Update paradero markers
  useEffect(() => {
    if (!map.current || !paraderos.length) return;

    // Clear existing paradero markers
    paraderoMarkers.forEach(marker => marker.remove());

    if (selectedLayer !== 'vehicles') {
      const newMarkers = paraderos.map(paradero => {
        const el = document.createElement('div');
        el.className = 'paradero-marker';
        el.innerHTML = `
          <div class="relative">
            <div class="w-6 h-6 rounded-full ${paradero.activo ? 'bg-purple-500' : 'bg-gray-400'} flex items-center justify-center text-white text-xs shadow-lg">
              🚏
            </div>
            ${paradero.pasajeros_esperando && paradero.pasajeros_esperando > 0 ? 
              `<div class="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center">${paradero.pasajeros_esperando}</div>` : 
              ''
            }
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-3 min-w-[200px]">
            <h3 class="font-bold text-primary mb-2">${paradero.nombre}</h3>
            <div class="space-y-1 text-sm">
              <p><strong>Dirección:</strong> ${paradero.direccion || 'No especificada'}</p>
              <p><strong>Estado:</strong> <span class="capitalize ${paradero.activo ? 'text-green-600' : 'text-red-600'}">${paradero.activo ? 'Activo' : 'Inactivo'}</span></p>
              <p><strong>Pasajeros esperando:</strong> ${paradero.pasajeros_esperando || 0}</p>
              <p><strong>Asientos:</strong> ${paradero.tiene_asientos ? 'Sí' : 'No'}</p>
              <p><strong>Techado:</strong> ${paradero.tiene_techado ? 'Sí' : 'No'}</p>
            </div>
            <div class="mt-2 text-xs text-muted-foreground">
              Lat: ${paradero.latitud?.toFixed(6)}, Lng: ${paradero.longitud?.toFixed(6)}
            </div>
          </div>
        `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([paradero.longitud, paradero.latitud])
          .setPopup(popup)
          .addTo(map.current!);

        return marker;
      });

      setParaderoMarkers(newMarkers);
    }
  }, [paraderos, selectedLayer]);

  // Real-time updates simulation
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      // Simulate real-time vehicle movement
      setVehicles(prev => prev.map(vehicle => ({
        ...vehicle,
        latitud: vehicle.latitud ? vehicle.latitud + (Math.random() - 0.5) * 0.001 : vehicle.latitud,
        longitud: vehicle.longitud ? vehicle.longitud + (Math.random() - 0.5) * 0.001 : vehicle.longitud,
        velocidad: Math.max(0, Math.min(80, (vehicle.velocidad || 0) + (Math.random() - 0.5) * 10))
      })));

      // Update paraderos passenger count
      setParaderos(prev => prev.map(paradero => ({
        ...paradero,
        pasajeros_esperando: Math.max(0, Math.floor(Math.random() * 20))
      })));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isRealTime]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/5 rounded-lg" />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <h4 className="font-semibold text-sm mb-2">Leyenda</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">🚌</div>
            <span>Vehículo Activo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">🚌</div>
            <span>Fuera de Servicio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">🚏</div>
            <span>Paradero Activo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">5</div>
            <span>Pasajeros Esperando</span>
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      {isRealTime && (
        <div className="absolute top-4 right-20 bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg">
          <div className="flex items-center gap-2 text-white text-sm">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <span>EN VIVO</span>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-muted-foreground">Vehículos Activos</div>
            <div className="font-semibold text-green-600">{vehicles.filter(v => v.activo).length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Vehículos</div>
            <div className="font-semibold">{vehicles.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Paraderos</div>
            <div className="font-semibold">{paraderos.filter(p => p.activo).length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Pasajeros</div>
            <div className="font-semibold text-orange-600">{paraderos.reduce((acc, p) => acc + (p.pasajeros_esperando || 0), 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapboxMap;