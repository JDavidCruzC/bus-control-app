import { ReactNode, useEffect, useState } from "react";
import { EmpresaSidebar } from "./EmpresaSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";

interface EmpresaLayoutProps {
  children: ReactNode;
}

export function EmpresaLayout({ children }: EmpresaLayoutProps) {
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
        <EmpresaSidebar />
        <main className="flex-1 bg-background">
          <header className="h-16 border-b border-border bg-card flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Módulo Empresa</h2>
                <p className="text-xs text-muted-foreground">{empresaNombre}</p>
              </div>
            </div>
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
