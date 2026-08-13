import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('loads and shows hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('navigation to builder works', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/builder"]');
    await expect(page).toHaveURL(/\/builder/);
  });
});

test.describe('Auth Flow', () => {
  test('redirects unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('redirects unauthenticated users from builder', async ({ page }) => {
    await page.goto('/builder');
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Form Builder', () => {
  test('shows form fields when authenticated', async ({ page }) => {
    // This test requires a seeded auth session
    // Skip in CI until we have test auth setup
    test.skip();
  });
});
