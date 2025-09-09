import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useParaderos, type Paradero } from "@/hooks/useParaderos";

interface ParaderoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paradero?: Paradero | null;
}

export function ParaderoDialog({ open, onOpenChange, paradero }: ParaderoDialogProps) {
  const { createParadero, updateParadero } = useParaderos();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: paradero?.nombre || '',
    descripcion: paradero?.descripcion || '',
    direccion: paradero?.direccion || '',
    latitud: paradero?.latitud || 0,
    longitud: paradero?.longitud || 0,
    activo: paradero?.activo ?? true,
    tiene_asientos: paradero?.tiene_asientos || false,
    tiene_techado: paradero?.tiene_techado || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || formData.latitud === 0 || formData.longitud === 0) {
      toast({
        title: "Error",
        description: "Nombre, latitud y longitud son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      if (paradero) {
        await updateParadero(paradero.id, formData);
      } else {
        await createParadero(formData);
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
      nombre: '',
      descripcion: '',
      direccion: '',
      latitud: 0,
      longitud: 0,
      activo: true,
      tiene_asientos: false,
      tiene_techado: false,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    if (!paradero) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {paradero ? 'Editar Paradero' : 'Nuevo Paradero'}
          </DialogTitle>
          <DialogDescription>
            {paradero ? 'Modifica los datos del paradero' : 'Agrega un nuevo paradero al sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Plaza Central"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Av. Principal 123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del paradero..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitud">Latitud *</Label>
              <Input
                id="latitud"
                type="number"
                step="0.000001"
                value={formData.latitud}
                onChange={(e) => setFormData({ ...formData, latitud: parseFloat(e.target.value) || 0 })}
                placeholder="-12.046374"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitud">Longitud *</Label>
              <Input
                id="longitud"
                type="number"
                step="0.000001"
                value={formData.longitud}
                onChange={(e) => setFormData({ ...formData, longitud: parseFloat(e.target.value) || 0 })}
                placeholder="-77.042793"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="activo">Activo</Label>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="asientos">Tiene Asientos</Label>
              <Switch
                id="asientos"
                checked={formData.tiene_asientos}
                onCheckedChange={(checked) => setFormData({ ...formData, tiene_asientos: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="techado">Tiene Techado</Label>
              <Switch
                id="techado"
                checked={formData.tiene_techado}
                onCheckedChange={(checked) => setFormData({ ...formData, tiene_techado: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : paradero ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}