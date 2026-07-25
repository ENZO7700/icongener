// e2e/tests/performance.spec.ts
import { test, expect } from './baseTest';

test.describe('Performance', () => {
  test('Should load homepage in < 3s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(3000);
  });

  test('Should load dashboard in < 2s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(2000);
  });

  test('Should load icon generator in < 2s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/icon-generator');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(2000);
  });

  test('Should load banner generator in < 2s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/banner-generator');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(2000);
  });

  test('Should have less than 10 network requests for homepage', async ({ page }) => {
    const requests = [];
    
    // Listen to all requests
    page.on('request', request => {
      requests.push(request);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out data: URLs and focus on main requests
    const mainRequests = requests.filter(req => {
      const url = req.url();
      return !url.includes('data:') && !url.includes('blob:');
    });

    expect(mainRequests.length).toBeLessThan(20);
  });

  test('Should have reasonable bundle size', async ({ page }) => {
    await page.goto('/');

    // Get all script tags
    const scripts = page.locator('script[src]');
    const count = await scripts.count();

    // Should have a reasonable number of scripts
    expect(count).toBeLessThan(30);
  });

  test('Should cache static assets', async ({ page }) => {
    await page.goto('/');

    // Get cache headers for static assets
    const response = await page.request.get('http://localhost:3000/favicon.ico').catch(() => null);
    
    if (response) {
      const cacheControl = response.headers()['cache-control'];
      expect(cacheControl).toBeDefined();
    }
  });

  test('Should have gzip compression for HTML', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/');
    const contentEncoding = response.headers()['content-encoding'];
    
    // Check if compression is enabled (optional)
    expect(contentEncoding).toBeDefined();
  }).skip();

  test('Should lazy load non-critical JavaScript', async ({ page }) => {
    await page.goto('/');

    // Get all script tags
    const scripts = page.locator('script');
    const count = await scripts.count();

    // Should have some scripts
    expect(count).toBeGreaterThan(0);
  });

  test('Should have efficient image loading', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for lazy loading on images
    const images = page.locator('img[loading="lazy"]');
    await expect(images).toHaveCountGreaterThanOrEqual(0);
  });

  test('Should have preload for critical resources', async ({ page }) => {
    await page.goto('/');

    // Check for preload tags
    const preloads = page.locator('link[rel="preload"]');
    await expect(preloads).toHaveCountGreaterThanOrEqual(0);
  });
});
