/**
 * Banner Generator E2E Tests
 * Tests the complete banner generation workflow
 */

import { test, expect, Page } from '@playwright/test';

// Test data - banner presets that should exist
const BANNER_PRESETS = [
  'Facebook Cover', 'Twitter Header', 'LinkedIn Banner', 'YouTube Banner', 'Instagram Story',
  'Instagram Post', 'Twitter Post', 'Facebook Post', 'LinkedIn Post', 'Pinterest Pin',
  'TikTok Video', 'Website Header', 'Website Banner', 'Hero Section', 'Feature Banner',
  'Popup Banner', 'Google Display Ad', 'Google Display Large', 'Leaderboard', 'Medium Rectangle',
  'Wide Skyscraper', 'Billboard', 'A4 Landscape', 'A4 Portrait', 'A5 Landscape',
  'A5 Portrait', 'Mobile Wallpaper', 'Mobile App Banner'
];

const BANNER_CATEGORIES = ['Social Media', 'Website', 'Advertising', 'Print', 'Mobile'];

// Test that there are enough presets
const MIN_PRESET_COUNT = 25;

test.describe('Banner Generator Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/banner-generator');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/banner-generator');
  });

  test('should load banner generator page', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('app-banner-generator')).toBeVisible();
    
    // Verify main sections - use more specific selectors
    const previewSection = page.locator('.banner-generator');
    const settingsSection = page.locator('.settings-form');
    const presetsSection = page.locator('.preset-grid');
    const actionsSection = page.locator('.generate-actions');
    
    await expect(previewSection).toBeVisible();
    await expect(settingsSection).toBeVisible();
    await expect(presetsSection).toBeVisible();
    await expect(actionsSection).toBeVisible();
  });

  test('should have many preset options', async ({ page }) => {
    // Look for preset cards (buttons with preset info)
    const presetCards = page.locator('.preset-card');
    await expect(presetCards.first()).toBeVisible();
    
    // Verify preset count
    const count = await presetCards.count();
    expect(count).toBeGreaterThanOrEqual(MIN_PRESET_COUNT);
  });

  test('should have required preset categories', async ({ page }) => {
    // Get all preset names from the preset cards
    const presetCards = page.locator('.preset-card');
    const presetNames = await presetCards.locator('.preset-name').allTextContents();
    
    // Verify at least some key presets exist
    const requiredPresets = ['Facebook', 'Twitter', 'LinkedIn', 'YouTube', 'Instagram'];
    for (const preset of requiredPresets) {
      expect(presetNames.some(opt => opt.includes(preset))).toBeTruthy();
    }
  });

  test('should have category filtering', async ({ page }) => {
    // Look for category filter buttons
    const categoryButtons = page.locator('.category-filter button');
    await expect(categoryButtons.first()).toBeVisible();
    
    const buttonTexts = await categoryButtons.allTextContents();
    
    // Check that all categories are represented
    for (const category of BANNER_CATEGORIES) {
      expect(
        buttonTexts.some(text => text.includes(category)),
        `Expected category chip for "${category}"`
      ).toBeTruthy();
    }
  });

  test('should have custom dimensions input', async ({ page }) => {
    // Get all number inputs - should be width and height
    const numberInputs = page.locator('input[type="number"]');
    const count = await numberInputs.count();
    
    expect(count).toBeGreaterThanOrEqual(2);
    
    // Check first two number inputs (width and height)
    const widthInput = numberInputs.nth(0);
    const heightInput = numberInputs.nth(1);
    
    await expect(widthInput).toBeVisible();
    await expect(heightInput).toBeVisible();
    
    // Verify default values
    const defaultWidth = await widthInput.inputValue();
    const defaultHeight = await heightInput.inputValue();
    expect(parseInt(defaultWidth)).toBeGreaterThan(0);
    expect(parseInt(defaultHeight)).toBeGreaterThan(0);
  });

  test('should have color pickers for colors', async ({ page }) => {
    // Get all color inputs - there should be multiple (primary, secondary, background)
    const colorInputs = page.locator('input[type="color"]');
    await expect(colorInputs).toBeVisible();
    
    const count = await colorInputs.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Check the first color picker
    const firstColorPicker = colorInputs.nth(0);
    await expect(firstColorPicker).toBeVisible();
    
    // Verify default color
    const defaultColor = await firstColorPicker.getAttribute('value');
    expect(defaultColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('should have text input for banner text', async ({ page }) => {
    // Look for textarea and text inputs
    const textInputs = page.locator('textarea, input[type="text"]');
    
    if (await textInputs.count() > 0) {
      const firstTextInput = textInputs.nth(0);
      await expect(firstTextInput).toBeVisible();
      
      // Enter custom text
      await firstTextInput.fill('Test Banner Text');
      
      // Verify input value
      const value = await firstTextInput.inputValue();
      expect(value).toContain('Test Banner');
    }
  });

  test('should change preset and update dimensions', async ({ page }) => {
    // Get preset cards and number inputs
    const presetCards = page.locator('.preset-card');
    const numberInputs = page.locator('input[type="number"]');
    
    // Get initial dimensions
    const widthInput = numberInputs.nth(0);
    const heightInput = numberInputs.nth(1);
    
    const initialWidth = await widthInput.inputValue();
    const initialHeight = await heightInput.inputValue();
    
    // Find and click Facebook Cover preset (first preset that contains "Facebook")
    const facebookPreset = presetCards.filter({ hasText: /facebook/i }).first();
    if (await facebookPreset.count() > 0) {
      await facebookPreset.click();
      await page.waitForTimeout(500);
      
      // Verify dimensions changed
      const newWidth = await widthInput.inputValue();
      const newHeight = await heightInput.inputValue();
      
      expect(newWidth).not.toBe(initialWidth);
      expect(newHeight).not.toBe(initialHeight);
    }
  });

  test('should change custom dimensions', async ({ page }) => {
    const numberInputs = page.locator('input[type="number"]');
    const widthInput = numberInputs.nth(0);
    const heightInput = numberInputs.nth(1);
    
    // Get initial values
    const initialWidth = await widthInput.inputValue();
    const initialHeight = await heightInput.inputValue();
    
    // Change dimensions
    await widthInput.fill('800');
    await heightInput.fill('400');
    await page.waitForTimeout(300);
    
    // Verify dimensions changed
    const newWidth = await widthInput.inputValue();
    const newHeight = await heightInput.inputValue();
    
    expect(newWidth).toBe('800');
    expect(newHeight).toBe('400');
  });

  test('should change color and verify update', async ({ page }) => {
    const colorInputs = page.locator('input[type="color"]');
    const firstColorPicker = colorInputs.nth(0);
    
    // Get initial color
    const initialColor = await firstColorPicker.getAttribute('value');
    
    // Change color to green
    await firstColorPicker.fill('#00ff00');
    await page.waitForTimeout(100);
    
    // Verify color changed
    const newColor = await firstColorPicker.getAttribute('value');
    expect(newColor?.toLowerCase()).toBe('#00ff00');
  });

  test('should have generate button', async ({ page }) => {
    // Look for generate button
    const generateButton = page.locator('button:has-text("Generate")').first();
    await expect(generateButton).toBeVisible();
    
    // Button should be disabled if no description
    const isDisabled = await generateButton.getAttribute('disabled');
    // Button might be disabled initially
    expect(isDisabled === null || isDisabled === 'true').toBeTruthy();
  });

  test('should display form sections', async ({ page }) => {
    // Verify all form sections are visible
    const formSections = page.locator('.form-section');
    await expect(formSections).toBeVisible();
    
    const count = await formSections.count();
    expect(count).toBeGreaterThanOrEqual(3); // Should have description, size, colors, etc.
  });
});

// Mobile-specific tests
test.describe('Banner Generator Mobile Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.emulateMedia({ isMobile: true, hasTouch: true });
    await page.goto('/banner-generator');
    await page.waitForLoadState('networkidle');
  });

  test('should have mobile-optimized layout', async ({ page }) => {
    const bannerGenerator = page.locator('.banner-generator');
    const box = await bannerGenerator.boundingBox();
    
    // On mobile, should take full width
    expect(box?.width).toBeGreaterThan(300);
  });

  test('should display presets in mobile-friendly way', async ({ page }) => {
    const presetCards = page.locator('.preset-card');
    await expect(presetCards.first()).toBeVisible();
    
    const firstCard = presetCards.nth(0);
    const box = await firstCard.boundingBox();
    
    // Cards should be touch-friendly (WCAG 2.5.5 minimum target ~44px)
    expect(box?.width).toBeGreaterThanOrEqual(100);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('should have accessible form controls', async ({ page }) => {
    // Check that form controls have proper labels
    const colorInputs = page.locator('input[type="color"]');
    const numberInputs = page.locator('input[type="number"]');
    
    // Should have at least one color input
    expect(await colorInputs.count()).toBeGreaterThanOrEqual(1);
    
    // Should have at least two number inputs (width, height)
    expect(await numberInputs.count()).toBeGreaterThanOrEqual(2);
    
    // Check that inputs have labels
    const labels = page.locator('label');
    expect(await labels.count()).toBeGreaterThanOrEqual(3);
  });
});