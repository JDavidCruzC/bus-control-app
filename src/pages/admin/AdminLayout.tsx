import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Bus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [empresaNombre, setEmpresaNombre] = useState<string>("Cargando...");

  useEffect(() => {
    const fetchEmpresaNombre = async () => {
      if (!user) return;
      
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa:empresas(nombre)')
        .eq('id', user.id)
        .single();
      
      if (usuario?.empresa) {
        setEmpresaNombre(usuario.empresa.nombre);
      }
    };

    fetchEmpresaNombre();
  }, [user]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Bus className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Panel de Administración</h1>
                  <p className="text-sm text-muted-foreground">{empresaNombre}</p>
                </div>
              </div>
            </div>
            
            <ThemeToggle />
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}