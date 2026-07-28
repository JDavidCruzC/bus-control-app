import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import WorkerLogin from "@/pages/auth/WorkerLogin";

// ---------------- MOCKS ----------------

const signInWorker = vi.fn();
const signInConductor = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signInWorker,
    signInConductor,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

// ---------------------------------------

describe("WorkerLogin", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el formulario correctamente", () => {

    render(
      <MemoryRouter>
        <WorkerLogin />
      </MemoryRouter>
    );

    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();

    expect(screen.getByText("Administrador")).toBeInTheDocument();

    expect(screen.getByText("Conductor")).toBeInTheDocument();

  });

  it("permite escribir código de administrador", async () => {

    render(
      <MemoryRouter>
        <WorkerLogin />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText("ADM001");

    await userEvent.type(input, "adm001");

    expect(input).toHaveValue("ADM001");

  });

  it("muestra la pestaña de conductor", async () => {

    render(
      <MemoryRouter>
        <WorkerLogin />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText("Conductor"));

    expect(
      screen.getByPlaceholderText("ABC-123")
    ).toBeInTheDocument();

  });

  it("llama al login de administrador cuando los datos son válidos", async () => {

    signInWorker.mockResolvedValue({
      error: null,
    });

    render(
      <MemoryRouter>
        <WorkerLogin />
      </MemoryRouter>
    );

    await userEvent.type(
      screen.getByPlaceholderText("ADM001"),
      "ADM001"
    );

    await userEvent.type(
      screen.getByLabelText("Contraseña"),
      "123456"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /Acceder como Administrador/i,
      })
    );

    expect(signInWorker).toHaveBeenCalled();

  });

  it("muestra mensaje de error cuando el login falla", async () => {

    signInWorker.mockResolvedValue({
      error: {
        message: "Credenciales incorrectas",
      },
    });

    render(
      <MemoryRouter>
        <WorkerLogin />
      </MemoryRouter>
    );

    await userEvent.type(
      screen.getByPlaceholderText("ADM001"),
      "ADM001"
    );

    await userEvent.type(
      screen.getByLabelText("Contraseña"),
      "123456"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /Acceder como Administrador/i,
      })
    );

    expect(
      await screen.findByText("Credenciales incorrectas")
    ).toBeInTheDocument();

  });

});