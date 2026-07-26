import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLineasBuses } from "@/hooks/useLineasBuses";

interface MapConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRoute: string | null;
  onRouteChange: (routeId: string | null) => void;
}

export function MapConfigDialog({ open, onOpenChange, selectedRoute, onRouteChange }: MapConfigDialogProps) {
  const { lineasBuses } = useLineasBuses();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Vista del Mapa</DialogTitle>
          <DialogDescription>
            Selecciona qué línea de bus deseas visualizar en el mapa
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Filtrar por Línea</Label>
            <Select value={selectedRoute || "todas"} onValueChange={(value) => onRouteChange(value === "todas" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar línea" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las líneas</SelectItem>
                {lineasBuses.filter(l => l.activo).map((linea) => (
                  <SelectItem key={linea.id} value={linea.id}>
                    Línea {linea.codigo} - {linea.nombre}
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
