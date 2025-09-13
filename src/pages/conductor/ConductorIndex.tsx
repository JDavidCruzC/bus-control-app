import { Routes, Route } from "react-router-dom";
import ConductorDashboard from "./ConductorDashboard";

export default function ConductorIndex() {
  return (
    <Routes>
      <Route path="/" element={<ConductorDashboard />} />
      {/* Aquí se agregarán más rutas del conductor */}
    </Routes>
  );
}