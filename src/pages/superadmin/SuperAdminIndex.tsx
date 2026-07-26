import { Routes, Route } from "react-router-dom";
import { SuperAdminLayout } from "./SuperAdminLayout";
import { SuperAdminDashboard } from "./SuperAdminDashboard";
import { GestionEmpresas } from "./sections/GestionEmpresas";
import { GestionMembresias } from "./sections/GestionMembresias";
import { GestionPagos } from "./sections/GestionPagos";
import { GestionAPIs } from "./sections/GestionAPIs";

export default function SuperAdminIndex() {
  return (
    <Routes>
      <Route path="/" element={
        <SuperAdminLayout>
          <SuperAdminDashboard />
        </SuperAdminLayout>
      } />
      <Route path="/empresas" element={
        <SuperAdminLayout>
          <GestionEmpresas />
        </SuperAdminLayout>
      } />
      <Route path="/membresias" element={
        <SuperAdminLayout>
          <GestionMembresias />
        </SuperAdminLayout>
      } />
      <Route path="/pagos" element={
        <SuperAdminLayout>
          <GestionPagos />
        </SuperAdminLayout>
      } />
      <Route path="/apis" element={
        <SuperAdminLayout>
          <GestionAPIs />
        </SuperAdminLayout>
      } />
    </Routes>
  );
}