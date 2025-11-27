import { ReactNode } from "react";
import { EmpresaSidebar } from "./EmpresaSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface EmpresaLayoutProps {
  children: ReactNode;
}

export function EmpresaLayout({ children }: EmpresaLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <EmpresaSidebar />
        <main className="flex-1 bg-background">
          <header className="h-16 border-b border-border bg-card flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-xl font-semibold text-foreground">Módulo Empresa</h2>
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
