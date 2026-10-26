import { expect, test } from '@playwright/test';

test('sayfa başlığı görünür', async ({ page }) => {
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: 'Ahtapot Yakala' }),
  ).toBeVisible();
});
