import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AdminSidebar } from "@/pages/admin/AdminSidebar";

const navigateMock = vi.fn();
const signOutMock = vi.fn();
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
      signOut: signOutMock,
    },
  },
}));

describe("AdminSidebar", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza la sección Control", () => {

    render(
      <MemoryRouter>
        <AdminSidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Control")).toBeInTheDocument();

  });

  it("renderiza la sección Administración", () => {

    render(
      <MemoryRouter>
        <AdminSidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Administración")).toBeInTheDocument();

  });

  it("renderiza la opción Cerrar Sesión", () => {

    render(
      <MemoryRouter>
        <AdminSidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();

  });

  it("ejecuta signOut al cerrar sesión", async () => {

    render(
      <MemoryRouter>
        <AdminSidebar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Cerrar Sesión"));

    expect(signOutMock).toHaveBeenCalled();

  });

  it("redirige al inicio después del logout", async () => {

    render(
      <MemoryRouter>
        <AdminSidebar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Cerrar Sesión"));

    expect(navigateMock).toHaveBeenCalledWith("/");

  });

  it("muestra un mensaje de éxito al cerrar sesión", async () => {

    render(
      <MemoryRouter>
        <AdminSidebar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Cerrar Sesión"));

    expect(toastMock).toHaveBeenCalled();

  });

});