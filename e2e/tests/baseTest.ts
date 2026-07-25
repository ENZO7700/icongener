// e2e/tests/baseTest.ts
import { test as base, expect } from '@playwright/test';

// Custom fixtures for page objects
export const test = base.extend({
  // Icon Generator Page
  iconGeneratorPage: async ({ page }, use) => {
    await page.goto('/icon-generator');
    await use(page);
  },
  
  // Banner Generator Page
  bannerGeneratorPage: async ({ page }, use) => {
    await page.goto('/banner-generator');
    await use(page);
  },
  
  // Favicon Generator Page
  faviconGeneratorPage: async ({ page }, use) => {
    await page.goto('/favicon-generator');
    await use(page);
  },
  
  // PNG to HTML Page
  pngToHtmlPage: async ({ page }, use) => {
    await page.goto('/png-to-html');
    await use(page);
  },
  
  // Dashboard Page
  dashboardPage: async ({ page }, use) => {
    await page.goto('/dashboard');
    await use(page);
  },
  
  // History Page
  historyPage: async ({ page }, use) => {
    await page.goto('/history');
    await use(page);
  },
  
  // Settings Page
  settingsPage: async ({ page }, use) => {
    await page.goto('/settings');
    await use(page);
  }
});

export { expect };
