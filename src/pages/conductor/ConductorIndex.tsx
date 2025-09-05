import { Routes, Route } from "react-router-dom";

// Placeholder component para el dashboard del conductor
const ConductorDashboard = () => (
  <div className="min-h-screen bg-background p-6">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        Interfaz del Conductor
      </h1>
      <p className="text-muted-foreground mb-8">
        Bienvenido al panel de control del conductor
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Estado del Viaje</h3>
          <p className="text-muted-foreground">Controla tu viaje actual</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Ubicación GPS</h3>
          <p className="text-muted-foreground">Seguimiento en tiempo real</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Reportes</h3>
          <p className="text-muted-foreground">Informes de tu jornada</p>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Próximamente: Funcionalidades completas para conductores
        </p>
      </div>
    </div>
  </div>
);

export default function ConductorIndex() {
  return (
    <Routes>
      <Route path="/" element={<ConductorDashboard />} />
      {/* Aquí se agregarán más rutas del conductor */}
    </Routes>
  );
}