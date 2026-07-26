import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLineasBuses } from "@/hooks/useLineasBuses";
import { Bus } from "lucide-react";

interface LineaBusSelectorProps {
  value: string;
  onChange: (lineaBusId: string) => void;
  label?: string;
  placeholder?: string;
  showDescription?: boolean;
}

export function LineaBusSelector({ 
  value, 
  onChange, 
  label = "Línea de Bus", 
  placeholder = "Selecciona una línea",
  showDescription = false 
}: LineaBusSelectorProps) {
  const { lineasBuses, loading } = useLineasBuses();

  const activeLineas = lineasBuses.filter(l => l.activo);

  return (
    <div className="space-y-2">
      <Label htmlFor="linea-bus-selector" className="flex items-center gap-2">
        <Bus className="h-4 w-4 text-primary" />
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={loading}
      >
        <SelectTrigger id="linea-bus-selector">
          <SelectValue placeholder={loading ? "Cargando líneas..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {activeLineas.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No hay líneas disponibles. Crea una línea primero.
            </div>
          ) : (
            activeLineas.map((linea) => (
              <SelectItem key={linea.id} value={linea.id}>
                <div className="flex flex-col">
                  <span className="font-medium">Línea {linea.codigo} - {linea.nombre}</span>
                  {showDescription && linea.descripcion && (
                    <span className="text-xs text-muted-foreground">{linea.descripcion}</span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
