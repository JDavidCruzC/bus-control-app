import { test, expect } from '@playwright/test';

test('la aplicación carga correctamente', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Bus Control/i);
});