import { Routes, Route } from "react-router-dom";
import PublicRoutes from "../PublicRoutes";
import ConsultarRutas from "./ConsultarRutas";
import UbicacionTiempoReal from "./UbicacionTiempoReal";

export default function PublicIndex() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoutes />} />
      <Route path="/rutas" element={<ConsultarRutas />} />
      <Route path="/ubicacion" element={<UbicacionTiempoReal />} />
    </Routes>
  );
}