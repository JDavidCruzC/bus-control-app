import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface ThemeSchedule {
  lightStart: string; // Formato HH:mm
  darkStart: string;  // Formato HH:mm
  enabled: boolean;
}

interface ThemeContextType {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  schedule: ThemeSchedule;
  updateSchedule: (schedule: ThemeSchedule) => void;
  isAutoMode: boolean;
  toggleAutoMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_SCHEDULE: ThemeSchedule = {
  lightStart: '06:00',
  darkStart: '18:00',
  enabled: false
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
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
      
      if (theme !== expectedTheme) {
        setTheme(expectedTheme);
        console.log(`Auto theme change: ${expectedTheme} at ${currentTime}`);
      }
    };

    // Verificar inmediatamente
    checkAndUpdateTheme();

    // Verificar cada minuto
    const interval = setInterval(checkAndUpdateTheme, 60000);

    return () => clearInterval(interval);
  }, [isAutoMode, schedule, theme, setTheme]);

  const updateSchedule = (newSchedule: ThemeSchedule) => {
    setSchedule(newSchedule);
    localStorage.setItem('theme-schedule', JSON.stringify(newSchedule));
    
    // Si el modo automático está habilitado y el nuevo schedule también, verificar tema inmediatamente
    if (isAutoMode && newSchedule.enabled) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const shouldBeInDarkMode = shouldBeDark(currentTime, newSchedule);
      const expectedTheme = shouldBeInDarkMode ? 'dark' : 'light';
      
      if (theme !== expectedTheme) {
        setTheme(expectedTheme);
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
      const expectedTheme = shouldBeInDarkMode ? 'dark' : 'light';
      
      if (theme !== expectedTheme) {
        setTheme(expectedTheme);
      }
    }
  };

  const value = {
    theme,
    setTheme,
    schedule,
    updateSchedule,
    isAutoMode,
    toggleAutoMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}