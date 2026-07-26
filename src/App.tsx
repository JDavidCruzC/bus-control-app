import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { CustomThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import WorkerLogin from "./pages/auth/WorkerLogin";
import ClientAuth from "./pages/auth/ClientAuth";
import PublicIndex from "./pages/public/PublicIndex";
import AdminIndex from "./pages/admin/AdminIndex";
import ConductorIndex from "./pages/conductor/ConductorIndex";
import SuperAdminIndex from "./pages/superadmin/SuperAdminIndex";
import SuperAdminAuth from "./pages/auth/SuperAdminAuth";
import EmpresaAuth from "./pages/empresa/EmpresaAuth";
import EmpresaIndex from "./pages/empresa/EmpresaIndex";
import PublicRoutes from "./pages/PublicRoutes";
import ConsultarRutas from "./pages/public/ConsultarRutas";
import UbicacionTiempoReal from "./pages/public/UbicacionTiempoReal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CustomThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth/trabajadores" element={<WorkerLogin />} />
                <Route path="/auth/clientes" element={<ClientAuth />} />
                <Route path="/auth/superadmin" element={<SuperAdminAuth />} />
                <Route path="/publico/*" element={<PublicIndex />} />
                <Route path="/admin/*" element={<AdminIndex />} />
                <Route path="/superadmin/*" element={<SuperAdminIndex />} />
                <Route path="/empresa/auth" element={<EmpresaAuth />} />
                <Route path="/empresa/*" element={<EmpresaIndex />} />
                <Route path="/conductor/*" element={<ConductorIndex />} />
                <Route path="/rutas-publicas" element={<PublicRoutes />} />
                <Route path="/consultar-rutas" element={<ConsultarRutas />} />
                <Route path="/ubicacion-tiempo-real" element={<UbicacionTiempoReal />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
