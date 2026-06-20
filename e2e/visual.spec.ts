import { test, expect } from '@playwright/test';

/**
 * Visual regression tests on stable, mostly-static pages (no ads / random
 * content). The first run creates baseline snapshots; later runs compare.
 *
 * NOTE: screenshots are platform-specific. Generate/update baselines on the
 * same OS that will run them (locally, or in CI) with:
 *   npm run test:e2e:update
 */

test.describe('Visual regression', () => {
  test('login page', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible();
    await expect(page).toHaveScreenshot('login.png', { fullPage: true });
  });

  test('pricing page', async ({ page }) => {
    await page.goto('/precios');
    await expect(page.getByRole('heading', { name: 'Precios', exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('precios.png', { fullPage: true });
  });
});
