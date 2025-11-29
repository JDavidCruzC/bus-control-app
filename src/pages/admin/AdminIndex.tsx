import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { AdminDashboard } from "./AdminDashboard";
import { Paradero } from "./sections/Paradero";
import { Vehiculos } from "./sections/Vehiculos";
import { Conductores } from "./sections/Conductores";
import { LineasBuses } from "./sections/LineasBuses";
import { Trabajadores } from "./sections/Trabajadores";
import { Reportes } from "./sections/Reportes";
import { Mapa } from "./sections/Mapa";
import { MIRA } from "./sections/MIRA";
import { Ajustes } from "./sections/Ajustes";
import { Desvios } from "./sections/Desvios";

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
      <Route path="/lineas" element={
        <AdminLayout>
          <LineasBuses />
        </AdminLayout>
      } />
      <Route path="/reportes" element={
        <AdminLayout>
          <Reportes />
        </AdminLayout>
      } />
      <Route path="/desvios" element={
        <AdminLayout>
          <Desvios />
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