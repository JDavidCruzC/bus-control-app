import { Routes, Route } from "react-router-dom";
import { EmpresaLayout } from "./EmpresaLayout";
import { EmpresaDashboard } from "./EmpresaDashboard";
import { GestionUsuarios } from "./sections/GestionUsuarios";

export default function EmpresaIndex() {
  return (
    <Routes>
      <Route path="/" element={
        <EmpresaLayout>
          <EmpresaDashboard />
        </EmpresaLayout>
      } />
      <Route path="/dashboard" element={
        <EmpresaLayout>
          <EmpresaDashboard />
        </EmpresaLayout>
      } />
      <Route path="/usuarios" element={
        <EmpresaLayout>
          <GestionUsuarios />
        </EmpresaLayout>
      } />
    </Routes>
  );
}
