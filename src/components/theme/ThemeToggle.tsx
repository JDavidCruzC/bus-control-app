import { Moon, Sun, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useState } from "react";
import { ThemeScheduleDialog } from "./ThemeScheduleDialog";

export function ThemeToggle() {
  const { theme, setTheme, isAutoMode, toggleAutoMode } = useThemeContext();
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Claro</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Oscuro</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Sistema</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleAutoMode}>
            <div className="flex items-center justify-between w-full">
              <span>Automático por hora</span>
              <div className={`w-2 h-2 rounded-full ${isAutoMode ? 'bg-primary' : 'bg-muted-foreground'}`} />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowScheduleDialog(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurar horarios</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ThemeScheduleDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
      />
    </>
  );
}