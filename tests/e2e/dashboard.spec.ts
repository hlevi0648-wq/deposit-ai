import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('shows empty state when no forms', async ({ page }) => {
    // Requires auth — skipped until test auth is configured
    test.skip();
  });
});

test.describe('Audit Log', () => {
  test('page loads', async ({ page }) => {
    // Requires auth — skipped until test auth is configured
    test.skip();
  });
});
