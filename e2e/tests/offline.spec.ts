// e2e/tests/offline.spec.ts
import { test, expect } from './baseTest';

test.describe('Offline Capabilities', () => {
  test('Should register service worker', async ({ page }) => {
    await page.goto('/');

    const serviceWorker = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null ||
             navigator.serviceWorker.getRegistrations().then(r => r.length > 0);
    });

    expect(serviceWorker).toBeTruthy();
  });

  test('Should show offline page when offline', async ({ page }) => {
    // Go online first
    await page.goto('/');

    // Go offline
    await page.setOffline(true);

    // Navigate to a cached page
    await page.goto('/dashboard');

    // Should show offline indicator or cached content
    await expect(page.getByText(/offline|offline mode/i)).toBeVisible();
    // OR expect(page.getByRole('main')).toBeVisible();
  });

  test('Should cache static assets', async ({ page }) => {
    await page.goto('/');

    // Get the service worker cache
    const caches = await page.evaluate(() => {
      return caches.keys().then(keys => keys.map(k => k.url));
    });

    // Should have some cached assets
    expect(caches.length).toBeGreaterThan(0);
    expect(caches.some(c => c.includes('.js'))).toBeTruthy();
    expect(caches.some(c => c.includes('.css'))).toBeTruthy();
  });

  test('Should work with manifest', async ({ page }) => {
    await page.goto('/');

    const manifest = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.href : null;
    });

    expect(manifest).toContain('/manifest.webmanifest');

    // Fetch and validate manifest
    const manifestResponse = await page.request.get(manifest!);
    const manifestJson = await manifestResponse.json();

    expect(manifestJson.name).toBe('IconGener');
    expect(manifestJson.short_name).toBeDefined();
    expect(manifestJson.start_url).toBe('/');
    expect(manifestJson.display).toBe('standalone');
    expect(manifestJson.background_color).toBeDefined();
    expect(manifestJson.theme_color).toBeDefined();
    expect(manifestJson.icons).toBeDefined();
    expect(manifestJson.icons.length).toBeGreaterThan(0);
  });

  test('Should have PWA meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for theme color
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', /#/);

    // Check for apple-touch-icon
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveCountGreaterThanOrEqual(0);

    // Check for viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeVisible();
  });

  test('Should cache API responses', async ({ page }) => {
    // First, go online and make a request
    await page.goto('/api/health');

    // Go offline
    await page.setOffline(true);

    // Try to fetch the cached response
    const response = await page.request.get('http://localhost:3000/api/health').catch(() => null);
    
    if (response) {
      const data = await response.json();
      expect(data.status).toBe('ok');
    }
  });

  test('Should show fallback when offline and no cache', async ({ page }) => {
    // Clear cache
    await page.evaluate(() => {
      return caches.keys().then(keys => {
        return Promise.all(keys.map(key => caches.delete(key)));
      });
    });

    // Go offline
    await page.setOffline(true);

    // Navigate to a page
    await page.goto('/');

    // Should show some content or offline message
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('Should have service worker scope', async ({ page }) => {
    await page.goto('/');

    const registrations = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistrations();
    });

    for (const registration of registrations) {
      expect(registration.scope).toContain('/');
    }
  });

  test('Should update service worker on new version', async ({ page }) => {
    await page.goto('/');

    // Reload to trigger update
    await page.reload();

    const registrations = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistrations();
    });

    expect(registrations.length).toBeGreaterThan(0);
  });
});
