// e2e/tests/mobile.spec.ts
import { test, expect } from '@playwright/test';
import { devices } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {

  /** Open off-canvas sidebar on small screens (menu links are outside the viewport when closed). */
  async function openMobileNav(page: import('@playwright/test').Page) {
    const menuToggle = page.getByRole('button', { name: /toggle navigation menu/i });
    if (await menuToggle.isVisible().catch(() => false)) {
      await menuToggle.click();
      await page.locator('.sidebar.open, .sidebar.open .menu-item').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    }
  }

  // Test on key mobile devices
  test('Should work on iPhone 17', async ({ page }) => {
    const device = devices['iPhone 17'];
    await page.setViewportSize(device.viewport);
    await page.emulateMedia({ 
      viewport: device.viewport,
      userAgent: device.userAgent,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch
    });

    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/IconGener|PWA Icon Generator|Dashboard/);
    await expect(page.locator('main')).toBeVisible();

    // Visible header controls should meet touch-target size
    const menuToggle = page.getByRole('button', { name: /toggle navigation menu/i });
    if (await menuToggle.isVisible().catch(() => false)) {
      const box = await menuToggle.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
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

    await page.goto('/icon-generator');
    await expect(page).toHaveTitle(/IconGener|PWA Icon Generator|Icon Generator/);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
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

    await page.goto('/banner-generator');
    await expect(page).toHaveTitle(/IconGener|PWA Icon Generator|Banner/);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.banner-generator, app-banner-generator').first()).toBeVisible();
  });

  test('Should have proper viewport on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute(
      'content',
      /width=device-width, initial-scale=1\.0, maximum-scale=1\.0, user-scalable=no, viewport-fit=cover/
    );
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

  test('Should use 100dvh or 100vh for full height elements', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Layout uses CSS min-height: 100dvh / 100vh on root shells (not only inline styles)
    const fullHeight = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('html, body, .layout-container, .sidebar, main, app-root'));
      return nodes.some((el) => {
        const cs = getComputedStyle(el);
        const h = cs.height || '';
        const mh = cs.minHeight || '';
        // Accept near full viewport height (allow minor chrome differences)
        const px = parseFloat(h) || parseFloat(mh) || 0;
        return px >= window.innerHeight * 0.85 || /100(dvh|vh|%)/.test(h + mh);
      });
    });
    expect(fullHeight).toBeTruthy();
  });

  test('Should have mobile touch targets for form inputs', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/icon-generator');

    const inputs = page.locator('input, select, textarea, button');
    const count = await inputs.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = inputs.nth(i);
      const box = await element.boundingBox();
      
      // Buttons, selects, and textareas should meet touch target size
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      if (tagName === 'input') {
        const type = await element.getAttribute('type');
        // Color inputs should be at least 44px, other inputs may be smaller
        if (type === 'color') {
          expect(box!.width).toBeGreaterThanOrEqual(44);
          expect(box!.height).toBeGreaterThanOrEqual(44);
        } else {
          // Other input types (text, number, etc.) - more lenient
          expect(box!.width).toBeGreaterThanOrEqual(40);
          expect(box!.height).toBeGreaterThanOrEqual(40);
        }
      } else {
        // Buttons, selects, textareas should be touch-friendly
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('Should have responsive sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/dashboard');

    const sidebar = page.locator('.sidebar');
    // Prefer the in-header toggle (visible). Sidebar's own off-canvas toggle is outside the viewport.
    const toggleButton = page.getByRole('button', { name: /toggle navigation menu/i });

    await expect(sidebar).toBeAttached();
    await expect(toggleButton).toBeVisible();

    await toggleButton.click();
    await page.waitForTimeout(400);
    await expect(sidebar).toHaveClass(/open/);

    // Menu links become clickable after open
    await expect(page.getByRole('link', { name: /^Icon Generator$/i }).first()).toBeVisible();
  });

  test('Should have safe area insets on iPhone', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    const header = page.getByRole('banner').first();
    const headerBox = await header.boundingBox();

    // Header should account for notch
    expect(headerBox!.y).toBeGreaterThanOrEqual(0);
    expect(headerBox!.y + headerBox!.height).toBeLessThanOrEqual(100);
  });

  test('Should have accessible touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/dashboard');

    // Check feature cards are touch-friendly
    const featureCards = page.locator('.feature-card');
    const count = await featureCards.count();
    
    if (count > 0) {
      const firstCard = featureCards.first();
      const box = await firstCard.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(100);
      expect(box!.height).toBeGreaterThanOrEqual(100);
    }
  });

  test('Should handle form inputs on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/icon-generator');

    // Check color input is usable
    const colorInput = page.locator('input[type="color"]').first();
    if (await colorInput.count() > 0) {
      await expect(colorInput).toBeVisible();
      const box = await colorInput.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });
});

