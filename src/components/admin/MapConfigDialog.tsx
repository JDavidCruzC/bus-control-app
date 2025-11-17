import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRutas } from "@/hooks/useRutas";

interface MapConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRoute: string | null;
  onRouteChange: (routeId: string | null) => void;
}

export function MapConfigDialog({ open, onOpenChange, selectedRoute, onRouteChange }: MapConfigDialogProps) {
  const { rutas } = useRutas();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Vista del Mapa</DialogTitle>
          <DialogDescription>
            Selecciona qué ruta deseas visualizar en el mapa
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Filtrar por Ruta</Label>
            <Select value={selectedRoute || "todas"} onValueChange={(value) => onRouteChange(value === "todas" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ruta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las rutas</SelectItem>
                {rutas.filter(r => r.activo).map((ruta) => (
                  <SelectItem key={ruta.id} value={ruta.id}>
                    {ruta.codigo} - {ruta.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
