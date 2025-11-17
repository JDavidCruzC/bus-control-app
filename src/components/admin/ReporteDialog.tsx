import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

interface ReporteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReporteDialog({ open, onOpenChange }: ReporteDialogProps) {
  const { toast } = useToast();
  const [tipoReporte, setTipoReporte] = useState("vehiculos");
  const [periodo, setPeriodo] = useState("mes");

  const handleGenerar = () => {
    toast({
      title: "Generando Informe",
      description: `Informe de ${tipoReporte} del último ${periodo} en proceso...`,
    });
    // Aquí iría la lógica real de generación de reportes
    setTimeout(() => {
      toast({
        title: "Informe Generado",
        description: "El informe ha sido descargado correctamente",
      });
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar Informe</DialogTitle>
          <DialogDescription>
            Selecciona el tipo de informe y el período que deseas generar
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de Informe</Label>
            <Select value={tipoReporte} onValueChange={setTipoReporte}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vehiculos">Buses</SelectItem>
                <SelectItem value="conductores">Conductores</SelectItem>
                <SelectItem value="rutas">Rutas</SelectItem>
                <SelectItem value="paraderos">Paraderos</SelectItem>
                <SelectItem value="reportes">Reportes de Incidencias</SelectItem>
                <SelectItem value="general">Informe General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Última Semana</SelectItem>
                <SelectItem value="mes">Último Mes</SelectItem>
                <SelectItem value="trimestre">Último Trimestre</SelectItem>
                <SelectItem value="año">Último Año</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerar} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Generar y Descargar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
