import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  Users, 
  Settings, 
  LogOut,
  Home,
  CreditCard,
  ArrowRight
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const menuItems = [
  { title: "Dashboard", url: "/empresa/dashboard", icon: Home },
  { title: "Gestión de Usuarios", url: "/empresa/usuarios", icon: Users },
  { title: "Mi Membresía", url: "/empresa/membresia", icon: CreditCard },
];

export function EmpresaSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, userData } = useAuth();
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesión cerrada exitosamente");
    navigate("/");
  };

  const goToAdmin = () => {
    navigate("/admin");
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        {/* Company Info */}
        {!collapsed && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{userData?.empresa?.nombre || "Mi Empresa"}</p>
                <p className="text-xs text-muted-foreground">Panel de Gerencia</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestión Empresarial</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Access Admin Module */}
        <SidebarGroup>
          <SidebarGroupLabel>Acceso Rápido</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <Button 
                onClick={goToAdmin}
                variant="outline" 
                className="w-full justify-start gap-2"
                size={collapsed ? "icon" : "default"}
              >
                <ArrowRight className="h-4 w-4" />
                {!collapsed && <span>Ir a Operaciones</span>}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings & Logout */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/empresa/configuracion" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>Configuración</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Cerrar Sesión</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
