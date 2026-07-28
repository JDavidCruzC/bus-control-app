import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const useStatsMock = vi.fn();

vi.mock("@/hooks/useStats", () => ({
  useStats: () => useStatsMock(),
}));

describe("AdminDashboard", () => {

  beforeEach(() => {

    vi.clearAllMocks();

  });

  it("renderiza correctamente el título principal", () => {

    useStatsMock.mockReturnValue({
      loading: false,
      stats: {
        vehiculosActivos: 10,
        totalVehiculos: 15,
        conductoresActivos: 8,
        totalConductores: 10,
        rutasActivas: 5,
        totalRutas: 6,
        paraderosActivos: 20,
        totalParaderos: 20,
        viajesHoy: 35,
        reportesPendientes: 2,
      },
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Dashboard Administrador")
    ).toBeInTheDocument();

  });

  it("muestra las acciones rápidas", () => {

    useStatsMock.mockReturnValue({
      loading: false,
      stats: {
        vehiculosActivos: 10,
        totalVehiculos: 15,
        conductoresActivos: 8,
        totalConductores: 10,
        rutasActivas: 5,
        totalRutas: 6,
        paraderosActivos: 20,
        totalParaderos: 20,
        viajesHoy: 35,
        reportesPendientes: 0,
      },
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Ver Paraderos")).toBeInTheDocument();

    expect(screen.getByText("Monitoreo en Vivo")).toBeInTheDocument();

    expect(screen.getByText("Gestión de Personal")).toBeInTheDocument();

    expect(screen.getByText("Reportes")).toBeInTheDocument();

  });

  it("muestra estadísticas cuando loading es false", () => {

    useStatsMock.mockReturnValue({
      loading: false,
      stats: {
        vehiculosActivos: 12,
        totalVehiculos: 20,
        conductoresActivos: 9,
        totalConductores: 11,
        rutasActivas: 7,
        totalRutas: 8,
        paraderosActivos: 15,
        totalParaderos: 18,
        viajesHoy: 60,
        reportesPendientes: 0,
      },
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("12")).toBeInTheDocument();

    expect(screen.getByText("9")).toBeInTheDocument();

    expect(screen.getByText("7")).toBeInTheDocument();

  });

  it("muestra la alerta de reportes pendientes", () => {

    useStatsMock.mockReturnValue({
      loading: false,
      stats: {
        vehiculosActivos: 10,
        totalVehiculos: 20,
        conductoresActivos: 10,
        totalConductores: 10,
        rutasActivas: 5,
        totalRutas: 5,
        paraderosActivos: 12,
        totalParaderos: 12,
        viajesHoy: 15,
        reportesPendientes: 3,
      },
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Reportes Pendientes")
    ).toBeInTheDocument();

  });

  it("navega al pulsar Ver Paraderos", () => {

    useStatsMock.mockReturnValue({
      loading: false,
      stats: {
        vehiculosActivos: 10,
        totalVehiculos: 20,
        conductoresActivos: 10,
        totalConductores: 10,
        rutasActivas: 5,
        totalRutas: 5,
        paraderosActivos: 12,
        totalParaderos: 12,
        viajesHoy: 15,
        reportesPendientes: 0,
      },
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getAllByText("Acceder")[0]
    );

    expect(navigateMock).toHaveBeenCalledWith("/admin/paradero");

  });

  it("muestra skeletons mientras carga la información", () => {

    useStatsMock.mockReturnValue({
      loading: true,
      stats: {},
    });

    const { container } = render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);

  });

});