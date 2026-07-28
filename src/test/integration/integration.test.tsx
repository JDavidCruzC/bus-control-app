import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

// ---------------- MOCKS ----------------

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
      }),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
      signOut: vi.fn(),
    },
  },
}));

vi.mock("@/contexts/AuthContext", async () => {
  const actual = await vi.importActual<any>("@/contexts/AuthContext");

  return {
    ...actual,
    useAuth: () => ({
      user: null,
      session: null,
      userRole: null,
      userType: null,
      userData: null,
      loading: false,
      signInWorker: vi.fn(),
      signInConductor: vi.fn(),
      signInClient: vi.fn(),
      signInEmpresa: vi.fn(),
      signInSuperAdmin: vi.fn(),
      signUpClient: vi.fn(),
      signOut: vi.fn(),
    }),
  };
});

// ---------------- TESTS ----------------

describe("Integración - App", () => {
  it("renderiza la pantalla principal correctamente", () => {
    render(<App />);

    expect(
      screen.getByText("Sistema Multi-Empresa de Transporte")
    ).toBeInTheDocument();
  });

  it("muestra el botón Ver Rutas Disponibles", () => {
    render(<App />);

    expect(
      screen.getByRole("button", {
        name: /Ver Rutas Disponibles/i,
      })
    ).toBeInTheDocument();
  });

  it("muestra el botón Portal Empresas", () => {
    render(<App />);

    expect(
      screen.getByRole("button", {
        name: /Portal Empresas/i,
      })
    ).toBeInTheDocument();
  });

  it("muestra el botón Super Admin", () => {
    render(<App />);

    expect(
      screen.getByRole("button", {
        name: /Super Admin/i,
      })
    ).toBeInTheDocument();
  });

  it("muestra el botón Acceso Trabajadores", () => {
    render(<App />);

    expect(
      screen.getByRole("button", {
        name: /Acceso Trabajadores/i,
      })
    ).toBeInTheDocument();
  });
});