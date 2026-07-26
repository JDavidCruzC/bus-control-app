import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeSchedule {
  lightStart: string; // Formato HH:mm
  darkStart: string;  // Formato HH:mm
  enabled: boolean;
}

interface CustomThemeContextType {
  schedule: ThemeSchedule;
  updateSchedule: (schedule: ThemeSchedule) => void;
  isAutoMode: boolean;
  toggleAutoMode: () => void;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

const DEFAULT_SCHEDULE: ThemeSchedule = {
  lightStart: '06:00',
  darkStart: '18:00',
  enabled: false
};

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [schedule, setSchedule] = useState<ThemeSchedule>(DEFAULT_SCHEDULE);
  const [isAutoMode, setIsAutoMode] = useState(false);

  // Cargar configuración del localStorage al iniciar
  useEffect(() => {
    const savedSchedule = localStorage.getItem('theme-schedule');
    const savedAutoMode = localStorage.getItem('theme-auto-mode');
    
    if (savedSchedule) {
      try {
        setSchedule(JSON.parse(savedSchedule));
      } catch (error) {
        console.error('Error parsing saved schedule:', error);
      }
    }
    
    if (savedAutoMode) {
      setIsAutoMode(JSON.parse(savedAutoMode));
    }
  }, []);

  // Función para determinar si debería estar en modo oscuro según la hora
  const shouldBeDark = (currentTime: string, schedule: ThemeSchedule): boolean => {
    const current = timeToMinutes(currentTime);
    const lightStart = timeToMinutes(schedule.lightStart);
    const darkStart = timeToMinutes(schedule.darkStart);

    if (lightStart < darkStart) {
      // Caso normal: light 6:00 - dark 18:00
      return current >= darkStart || current < lightStart;
    } else {
      // Caso especial: light 18:00 - dark 6:00 (horario nocturno)
      return current >= darkStart && current < lightStart;
    }
  };

  // Convertir tiempo HH:mm a minutos desde medianoche
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Verificar y aplicar cambio automático de tema
  useEffect(() => {
    if (!isAutoMode || !schedule.enabled) return;

    const checkAndUpdateTheme = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:mm
      
      const shouldBeInDarkMode = shouldBeDark(currentTime, schedule);
      const expectedTheme = shouldBeInDarkMode ? 'dark' : 'light';
      
      // Aplicar el tema directamente al document
      if (expectedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      console.log(`Auto theme change: ${expectedTheme} at ${currentTime}`);
    };

    // Verificar inmediatamente
    checkAndUpdateTheme();

    // Verificar cada minuto
    const interval = setInterval(checkAndUpdateTheme, 60000);

    return () => clearInterval(interval);
  }, [isAutoMode, schedule]);

  const updateSchedule = (newSchedule: ThemeSchedule) => {
    setSchedule(newSchedule);
    localStorage.setItem('theme-schedule', JSON.stringify(newSchedule));
    
    // Si el modo automático está habilitado y el nuevo schedule también, verificar tema inmediatamente
    if (isAutoMode && newSchedule.enabled) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const shouldBeInDarkMode = shouldBeDark(currentTime, newSchedule);
      
      if (shouldBeInDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const toggleAutoMode = () => {
    const newAutoMode = !isAutoMode;
    setIsAutoMode(newAutoMode);
    localStorage.setItem('theme-auto-mode', JSON.stringify(newAutoMode));
    
    // Si se habilita el modo automático, verificar tema inmediatamente
    if (newAutoMode && schedule.enabled) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const shouldBeInDarkMode = shouldBeDark(currentTime, schedule);
      
      if (shouldBeInDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const value = {
    schedule,
    updateSchedule,
    isAutoMode,
    toggleAutoMode
  };

  return (
    <CustomThemeContext.Provider value={value}>
      {children}
    </CustomThemeContext.Provider>
  );
}

export function useCustomTheme() {
  const context = useContext(CustomThemeContext);
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
}