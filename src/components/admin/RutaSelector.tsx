import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRutas } from "@/hooks/useRutas";
import { MapPin } from "lucide-react";

interface RutaSelectorProps {
  value: string;
  onChange: (rutaId: string) => void;
  label?: string;
  placeholder?: string;
  showDescription?: boolean;
}

export function RutaSelector({ 
  value, 
  onChange, 
  label = "Ruta", 
  placeholder = "Selecciona una ruta",
  showDescription = false 
}: RutaSelectorProps) {
  const { rutas, loading } = useRutas();

  const activeRutas = rutas.filter(r => r.activo);

  return (
    <div className="space-y-2">
      <Label htmlFor="ruta-selector" className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={loading}
      >
        <SelectTrigger id="ruta-selector">
          <SelectValue placeholder={loading ? "Cargando rutas..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {activeRutas.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No hay rutas disponibles. Crea una ruta primero.
            </div>
          ) : (
            activeRutas.map((ruta) => (
              <SelectItem key={ruta.id} value={ruta.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{ruta.codigo} - {ruta.nombre}</span>
                  {showDescription && ruta.descripcion && (
                    <span className="text-xs text-muted-foreground">{ruta.descripcion}</span>
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
