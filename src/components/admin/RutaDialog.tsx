import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useRutas, type Ruta } from "@/hooks/useRutas";

interface RutaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruta?: Ruta | null;
}

export function RutaDialog({ open, onOpenChange, ruta }: RutaDialogProps) {
  const { createRuta, updateRuta } = useRutas();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    codigo: ruta?.codigo || '',
    nombre: ruta?.nombre || '',
    descripcion: ruta?.descripcion || '',
    distancia_km: ruta?.distancia_km || 0,
    tiempo_estimado_minutos: ruta?.tiempo_estimado_minutos || 60,
    precio: ruta?.precio || 0,
    activo: ruta?.activo ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "Código y nombre son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      if (ruta) {
        await updateRuta(ruta.id, formData);
      } else {
        await createRuta(formData);
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
      tiempo_estimado_minutos: 60,
      precio: 0,
      activo: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    if (!ruta) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {ruta ? 'Editar Ruta' : 'Nueva Ruta'}
          </DialogTitle>
          <DialogDescription>
            {ruta ? 'Modifica los datos de la ruta' : 'Crea una nueva ruta de transporte'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                placeholder="R001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio (S/.)</Label>
              <Input
                id="precio"
                type="number"
                step="0.50"
                min="0"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                placeholder="2.50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Centro - Universidad"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción de la ruta..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distancia">Distancia (Km)</Label>
              <Input
                id="distancia"
                type="number"
                step="0.1"
                min="0"
                value={formData.distancia_km}
                onChange={(e) => setFormData({ ...formData, distancia_km: parseFloat(e.target.value) || 0 })}
                placeholder="15.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiempo">Tiempo Est. (min)</Label>
              <Input
                id="tiempo"
                type="number"
                min="10"
                value={formData.tiempo_estimado_minutos}
                onChange={(e) => setFormData({ ...formData, tiempo_estimado_minutos: parseInt(e.target.value) || 60 })}
                placeholder="45"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="activo">Activo</Label>
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
              {loading ? 'Guardando...' : ruta ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}