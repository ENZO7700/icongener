/**
 * History Component Tests
 * Tests for the history component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryComponent, HistoryItem } from '../history.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { DownloadService } from '../../../core/services/download.service';
import { ToastService } from '../../../core/services/toast.service';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let downloadServiceSpy: jasmine.SpyObj<DownloadService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    localStorage.clear();
    downloadServiceSpy = jasmine.createSpyObj('DownloadService', ['downloadPng', 'downloadSvg', 'downloadText', 'downloadZip']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'getToasts']);
    toastServiceSpy.getToasts.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [HistoryComponent, CommonModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: DownloadService, useValue: downloadServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation & Defaults ───────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty history by default', () => {
    expect(component.historyItems()).toEqual([]);
    expect(component.selectedItem()).toBeNull();
    expect(component.searchQuery()).toBe('');
    expect(component.selectedType()).toBe('all');
  });

  it('should default language to en', () => {
    expect(component.language()).toBe('en');
  });

  // ─── Translation ──────────────────────────────────────────────────

  it('should translate keys in English', () => {
    component.language.set('en');
    expect(component.translate('history')).toBe('History');
    expect(component.translate('clearHistory')).toBe('Clear History');
  });

  it('should translate keys in Slovak', () => {
    component.language.set('sk');
    expect(component.translate('history')).toBe('História');
    expect(component.translate('clearHistory')).toBe('Vymazať históriu');
  });

  it('should return key for unknown translation', () => {
    expect(component.translate('unknown_key')).toBe('unknown_key');
  });

  // ─── LocalStorage & Item Operations ───────────────────────────────

  it('should load history from localStorage', () => {
    const mockItems: HistoryItem[] = [
      { id: '1', type: 'icon', name: 'Test Icon', preview: '', data: {}, timestamp: Date.now() }
    ];
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockItems));

    component.loadHistory();
    expect(component.historyItems()).toEqual(mockItems);
  });

  it('should save history to localStorage', () => {
    spyOn(localStorage, 'setItem');
    const mockItems: HistoryItem[] = [
      { id: '1', type: 'icon', name: 'Test Icon', preview: '', data: {}, timestamp: Date.now() }
    ];
    component.historyItems.set(mockItems);

    component.saveHistory();
    expect(localStorage.setItem).toHaveBeenCalledWith('icongener-history', JSON.stringify(mockItems));
  });

  it('should add item to history', () => {
    spyOn(localStorage, 'setItem');
    const item: HistoryItem = { id: '1', type: 'icon', name: 'New Icon', preview: '', data: {}, timestamp: Date.now() };

    component.addItem(item);
    expect(component.historyItems().length).toBe(1);
    expect(component.historyItems()[0]).toEqual(item);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should remove item from history', () => {
    spyOn(localStorage, 'setItem');
    const item1: HistoryItem = { id: '1', type: 'icon', name: 'Icon 1', preview: '', data: {}, timestamp: Date.now() };
    const item2: HistoryItem = { id: '2', type: 'favicon', name: 'Favicon 2', preview: '', data: {}, timestamp: Date.now() };
    component.historyItems.set([item1, item2]);

    component.removeItem('1');
    expect(component.historyItems().length).toBe(1);
    expect(component.historyItems()[0].id).toBe('2');
    expect(toastServiceSpy.success).toHaveBeenCalledWith('Item removed from history');
  });

  it('should clear history when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(localStorage, 'setItem');
    component.historyItems.set([
      { id: '1', type: 'icon', name: 'Icon 1', preview: '', data: {}, timestamp: Date.now() }
    ]);

    component.clearHistory();
    expect(component.historyItems()).toEqual([]);
    expect(toastServiceSpy.success).toHaveBeenCalledWith('History cleared');
  });

  it('should not clear history when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.historyItems.set([
      { id: '1', type: 'icon', name: 'Icon 1', preview: '', data: {}, timestamp: Date.now() }
    ]);

    component.clearHistory();
    expect(component.historyItems().length).toBe(1);
  });

  // ─── Filtering & Selection ────────────────────────────────────────

  it('should filter items by type', () => {
    const item1: HistoryItem = { id: '1', type: 'icon', name: 'Icon 1', preview: '', data: {}, timestamp: Date.now() };
    const item2: HistoryItem = { id: '2', type: 'favicon', name: 'Favicon 1', preview: '', data: {}, timestamp: Date.now() };
    component.historyItems.set([item1, item2]);

    component.setType('icon');
    expect(component.filteredItems()).toEqual([item1]);
  });

  it('should filter items by searchQuery', () => {
    const item1: HistoryItem = { id: '1', type: 'icon', name: 'Apple Icon', preview: '', data: {}, timestamp: Date.now() };
    const item2: HistoryItem = { id: '2', type: 'icon', name: 'Banana Icon', preview: '', data: {}, timestamp: Date.now() };
    component.historyItems.set([item1, item2]);

    component.searchQuery.set('Apple');
    expect(component.filteredItems()).toEqual([item1]);
  });

  it('should select and close details of an item', () => {
    const item: HistoryItem = { id: '1', type: 'icon', name: 'Test', preview: '', data: {}, timestamp: Date.now() };
    component.selectItem(item);
    expect(component.selectedItem()).toEqual(item);

    component.closeDetails();
    expect(component.selectedItem()).toBeNull();
  });

  // ─── Downloads ────────────────────────────────────────────────────

  it('should download png-to-html item as html file', () => {
    const item: HistoryItem = {
      id: 'abc',
      type: 'png-to-html',
      name: 'HTML Image',
      preview: '',
      data: { htmlCode: '<div>code</div>' },
      timestamp: Date.now()
    };

    component.downloadItem(item);
    expect(downloadServiceSpy.downloadText).toHaveBeenCalledWith('<div>code</div>', 'generated-abc.html', 'text/html');
    expect(toastServiceSpy.success).toHaveBeenCalledWith('HTML downloaded');
  });

  it('should download png item', () => {
    const item: HistoryItem = {
      id: '1',
      type: 'icon',
      name: 'My Icon',
      preview: '',
      data: { pngBase64: 'data:image/png;base64,abc' },
      timestamp: Date.now()
    };

    component.downloadItem(item);
    expect(downloadServiceSpy.downloadPng).toHaveBeenCalledWith('data:image/png;base64,abc', 'my-icon.png');
    expect(toastServiceSpy.success).toHaveBeenCalledWith('Image downloaded');
  });

  it('should download svg item', () => {
    const item: HistoryItem = {
      id: '1',
      type: 'icon',
      name: 'My SVG Icon',
      preview: '',
      data: { svgCode: '<svg></svg>' },
      timestamp: Date.now()
    };

    component.downloadItem(item);
    expect(downloadServiceSpy.downloadSvg).toHaveBeenCalledWith('<svg></svg>', 'my-svg-icon.svg');
    expect(toastServiceSpy.success).toHaveBeenCalledWith('SVG downloaded');
  });

  // ─── Helpers ──────────────────────────────────────────────────────

  it('should return type label', () => {
    component.language.set('en');
    expect(component.getTypeLabel('icon')).toBe('Icons');
    expect(component.getTypeLabel('favicon')).toBe('Favicons');
  });

  it('should format date timestamp', () => {
    const ts = new Date('2025-05-10T10:00:00Z').getTime();
    const formatted = component.formatDate(ts);
    expect(formatted).toBeTruthy();
  });
});
