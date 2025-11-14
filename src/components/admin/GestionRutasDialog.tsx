import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useParaderos } from "@/hooks/useParaderos";
import { useRutas } from "@/hooks/useRutas";
import { useRutasConGeometria } from "@/hooks/useRutasConGeometria";
import { RutaMapDrawer } from "./RutaMapDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Route, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GestionRutasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GestionRutasDialog({ open, onOpenChange }: GestionRutasDialogProps) {
  const { toast } = useToast();
  const { paraderos } = useParaderos();
  const { rutas } = useRutas();
  const { createRutaGeom, updateRutaGeom } = useRutasConGeometria();
  const [selectedRutaId, setSelectedRutaId] = useState<string>('');
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [selectedParaderos, setSelectedParaderos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRouteChange = (coordinates: [number, number][]) => {
    setRouteCoordinates(coordinates);
    
    // Detectar paraderos cercanos a la ruta
    const nearby = paraderos.filter(p => {
      return coordinates.some(coord => {
        const distance = calculateDistance(
          coord[1], coord[0],
          p.latitud, p.longitud
        );
        return distance < 0.1; // 100 metros de tolerancia
      });
    });
    
    setSelectedParaderos(nearby.map(p => p.id));
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSave = async () => {
    if (!selectedRutaId) {
      toast({
        title: "Error",
        description: "Selecciona una ruta",
        variant: "destructive"
      });
      return;
    }

    if (routeCoordinates.length < 2) {
      toast({
        title: "Error",
        description: "Debes trazar una ruta válida con al menos 2 puntos",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Guardar geometría de la ruta
      await createRutaGeom(selectedRutaId, routeCoordinates);
      
      // Asociar paraderos a la ruta
      // TODO: Implementar lógica para guardar en rutas_paraderos
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRutaId('');
    setRouteCoordinates([]);
    setSelectedParaderos([]);
  };

  const selectedRuta = rutas.find(r => r.id === selectedRutaId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            Gestionar Ruta Completa
          </DialogTitle>
          <DialogDescription>
            Selecciona una ruta y traza su recorrido en el mapa. Los paraderos cercanos se detectarán automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selector de Ruta */}
          <div className="space-y-2">
            <Label>Seleccionar Ruta</Label>
            <Select value={selectedRutaId} onValueChange={setSelectedRutaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una ruta" />
              </SelectTrigger>
              <SelectContent>
                {rutas.map(ruta => (
                  <SelectItem key={ruta.id} value={ruta.id}>
                    {ruta.codigo} - {ruta.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRuta && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedRuta.nombre}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRuta.codigo}</p>
                  </div>
                  <Badge variant={selectedRuta.activo ? "default" : "secondary"}>
                    {selectedRuta.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mapa para trazar ruta */}
          <div className="space-y-2">
            <Label>Trazar Ruta en el Mapa</Label>
            <div className="border rounded-lg overflow-hidden">
              <RutaMapDrawer
                onRouteChange={handleRouteChange}
                initialRoute={routeCoordinates}
              />
            </div>
            {routeCoordinates.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {routeCoordinates.length} puntos trazados
              </p>
            )}
          </div>

          {/* Paraderos detectados */}
          {selectedParaderos.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Paraderos Detectados en la Ruta ({selectedParaderos.length})
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {paraderos
                  .filter(p => selectedParaderos.includes(p.id))
                  .map(paradero => (
                    <div
                      key={paradero.id}
                      className="flex items-center gap-2 p-2 border rounded-lg bg-card"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{paradero.nombre}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading || !selectedRutaId || routeCoordinates.length < 2}
          >
            {loading ? "Guardando..." : "Guardar Ruta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
