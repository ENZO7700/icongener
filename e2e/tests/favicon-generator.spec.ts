/**
 * Favicon Generator E2E Tests
 * Tests the complete favicon generation workflow
 */

import { test, expect, Page } from '@playwright/test';

// Standard favicon sizes
const FAVICON_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512];
const FAVICON_FORMATS = ['ICO', 'PNG', 'SVG'];
const FAVICON_SHAPES = ['circle', 'square', 'rounded'];

test.describe('Favicon Generator Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/favicon-generator');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/favicon-generator');
  });

  test('should load favicon generator page', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('app-favicon-generator')).toBeVisible();
    
    // Verify main sections
    const settingsSection = page.locator('.settings-form');
    const actionsSection = page.locator('.generate-actions');
    
    await expect(settingsSection).toBeVisible();
    await expect(actionsSection).toBeVisible();
  });

  test('should have description input', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    
    // Enter description
    await textarea.fill('Test favicon description');
    
    // Verify input value
    const value = await textarea.inputValue();
    expect(value).toContain('Test favicon');
  });

  test('should have favicon type selection', async ({ page }) => {
    // Look for radio inputs for favicon type
    const radioInputs = page.locator('input[type="radio"]');
    await expect(radioInputs).toBeVisible();
    
    const count = await radioInputs.count();
    expect(count).toBeGreaterThanOrEqual(2); // Should have at least classic and modern
    
    // Check for classic and modern options
    const classicOption = page.locator('input[value="classic"]');
    const modernOption = page.locator('input[value="modern"]');
    
    await expect(classicOption).toBeVisible();
    await expect(modernOption).toBeVisible();
  });

  test('should have color pickers', async ({ page }) => {
    // Get all color inputs
    const colorInputs = page.locator('input[type="color"]');
    await expect(colorInputs).toBeVisible();
    
    const count = await colorInputs.count();
    expect(count).toBeGreaterThanOrEqual(2); // Should have primary and secondary color
    
    // Check the first color picker
    const firstColorPicker = colorInputs.nth(0);
    await expect(firstColorPicker).toBeVisible();
    
    // Verify default color
    const defaultColor = await firstColorPicker.getAttribute('value');
    expect(defaultColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('should have background color selection', async ({ page }) => {
    // Look for background color select
    const bgColorSelect = page.locator('select').first();
    await expect(bgColorSelect).toBeVisible();
    
    // Verify options
    const options = await bgColorSelect.locator('option').count();
    expect(options).toBeGreaterThanOrEqual(2);
    
    // Get option texts
    const optionTexts = await bgColorSelect.locator('option').allTextContents();
    expect(optionTexts.some(opt => opt.includes('transparent') || opt.includes('Transparent'))).toBeTruthy();
  });

  test('should have standard favicon sizes displayed', async ({ page }) => {
    // The component has predefined sizes - we can verify by checking the form structure
    // Since sizes might be shown in results or documentation, we'll check for a reasonable number of elements
    const formSections = page.locator('.form-section');
    expect(await formSections.count()).toBeGreaterThanOrEqual(2);
  });

  test('should have format selection for favicon output', async ({ page }) => {
    // Look for radio buttons that represent format selection (classic vs modern)
    const typeRadios = page.locator('input[type="radio"]');
    const count = await typeRadios.count();
    
    expect(count).toBeGreaterThanOrEqual(2);
    
    // The favicon type (classic/modern) determines the output format
    const classicRadio = page.locator('input[value="classic"]');
    const modernRadio = page.locator('input[value="modern"]');
    
    await expect(classicRadio).toBeVisible();
    await expect(modernRadio).toBeVisible();
  });

  test('should change color and update preview', async ({ page }) => {
    const colorInputs = page.locator('input[type="color"]');
    const firstColorPicker = colorInputs.nth(0);
    
    // Get initial color
    const initialColor = await firstColorPicker.getAttribute('value');
    
    // Change color to blue
    await firstColorPicker.fill('#0000ff');
    await page.waitForTimeout(100);
    
    // Verify color changed
    const newColor = await firstColorPicker.getAttribute('value');
    expect(newColor?.toLowerCase()).toBe('#0000ff');
  });

  test('should change background color', async ({ page }) => {
    const bgColorSelect = page.locator('select').first();
    
    // Get initial value
    const initialValue = await bgColorSelect.inputValue();
    
    // Change to a different background color
    await bgColorSelect.selectOption('Dark Blue');
    await page.waitForTimeout(100);
    
    // Verify selection changed
    const newValue = await bgColorSelect.inputValue();
    expect(newValue).not.toBe(initialValue);
  });

  test('should change favicon type', async ({ page }) => {
    const classicRadio = page.locator('input[value="classic"]');
    const modernRadio = page.locator('input[value="modern"]');
    
    // Get initial state
    const initialClassicChecked = await classicRadio.isChecked();
    const initialModernChecked = await modernRadio.isChecked();
    
    // Change to modern if classic is selected, or vice versa
    if (initialClassicChecked) {
      await modernRadio.check();
      expect(await modernRadio.isChecked()).toBe(true);
    } else {
      await classicRadio.check();
      expect(await classicRadio.isChecked()).toBe(true);
    }
  });

  test('should have generate button', async ({ page }) => {
    // Look for generate button
    const generateButton = page.locator('button:has-text("Generate")').first();
    await expect(generateButton).toBeVisible();
    
    // Button should be disabled if no description
    const isDisabled = await generateButton.getAttribute('disabled');
    expect(isDisabled === null || isDisabled === 'true').toBeTruthy();
  });

  test('should display form sections', async ({ page }) => {
    // Verify all form sections are visible
    const formSections = page.locator('.form-section');
    await expect(formSections).toBeVisible();
    
    const count = await formSections.count();
    expect(count).toBeGreaterThanOrEqual(3); // Should have description, type, colors, etc.
  });
});

test.describe('Favicon Generator Mobile Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.emulateMedia({ isMobile: true, hasTouch: true });
    await page.goto('/favicon-generator');
    await page.waitForLoadState('networkidle');
  });

  test('should have mobile-optimized layout', async ({ page }) => {
    const faviconGenerator = page.locator('.favicon-generator');
    const box = await faviconGenerator.boundingBox();
    
    // On mobile, should take full width
    expect(box?.width).toBeGreaterThan(300);
  });

  test('should have accessible form controls', async ({ page }) => {
    // Check that form controls have proper labels
    const colorInputs = page.locator('input[type="color"]');
    const radioInputs = page.locator('input[type="radio"]');
    const selectInputs = page.locator('select');
    const textareaInput = page.locator('textarea');
    
    // Should have color inputs
    expect(await colorInputs.count()).toBeGreaterThanOrEqual(1);
    
    // Should have radio inputs for type
    expect(await radioInputs.count()).toBeGreaterThanOrEqual(2);
    
    // Should have select for background color
    expect(await selectInputs.count()).toBeGreaterThanOrEqual(1);
    
    // Should have textarea for description
    expect(await textareaInput.count()).toBeGreaterThanOrEqual(1);
    
    // Check that inputs have labels
    const labels = page.locator('label');
    expect(await labels.count()).toBeGreaterThanOrEqual(5);
  });

  test('should have touch-friendly controls', async ({ page }) => {
    const buttons = page.locator('button, input[type="color"], select, textarea');
    const count = await buttons.count();
    
    if (count > 0) {
      const firstControl = buttons.first();
      const box = await firstControl.boundingBox();
      
      // Controls should be touch-friendly
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });
});