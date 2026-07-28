import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/pages/admin/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";

// --------------------
// Mock matchMedia
// --------------------

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// --------------------
// Mocks
// --------------------

const navigateMock = vi.fn();
const toastMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({
      pathname: "/admin",
    }),
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({
        error: null,
      }),
    },
  },
}));

// --------------------
// Helper
// --------------------

const renderComponent = () =>
  render(
    <MemoryRouter>
      <SidebarProvider>
        <AdminSidebar />
      </SidebarProvider>
    </MemoryRouter>
  );

// --------------------
// Tests
// --------------------

describe("AdminSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza la sección Control", () => {
    renderComponent();

    expect(screen.getByText("Control")).toBeInTheDocument();
  });

  it("renderiza la sección Administración", () => {
    renderComponent();

    expect(screen.getByText("Administración")).toBeInTheDocument();
  });

  it("renderiza la opción Cerrar Sesión", () => {
    renderComponent();

    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
  });

  it("ejecuta signOut al cerrar sesión", async () => {
    renderComponent();

    fireEvent.click(screen.getByText("Cerrar Sesión"));

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  it("redirige al inicio después del logout", async () => {
    renderComponent();

    fireEvent.click(screen.getByText("Cerrar Sesión"));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  it("muestra un mensaje de éxito al cerrar sesión", async () => {
    renderComponent();

    fireEvent.click(screen.getByText("Cerrar Sesión"));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalled();
    });
  });
});