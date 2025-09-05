import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Bus } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
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
                  <h1 className="text-lg font-semibold text-foreground">Bus Control</h1>
                  <p className="text-sm text-muted-foreground">Bahía del Sur</p>
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