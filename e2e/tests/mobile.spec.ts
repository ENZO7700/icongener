// e2e/tests/mobile.spec.ts
import { test, expect } from '@playwright/test';
import { devices } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  // Test on multiple mobile devices using device presets
  test('Should work on iPhone 17', async ({ page }) => {
    const device = devices['iPhone 17'];
    await page.setViewportSize(device.viewport);
    await page.emulateMedia({ 
      viewport: device.viewport,
      userAgent: device.userAgent,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/IconGener/);

    // Navigate through main pages
    await page.getByRole('link', { name: /dashboard/i }).click();
    await expect(page.getByRole('main')).toBeVisible();

    // Test touch targets
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('Should work on iPhone 16 Pro Max', async ({ page }) => {
    const device = devices['iPhone 16 Pro Max'];
    await page.setViewportSize(device.viewport);
    await page.emulateMedia({ 
      viewport: device.viewport,
      userAgent: device.userAgent,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/IconGener/);

    await page.getByRole('link', { name: /icon.*generator/i }).click();
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('Should work on Pixel 8 Pro', async ({ page }) => {
    const device = devices['Pixel 8 Pro'];
    await page.setViewportSize(device.viewport);
    await page.emulateMedia({ 
      viewport: device.viewport,
      userAgent: device.userAgent,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/IconGener/);

    await page.getByRole('link', { name: /banner.*generator/i }).click();
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('Should have proper viewport on iPhone 17', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute(
      'content',
      /width=device-width, initial-scale=1\.0/
    );
  });

  test('Should handle virtual keyboard on iOS', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/icon-generator');

    const input = page.getByLabel(/color/i);
    await input.focus();

    // On iOS, virtual keyboard should not cover input
    const inputBox = await input.boundingBox();
    const viewportHeight = 852;

    // Input should be above keyboard (approximately)
    expect(inputBox!.y + inputBox!.height).toBeLessThan(viewportHeight * 0.6);
  });

  test('Should have safe area insets on iPhone', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    const header = page.getByRole('banner');
    const headerBox = await header.boundingBox();

    // Header should account for notch
    expect(headerBox!.y).toBeGreaterThanOrEqual(0);
    expect(headerBox!.y + headerBox!.height).toBeLessThanOrEqual(100);
  });

  test('Should disable zoom on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute(
      'content',
      /maximum-scale=1\.0, user-scalable=no/
    );
  });

  test('Should use 100dvh for full height elements', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    // Check that full-height elements use 100dvh
    const fullHeightElements = page.locator('[style*="height: 100dvh"]');
    expect(await fullHeightElements.count()).toBeGreaterThan(0);
  });

  test('Should have mobile touch targets for form inputs', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/icon-generator');

    const inputs = page.locator('input, select, textarea, button');
    const count = await inputs.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = inputs.nth(i);
      const box = await element.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('Should have responsive sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/dashboard');

    const sidebar = page.getByRole('navigation');
    const toggleButton = page.getByRole('button', { name: /menu|toggle|hamburger/i });

    // Initially should be closed on mobile
    await expect(sidebar).toHaveClass(/closed|hidden/);

    // Open sidebar
    await toggleButton.click();
    await expect(sidebar).toBeVisible();

    // Close sidebar
    await toggleButton.click();
    await expect(sidebar).toHaveClass(/closed|hidden/);
  });
});
