import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { AdminDashboard } from "./AdminDashboard";
import { Paradero } from "./sections/Paradero";
import { Vehiculos } from "./sections/Vehiculos";
import { Conductores } from "./sections/Conductores";

// Placeholder components for other sections  
const Mapa = () => <div className="p-6"><h1 className="text-2xl font-bold">Mapa en Tiempo Real</h1><p className="text-muted-foreground">Próximamente...</p></div>;
const MIRA = () => <div className="p-6"><h1 className="text-2xl font-bold">Sistema MIRA</h1><p className="text-muted-foreground">Próximamente...</p></div>;
const Trabajadores = () => <div className="p-6"><h1 className="text-2xl font-bold">Gestión de Trabajadores</h1><p className="text-muted-foreground">Próximamente...</p></div>;
const Rutas = () => <div className="p-6"><h1 className="text-2xl font-bold">Gestión de Rutas</h1><p className="text-muted-foreground">Próximamente...</p></div>;
const Reportes = () => <div className="p-6"><h1 className="text-2xl font-bold">Reportes y Estadísticas</h1><p className="text-muted-foreground">Próximamente...</p></div>;
const Ajustes = () => <div className="p-6"><h1 className="text-2xl font-bold">Configuración del Sistema</h1><p className="text-muted-foreground">Próximamente...</p></div>;

export default function AdminIndex() {
  return (
    <Routes>
      <Route path="/" element={
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      } />
      <Route path="/paradero" element={
        <AdminLayout>
          <Paradero />
        </AdminLayout>
      } />
      <Route path="/mapa" element={
        <AdminLayout>
          <Mapa />
        </AdminLayout>
      } />
      <Route path="/mira" element={
        <AdminLayout>
          <MIRA />
        </AdminLayout>
      } />
      <Route path="/trabajadores" element={
        <AdminLayout>
          <Trabajadores />
        </AdminLayout>
      } />
      <Route path="/conductores" element={
        <AdminLayout>
          <Conductores />
        </AdminLayout>
      } />
      <Route path="/vehiculos" element={
        <AdminLayout>
          <Vehiculos />
        </AdminLayout>
      } />
      <Route path="/rutas" element={
        <AdminLayout>
          <Rutas />
        </AdminLayout>
      } />
      <Route path="/reportes" element={
        <AdminLayout>
          <Reportes />
        </AdminLayout>
      } />
      <Route path="/ajustes" element={
        <AdminLayout>
          <Ajustes />
        </AdminLayout>
      } />
    </Routes>
  );
}