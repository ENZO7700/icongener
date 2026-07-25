/**
 * Icon Generator E2E Tests
 * Tests the complete icon generation workflow
 */

import { test, expect, Page } from '@playwright/test';

// Test data
const ICON_PRESETS = [
  { name: 'App Icon', expected: true },
  { name: 'Social Media', expected: true },
  { name: 'Business', expected: true },
];

const ICON_PLATFORMS = [
  { name: 'PWA', value: 'pwa' },
  { name: 'Android', value: 'android' },
  { name: 'iOS', value: 'ios' },
];

const ICON_SHAPES = ['circle', 'rounded', 'square'];

const ICON_SIZES = [
  { platform: 'pwa', sizes: [48, 72, 96, 128, 144, 152, 192, 384, 512] },
  { platform: 'android', sizes: [36, 48, 72, 96, 144, 192, 512] },
  { platform: 'ios', sizes: [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180] },
];

test.describe('Icon Generator Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/icon-generator');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/icon-generator');
  });

  test('should load icon generator page', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('app-icon-generator')).toBeVisible();
    
    // Verify main sections
    const previewSection = page.locator('.preview-section, [data-testid="preview-section"]');
    const settingsSection = page.locator('.settings-section, [data-testid="settings-section"]');
    const actionsSection = page.locator('.actions-section, [data-testid="actions-section"]');
    
    await expect(previewSection).toBeVisible();
    await expect(settingsSection).toBeVisible();
    await expect(actionsSection).toBeVisible();
  });

  test('should display preview canvas', async ({ page }) => {
    const canvas = page.locator('canvas, [data-testid="icon-preview"]');
    await expect(canvas).toBeVisible();
    
    // Verify canvas has reasonable dimensions
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.height).toBeGreaterThan(100);
  });

  test('should have platform selection', async ({ page }) => {
    for (const platform of ICON_PLATFORMS) {
      const platformOption = page.locator(`input[value="${platform.value}"], [data-platform="${platform.value}"]`);
      await expect(platformOption).toBeVisible();
    }
  });

  test('should have shape selection', async ({ page }) => {
    for (const shape of ICON_SHAPES) {
      const shapeOption = page.locator(`input[value="${shape}"], [data-shape="${shape}"]`);
      await expect(shapeOption).toBeVisible();
    }
  });

  test('should have color picker', async ({ page }) => {
    const colorPicker = page.locator('input[type="color"], [data-testid="color-picker"]');
    await expect(colorPicker).toBeVisible();
    
    // Verify default color
    const defaultColor = await colorPicker.getAttribute('value');
    expect(defaultColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('should have background color picker', async ({ page }) => {
    const bgColorPicker = page.locator('input[type="color"]').nth(1);
    if (await bgColorPicker.count() > 0) {
      await expect(bgColorPicker).toBeVisible();
    }
  });

  test('should have size selection', async ({ page }) => {
    const sizeSelect = page.locator('select, [data-testid="size-select"]');
    await expect(sizeSelect).toBeVisible();
    
    // Verify options exist
    const options = await sizeSelect.locator('option').count();
    expect(options).toBeGreaterThan(5);
  });

  test('should have preset selection', async ({ page }) => {
    const presetSelect = page.locator('select, [data-testid="preset-select"]');
    if (await presetSelect.count() > 0) {
      await expect(presetSelect).toBeVisible();
      
      // Verify preset options
      const options = await presetSelect.locator('option').count();
      expect(options).toBeGreaterThan(0);
    }
  });

  test('should change color and update preview', async ({ page }) => {
    const colorPicker = page.locator('input[type="color"]');
    const canvas = page.locator('canvas');
    
    // Get initial canvas state
    const initialScreenshot = await canvas.screenshot();
    
    // Change color to red
    await colorPicker.fill('#ff0000');
    await colorPicker.dispatchEvent('input');
    await page.waitForTimeout(500); // Wait for preview update
    
    // Verify canvas changed
    const newScreenshot = await canvas.screenshot();
    expect(newScreenshot).not.toEqual(initialScreenshot);
  });

  test('should change shape and update preview', async ({ page }) => {
    const canvas = page.locator('canvas');
    
    // Get initial canvas state
    const initialScreenshot = await canvas.screenshot();
    
    // Change to circle shape
    const circleOption = page.locator('input[value="circle"]');
    await circleOption.check();
    await page.waitForTimeout(500); // Wait for preview update
    
    // Verify canvas changed
    const newScreenshot = await canvas.screenshot();
    expect(newScreenshot).not.toEqual(initialScreenshot);
  });

  test('should change platform and update size options', async ({ page }) => {
    const sizeSelect = page.locator('select, [data-testid="size-select"]');
    
    // Get initial options
    const initialOptions = await sizeSelect.locator('option').allTextContents();
    
    // Switch to Android
    const androidOption = page.locator('input[value="android"]');
    await androidOption.check();
    await page.waitForTimeout(500);
    
    // Get new options
    const newOptions = await sizeSelect.locator('option').allTextContents();
    
    // Options should change based on platform
    expect(newOptions).not.toEqual(initialOptions);
  });

  test('should generate icons when clicking generate button', async ({ page }) => {
    const generateButton = page.locator('button:has-text("Generate"), [data-testid="generate-button"]');
    await expect(generateButton).toBeVisible();
    
    // Click generate
    await generateButton.click();
    
    // Wait for generation to complete
    await page.waitForTimeout(2000); // Adjust based on actual generation time
    
    // Verify progress indicator or success message
    const progressBar = page.locator('.progress-bar, [data-testid="progress-bar"]');
    if (await progressBar.count() > 0) {
      await expect(progressBar).toBeVisible();
    }
    
    // Verify toast notification
    const toast = page.locator('.toast, [data-testid="toast"]');
    if (await toast.count() > 0) {
      await expect(toast).toBeVisible();
      const toastText = await toast.textContent();
      expect(toastText?.toLowerCase()).toContain('success') || expect(toastText?.toLowerCase()).toContain('generated');
    }
  });

  test('should download generated icons', async ({ page }) => {
    // Mock the download or verify download button exists
    const downloadButton = page.locator('button:has-text("Download"), [data-testid="download-button"]');
    
    if (await downloadButton.count() > 0) {
      await expect(downloadButton).toBeVisible();
      
      // Click download (in a real test, this would trigger a download)
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadButton.click()
      ]);
      
      // Verify download started
      expect(download).toBeTruthy();
      expect(download.url()).toContain('blob:');
    }
  });

  test('should have custom prompt input', async ({ page }) => {
    const promptInput = page.locator('textarea, input[type="text"]', { hasText: /prompt/i });
    if (await promptInput.count() > 0) {
      await expect(promptInput).toBeVisible();
      
      // Enter custom prompt
      await promptInput.fill('Generate a custom icon');
      
      // Verify input value
      const value = await promptInput.inputValue();
      expect(value).toContain('custom icon');
    }
  });

  test('should reset to default settings', async ({ page }) => {
    // Change some settings
    const colorPicker = page.locator('input[type="color"]');
    await colorPicker.fill('#ff0000');
    
    const circleOption = page.locator('input[value="circle"]');
    await circleOption.check();
    
    // Find and click reset button
    const resetButton = page.locator('button:has-text("Reset"), [data-testid="reset-button"]');
    if (await resetButton.count() > 0) {
      await resetButton.click();
      
      // Verify settings reset
      const resetColor = await colorPicker.getAttribute('value');
      expect(resetColor).not.toBe('#ff0000');
    }
  });
});

test.describe('Icon Generator Mobile Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone size

  test('should display mobile-optimized layout', async ({ page }) => {
    await page.goto('/icon-generator');
    
    // Verify responsive layout
    const previewSection = page.locator('.preview-section');
    const box = await previewSection.boundingBox();
    
    // On mobile, preview should take most of the width
    expect(box?.width).toBeGreaterThan(300);
  });

  test('should have accessible form controls', async ({ page }) => {
    await page.goto('/icon-generator');
    
    // Verify all form controls have labels or aria-labels
    const colorPicker = page.locator('input[type="color"]');
    await expect(colorPicker).toHaveAttribute(/label|aria-label/i, /.*/);
  });
});
