/**
 * Settings Component Tests
 * Tests for the settings component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from '../settings.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    localStorage.clear();
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'showToast', 'getToasts']);
    toastServiceSpy.getToasts.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [SettingsComponent, CommonModule, FormsModule],
      providers: [
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedLanguage).toBe('en');
    expect(component.selectedTheme).toBe('dark');
  });

  it('should have language options', () => {
    expect(component.languages).toContain('en');
    expect(component.languages).toContain('sk');
  });

  it('should have theme options', () => {
    expect(component.themes).toContain('light');
    expect(component.themes).toContain('dark');
    expect(component.themes).toContain('system');
  });

  it('should change language', () => {
    component.selectedLanguage = 'sk';
    component.onLanguageChange();
    expect(component.selectedLanguage).toBe('sk');
    expect(localStorage.getItem('language')).toBe('sk');
  });

  it('should change theme', () => {
    component.selectedTheme = 'light';
    component.onThemeChange();
    expect(component.selectedTheme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should load saved language from localStorage on init', () => {
    localStorage.setItem('language', 'sk');
    const newFixture = TestBed.createComponent(SettingsComponent);
    const newComp = newFixture.componentInstance;
    newFixture.detectChanges();
    expect(newComp.selectedLanguage).toBe('sk');
  });

  it('should load saved theme from localStorage on init', () => {
    localStorage.setItem('theme', 'light');
    const newFixture = TestBed.createComponent(SettingsComponent);
    const newComp = newFixture.componentInstance;
    newFixture.detectChanges();
    expect(newComp.selectedTheme).toBe('light');
  });

  it('should reset to default settings', () => {
    component.selectedLanguage = 'sk';
    component.selectedTheme = 'light';

    component.resetSettings();

    expect(component.selectedLanguage).toBe('en');
    expect(component.selectedTheme).toBe('dark');
    expect(localStorage.getItem('language')).toBe('en');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should save settings', () => {
    component.selectedLanguage = 'sk';
    component.selectedTheme = 'light';

    component.saveSettings();

    expect(localStorage.getItem('language')).toBe('sk');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(toastServiceSpy.success).toHaveBeenCalled();
  });

  it('should apply theme to document body', () => {
    component.selectedTheme = 'light';
    component.applyTheme();
    expect(document.body.classList.contains('light-theme')).toBeTrue();

    component.selectedTheme = 'dark';
    component.applyTheme();
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
  });

  it('should apply language to document', () => {
    component.selectedLanguage = 'en';
    component.applyLanguage();
    expect(document.documentElement.getAttribute('lang')).toBe('en');

    component.selectedLanguage = 'sk';
    component.applyLanguage();
    expect(document.documentElement.getAttribute('lang')).toBe('sk');
  });

  it('should get current language', () => {
    component.selectedLanguage = 'en';
    expect(component.getCurrentLanguage()).toBe('en');

    component.selectedLanguage = 'sk';
    expect(component.getCurrentLanguage()).toBe('sk');
  });

  it('should get current theme', () => {
    component.selectedTheme = 'dark';
    expect(component.getCurrentTheme()).toBe('dark');

    component.selectedTheme = 'light';
    expect(component.getCurrentTheme()).toBe('light');
  });

  it('should check if dark mode is active', () => {
    component.selectedTheme = 'dark';
    expect(component.isDarkMode()).toBe(true);

    component.selectedTheme = 'light';
    expect(component.isDarkMode()).toBe(false);
  });

  it('should get theme class', () => {
    component.selectedTheme = 'dark';
    expect(component.getThemeClass()).toContain('dark');

    component.selectedTheme = 'light';
    expect(component.getThemeClass()).toContain('light');
  });

  it('should get language label', () => {
    expect(component.getLanguageLabel('en')).toBe('English');
    expect(component.getLanguageLabel('sk')).toBe('Slovenský');
  });

  it('should get theme label', () => {
    expect(component.getThemeLabel('light')).toBe('Light');
    expect(component.getThemeLabel('dark')).toBe('Dark');
    expect(component.getThemeLabel('system')).toBe('System');
  });

  it('should have additional settings sections', () => {
    expect(component.additionalSettings.length).toBeGreaterThan(0);
    expect(component.additionalSettings[0].name).toBeDefined();
    expect(component.additionalSettings[0].description).toBeDefined();
  });

  it('should toggle additional setting', () => {
    const initialValue = component.additionalSettings[0].enabled;
    component.toggleSetting(0);
    expect(component.additionalSettings[0].enabled).toBe(!initialValue);
  });

  it('should get version info', () => {
    const version = component.getVersion();
    expect(version).toBeTruthy();
    expect(typeof version).toBe('string');
  });

  it('should get build date', () => {
    const buildDate = component.getBuildDate();
    expect(buildDate).toBeTruthy();
    expect(typeof buildDate).toBe('string');
  });

  it('should check for updates', () => {
    expect(() => component.checkForUpdates()).not.toThrow();
  });

  it('should process imported settings', () => {
    const mockSettings = {
      language: 'sk',
      theme: 'light'
    };

    component.processImportedSettings(mockSettings);

    expect(component.selectedLanguage).toBe('sk');
    expect(component.selectedTheme).toBe('light');
  });

  it('should handle invalid imported settings', () => {
    const mockSettings = {
      language: 'invalid',
      theme: 'invalid'
    };

    component.processImportedSettings(mockSettings);

    expect(component.selectedLanguage).toBe('en');
    expect(component.selectedTheme).toBe('dark');
  });

  it('should download JSON file', () => {
    const data = { test: 'data' };
    const filename = 'test.json';

    const mockAnchor = jasmine.createSpyObj('HTMLAnchorElement', ['click']);
    spyOn(document, 'createElement').and.returnValue(mockAnchor as any);
    spyOn(document.body, 'appendChild');
    spyOn(document.body, 'removeChild');

    component.downloadJson(data, filename);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });
});
