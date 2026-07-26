import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useVehiculos, type Vehiculo } from "@/hooks/useVehiculos";
import { useLineasBuses } from "@/hooks/useLineasBuses";

interface VehiculoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehiculo?: Vehiculo | null;
}

export function VehiculoDialog({ open, onOpenChange, vehiculo }: VehiculoDialogProps) {
  const { createVehiculo, updateVehiculo } = useVehiculos();
  const { lineasBuses } = useLineasBuses();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    placa: vehiculo?.placa || '',
    marca: vehiculo?.marca || '',
    modelo: vehiculo?.modelo || '',
    año: vehiculo?.año || new Date().getFullYear(),
    color: vehiculo?.color || '',
    numero_interno: vehiculo?.numero_interno || '',
    capacidad_pasajeros: vehiculo?.capacidad_pasajeros || 40,
    tiene_gps: vehiculo?.tiene_gps || false,
    tiene_aire: vehiculo?.tiene_aire || false,
    activo: vehiculo?.activo ?? true,
    ruta_id: vehiculo?.ruta_id || '',
  });

  useEffect(() => {
    if (vehiculo) {
      setFormData({
        placa: vehiculo.placa,
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        año: vehiculo.año || new Date().getFullYear(),
        color: vehiculo.color || '',
        numero_interno: vehiculo.numero_interno || '',
        capacidad_pasajeros: vehiculo.capacidad_pasajeros || 40,
        tiene_gps: vehiculo.tiene_gps,
        tiene_aire: vehiculo.tiene_aire,
        activo: vehiculo.activo,
        ruta_id: vehiculo.ruta_id || '',
      });
    }
  }, [vehiculo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa.trim()) {
      toast({
        title: "Error",
        description: "La placa es obligatoria",
        variant: "destructive"
      });
      return;
    }

    if (!formData.ruta_id) {
      toast({
        title: "Error",
        description: "Debes asignar una línea al bus",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      if (vehiculo) {
        await updateVehiculo(vehiculo.id, formData);
      } else {
        await createVehiculo(formData);
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
      placa: '',
      marca: '',
      modelo: '',
      año: new Date().getFullYear(),
      color: '',
      numero_interno: '',
      capacidad_pasajeros: 40,
      tiene_gps: false,
      tiene_aire: false,
      activo: true,
      ruta_id: '',
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    if (!vehiculo) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </DialogTitle>
          <DialogDescription>
            {vehiculo ? 'Modifica los datos del vehículo' : 'Registra un nuevo vehículo en la flota'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ruta">Línea Asignada *</Label>
            <Select
              value={formData.ruta_id}
              onValueChange={(value) => setFormData({ ...formData, ruta_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la línea del bus" />
              </SelectTrigger>
              <SelectContent>
                {lineasBuses.filter(l => l.activo).map((linea) => (
                  <SelectItem key={linea.id} value={linea.id}>
                    Línea {linea.codigo} - {linea.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Cada bus opera en una sola línea
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                placeholder="ABC-123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_interno">Número Interno</Label>
              <Input
                id="numero_interno"
                value={formData.numero_interno}
                onChange={(e) => setFormData({ ...formData, numero_interno: e.target.value })}
                placeholder="001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Mercedes Benz"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="OH1628"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="año">Año</Label>
              <Input
                id="año"
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={formData.año}
                onChange={(e) => setFormData({ ...formData, año: parseInt(e.target.value) || new Date().getFullYear() })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Azul"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidad">Capacidad</Label>
              <Input
                id="capacidad"
                type="number"
                min="10"
                max="100"
                value={formData.capacidad_pasajeros}
                onChange={(e) => setFormData({ ...formData, capacidad_pasajeros: parseInt(e.target.value) || 40 })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gps">Tiene GPS</Label>
              <Switch
                id="gps"
                checked={formData.tiene_gps}
                onCheckedChange={(checked) => setFormData({ ...formData, tiene_gps: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="aire">Aire Acondicionado</Label>
              <Switch
                id="aire"
                checked={formData.tiene_aire}
                onCheckedChange={(checked) => setFormData({ ...formData, tiene_aire: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="activo">Activo</Label>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : vehiculo ? 'Actualizar' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}