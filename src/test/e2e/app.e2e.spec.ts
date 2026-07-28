import { test, expect } from "@playwright/test";

test.describe("Flujos principales", () => {
  test("abre la pantalla de trabajadores", async ({ page }) => {
    await page.goto("/", {
      waitUntil: "domcontentloaded",
    });

    await page.getByRole("button", {
      name: /Acceso Trabajadores/i,
    }).click();

    await expect(page).toHaveURL(/auth\/trabajadores/);

    await expect(
      page.getByRole("heading", {
        name: /Iniciar Sesión/i,
      })
    ).toBeVisible();
  });

  test("abre la pantalla Super Admin", async ({ page }) => {
    await page.goto("/", {
      waitUntil: "domcontentloaded",
    });

    await page.getByRole("button", {
      name: /Super Admin/i,
    }).click();

    await expect(page).toHaveURL(/auth\/superadmin/);
  });

  test("abre Portal Empresas", async ({ page }) => {
    await page.goto("/", {
      waitUntil: "domcontentloaded",
    });

    await page.getByRole("button", {
      name: /Portal Empresas/i,
    }).click();

    await expect(page).toHaveURL(/empresa\/auth/);
  });

  test("abre Rutas Públicas", async ({ page }) => {
    await page.goto("/", {
      waitUntil: "domcontentloaded",
    });

    await page.getByRole("button", {
      name: /Ver Rutas Disponibles/i,
    }).click();

    await expect(page).toHaveURL(/rutas-publicas/);
  });
});