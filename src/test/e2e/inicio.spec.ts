import { test, expect } from "@playwright/test";

test.describe("Página de inicio", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", {
      waitUntil: "domcontentloaded",
    });
  });

  test("carga correctamente", async ({ page }) => {
    //await expect(page).toHaveTitle(/Bus/i);
    await expect(page).toHaveTitle(/SMET/i);

    await expect(
      page.getByRole("heading", {
        name: /Sistema Multi-Empresa de Transporte/i,
      })
    ).toBeVisible();
  });

  test("muestra los botones principales", async ({ page }) => {
    await expect(
      page.getByRole("button", {
        name: /Ver Rutas Disponibles/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: /Portal Empresas/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: /Super Admin/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: /Acceso Trabajadores/i,
      })
    ).toBeVisible();
  });
});