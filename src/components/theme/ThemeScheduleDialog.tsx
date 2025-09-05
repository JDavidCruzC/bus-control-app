import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Sun, Moon, Clock } from "lucide-react";

interface ThemeScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeScheduleDialog({ open, onOpenChange }: ThemeScheduleDialogProps) {
  const { schedule, updateSchedule } = useThemeContext();
  const [localSchedule, setLocalSchedule] = useState(schedule);

  useEffect(() => {
    setLocalSchedule(schedule);
  }, [schedule]);

  const handleSave = () => {
    updateSchedule(localSchedule);
    onOpenChange(false);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const getNextThemeChange = () => {
    if (!localSchedule.enabled) return null;
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentMinutes = timeToMinutes(currentTime);
    const lightMinutes = timeToMinutes(localSchedule.lightStart);
    const darkMinutes = timeToMinutes(localSchedule.darkStart);
    
    const times = [
      { time: localSchedule.lightStart, theme: 'light', minutes: lightMinutes },
      { time: localSchedule.darkStart, theme: 'dark', minutes: darkMinutes }
    ].sort((a, b) => a.minutes - b.minutes);
    
    // Encontrar el próximo cambio
    for (const change of times) {
      if (change.minutes > currentMinutes) {
        return change;
      }
    }
    
    // Si no hay ninguno hoy, el próximo es el primero de mañana
    return times[0];
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const nextChange = getNextThemeChange();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configuración de Temas Automáticos
          </DialogTitle>
          <DialogDescription>
            Configura los horarios para cambiar automáticamente entre tema claro y oscuro.
            Perfecto para conductores que necesitan menos brillo durante la noche.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado actual */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Estado Actual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hora actual:</span>
                <span className="font-mono">{getCurrentTime()}</span>
              </div>
              {nextChange && localSchedule.enabled && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Próximo cambio:</span>
                  <div className="flex items-center gap-2">
                    {nextChange.theme === 'light' ? (
                      <Sun className="h-3 w-3" />
                    ) : (
                      <Moon className="h-3 w-3" />
                    )}
                    <span className="font-mono">{nextChange.time}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuración */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-schedule" className="text-base">
                Activar cambio automático
              </Label>
              <Switch
                id="enable-schedule"
                checked={localSchedule.enabled}
                onCheckedChange={(checked) =>
                  setLocalSchedule({ ...localSchedule, enabled: checked })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="light-start" className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Tema Claro (Día)
                </Label>
                <Input
                  id="light-start"
                  type="time"
                  value={localSchedule.lightStart}
                  onChange={(e) =>
                    setLocalSchedule({ ...localSchedule, lightStart: e.target.value })
                  }
                  disabled={!localSchedule.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dark-start" className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Tema Oscuro (Noche)
                </Label>
                <Input
                  id="dark-start"
                  type="time"
                  value={localSchedule.darkStart}
                  onChange={(e) =>
                    setLocalSchedule({ ...localSchedule, darkStart: e.target.value })
                  }
                  disabled={!localSchedule.enabled}
                />
              </div>
            </div>
          </div>

          {/* Presets comunes */}
          <div className="space-y-3">
            <Label className="text-sm">Configuraciones predefinidas:</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setLocalSchedule({
                    ...localSchedule,
                    lightStart: '06:00',
                    darkStart: '18:00',
                    enabled: true
                  })
                }
              >
                Estándar (6:00 - 18:00)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setLocalSchedule({
                    ...localSchedule,
                    lightStart: '07:00',
                    darkStart: '19:00',
                    enabled: true
                  })
                }
              >
                Verano (7:00 - 19:00)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setLocalSchedule({
                    ...localSchedule,
                    lightStart: '05:30',
                    darkStart: '17:30',
                    enabled: true
                  })
                }
              >
                Invierno (5:30 - 17:30)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setLocalSchedule({
                    ...localSchedule,
                    lightStart: '20:00',
                    darkStart: '04:00',
                    enabled: true
                  })
                }
              >
                Nocturno (20:00 - 4:00)
              </Button>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Guardar Configuración
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}