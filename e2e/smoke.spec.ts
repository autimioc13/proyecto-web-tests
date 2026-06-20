import { test, expect } from '@playwright/test';

/**
 * Functional smoke tests for the public, high-value pages and the auth gate.
 * These assert on stable, user-visible text/elements (robust across platforms).
 */

test.describe('Public pages', () => {
  test('home loads with the hero headline', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /Tests que revelan quién eres realmente/i })
    ).toBeVisible();
  });

  test('login page shows the email/password form and OAuth options', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'GitHub' })).toBeVisible();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.getByRole('heading', { name: /Únete a QuizLab/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear Cuenta' })).toBeVisible();
  });

  test('pricing page lists products with prices', async ({ page }) => {
    await page.goto('/precios');
    await expect(page.getByRole('heading', { name: 'Precios', exact: true })).toBeVisible();
    // At least one USD price should be visible
    await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
  });

  test('refund and terms policy pages load', async ({ page }) => {
    await page.goto('/reembolsos');
    await expect(page.getByRole('heading', { name: /Política de Reembolso/i })).toBeVisible();

    await page.goto('/terminos');
    await expect(page.getByRole('heading', { name: /Términos de Servicio/i })).toBeVisible();
  });
});

test.describe('Auth gate (proxy)', () => {
  test('unauthenticated /dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('unauthenticated /checkout redirects to login', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
