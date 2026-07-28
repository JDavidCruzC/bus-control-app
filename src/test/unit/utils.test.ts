import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Utilidad cn()", () => {

  it("une múltiples clases CSS", () => {

    expect(
      cn("flex", "items-center", "justify-between")
    ).toBe("flex items-center justify-between");

  });

  it("ignora valores undefined, false y null", () => {

    expect(
      cn(
        "flex",
        undefined,
        false,
        null,
        "justify-center"
      )
    ).toBe("flex justify-center");

  });

  it("fusiona correctamente clases conflictivas de Tailwind", () => {

    expect(
      cn(
        "p-2",
        "p-4"
      )
    ).toBe("p-4");

  });

  it("permite combinar clases condicionales", () => {

    const activo = true;

    expect(
      cn(
        "flex",
        activo && "bg-blue-500",
        !activo && "bg-red-500"
      )
    ).toBe("flex bg-blue-500");

  });

  it("retorna una cadena vacía cuando no recibe argumentos", () => {

    expect(
      cn()
    ).toBe("");

  });

});