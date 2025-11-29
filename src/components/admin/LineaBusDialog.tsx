import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLineasBuses, type LineaBus } from "@/hooks/useLineasBuses";
import { RutaMapDrawer } from "./RutaMapDrawer";
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";

interface LineaBusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineaBus?: LineaBus | null;
}

export function LineaBusDialog({ open, onOpenChange, lineaBus }: LineaBusDialogProps) {
  const { createLineaBus, updateLineaBus } = useLineasBuses();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  const [formData, setFormData] = useState({
    codigo: lineaBus?.codigo || '',
    nombre: lineaBus?.nombre || '',
    descripcion: lineaBus?.descripcion || '',
    distancia_km: lineaBus?.distancia_km || 0,
    tiempo_estimado_minutos: lineaBus?.tiempo_estimado_minutos || 0,
    precio: lineaBus?.precio || 0,
    activo: lineaBus?.activo ?? true,
  });

  useEffect(() => {
    if (lineaBus) {
      setFormData({
        codigo: lineaBus.codigo,
        nombre: lineaBus.nombre,
        descripcion: lineaBus.descripcion || '',
        distancia_km: lineaBus.distancia_km || 0,
        tiempo_estimado_minutos: lineaBus.tiempo_estimado_minutos || 0,
        precio: lineaBus.precio || 0,
        activo: lineaBus.activo,
      });
    }
  }, [lineaBus]);

  const handleRouteChange = (coordinates: [number, number][]) => {
    setRouteCoordinates(coordinates);
    if (coordinates.length > 1) {
      const distance = calculateRouteDistance(coordinates);
      setFormData(prev => ({ ...prev, distancia_km: parseFloat(distance.toFixed(2)) }));
    }
  };

  const calculateRouteDistance = (coords: [number, number][]): number => {
    let totalDistance = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const [lon1, lat1] = coords[i];
      const [lon2, lat2] = coords[i + 1];
      
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      totalDistance += R * c;
    }
    return totalDistance;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El código y nombre de la línea son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      let lineaBusData;
      if (lineaBus) {
        lineaBusData = await updateLineaBus(lineaBus.id, formData);
      } else {
        lineaBusData = await createLineaBus(formData);
      }

      // Save route geometry if coordinates are provided
      if (routeCoordinates.length > 1 && lineaBusData) {
        const lineString = `LINESTRING(${routeCoordinates.map(c => `${c[0]} ${c[1]}`).join(',')})`;
        
        const { error: geometryError } = await supabase
          .from('rutas_geometria')
          .upsert({
            ruta_id: lineaBusData.id,
            geom: lineString
          }, {
            onConflict: 'ruta_id'
          });

        if (geometryError) {
          console.error('Error saving route geometry:', geometryError);
          toast({
            title: "Advertencia",
            description: "La línea se guardó pero hubo un error al guardar el trayecto",
            variant: "destructive"
          });
        }
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      distancia_km: 0,
      tiempo_estimado_minutos: 0,
      precio: 0,
      activo: true,
    });
    setRouteCoordinates([]);
  };

  const handleClose = () => {
    onOpenChange(false);
    if (!lineaBus) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {lineaBus ? 'Editar Línea de Bus' : 'Nueva Línea de Bus'}
          </DialogTitle>
          <DialogDescription>
            {lineaBus ? 'Modifica los datos de la línea de bus' : 'Registra una nueva línea de bus de tu empresa (ej: Línea D, Línea 14)'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="informacion" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="informacion">Información de la Línea</TabsTrigger>
            <TabsTrigger value="trayecto">Trazar Trayecto</TabsTrigger>
          </TabsList>

          <TabsContent value="informacion" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código de la Línea *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="D, 14, A1, etc."
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">Identificador corto de la línea</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precio">Precio (S/.)</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Descriptivo de la Línea *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Centro - Universidad, Terminal - Playa, etc."
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Información adicional sobre la línea..."
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distancia">Distancia (Km)</Label>
                  <Input
                    id="distancia"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.distancia_km}
                    onChange={(e) => setFormData({ ...formData, distancia_km: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Se calcula automáticamente al trazar</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiempo">Tiempo Estimado (min)</Label>
                  <Input
                    id="tiempo"
                    type="number"
                    min="0"
                    value={formData.tiempo_estimado_minutos}
                    onChange={(e) => setFormData({ ...formData, tiempo_estimado_minutos: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="activo">Línea Activa</Label>
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : lineaBus ? 'Actualizar' : 'Crear Línea'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="trayecto" className="mt-4">
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Instrucciones:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Haz clic en el mapa para marcar los puntos del trayecto</li>
                  <li>• Sigue el recorrido real que hace la línea de bus</li>
                  <li>• La distancia se calculará automáticamente</li>
                </ul>
              </div>

              <RutaMapDrawer 
                onRouteChange={handleRouteChange}
                initialRoute={routeCoordinates}
              />

              {routeCoordinates.length > 1 && (
                <div className="flex gap-4">
                  <Badge variant="outline" className="text-sm">
                    {routeCoordinates.length} puntos trazados
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {formData.distancia_km.toFixed(2)} km
                  </Badge>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
