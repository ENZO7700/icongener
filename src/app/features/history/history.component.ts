import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DownloadService } from '../../core/services/download.service';
import { ToastService, ToastContainerComponent } from '../../core/services/toast.service';

export interface HistoryItem {
  id: string;
  type: 'icon' | 'favicon' | 'banner' | 'png-to-html';
  name: string;
  preview: string;
  data: any;
  timestamp: number;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastContainerComponent],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  // State
  language = signal<'en' | 'sk'>('en');
  historyItems = signal<HistoryItem[]>([]);
  selectedItem = signal<HistoryItem | null>(null);
  searchQuery = signal<string>('');
  selectedType = signal<string>('all');
  
  // Injected services
  private downloadService = inject(DownloadService);
  private toastService = inject(ToastService);
  
  // Types
  types = ['all', 'icon', 'favicon', 'banner', 'png-to-html'];
  
  // Filtered items
  filteredItems = computed(() => {
    let items = this.historyItems();
    const query = this.searchQuery().toLowerCase();
    const type = this.selectedType();
    
    if (type !== 'all') {
      items = items.filter(item => item.type === type);
    }
    
    if (query) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.id.includes(query)
      );
    }
    
    return items.sort((a, b) => b.timestamp - a.timestamp);
  });
  
  constructor() {}
  
  ngOnInit(): void {
    // Load saved language
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'sk') {
      this.language.set(savedLang);
    }
    
    // Load history from localStorage
    this.loadHistory();
  }
  
  // Translation helper
  translate(key: string): string {
    const translations: { [key: string]: { en: string; sk: string } } = {
      history: { en: 'History', sk: 'História' },
      description: { en: 'View your previously generated items', sk: 'Zobrazte si predtým vygenerované položky' },
      search: { en: 'Search', sk: 'Hľadať' },
      searchPlaceholder: { en: 'Search by name or ID...', sk: 'Hľadať podľa názvu alebo ID...' },
      filterByType: { en: 'Filter by Type', sk: 'Filtrovať podľa typu' },
      all: { en: 'All', sk: 'Všetko' },
      icons: { en: 'Icons', sk: 'Ikony' },
      favicons: { en: 'Favicons', sk: 'Favicony' },
      banners: { en: 'Banners', sk: 'Bannery' },
      pngToHtml: { en: 'PNG to HTML', sk: 'PNG na HTML' },
      noItems: { en: 'No history items found.', sk: 'Nenašli sa žiadne položky histórie.' },
      clearHistory: { en: 'Clear History', sk: 'Vymazať históriu' },
      clearConfirm: { en: 'Are you sure you want to clear all history?', sk: 'Ste si istý, že chcete vymazať celú históriu?' },
      yes: { en: 'Yes', sk: 'Áno' },
      no: { en: 'No', sk: 'Nie' },
      download: { en: 'Download', sk: 'Stiahnuť' },
      delete: { en: 'Delete', sk: 'Vymazať' },
      viewDetails: { en: 'View Details', sk: 'Zobraziť podrobnosti' },
      date: { en: 'Date', sk: 'Dátum' },
      type: { en: 'Type', sk: 'Typ' },
      actions: { en: 'Actions', sk: 'Akcie' }
    };
    
    return translations[key]?.[this.language()] || key;
  }
  
  // Load history from localStorage
  loadHistory(): void {
    try {
      const saved = localStorage.getItem('icongener-history');
      if (saved) {
        this.historyItems.set(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }
  
  // Save history to localStorage
  saveHistory(): void {
    try {
      localStorage.setItem('icongener-history', JSON.stringify(this.historyItems()));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }
  
  // Add item to history
  addItem(item: HistoryItem): void {
    this.historyItems.update(items => [item, ...items.slice(0, 49)]); // Keep last 50 items
    this.saveHistory();
  }
  
  // Remove item from history
  removeItem(id: string): void {
    this.historyItems.update(items => items.filter(item => item.id !== id));
    this.saveHistory();
    this.toastService.success('Item removed from history');
  }
  
  // Clear all history
  clearHistory(): void {
    if (confirm(this.translate('clearConfirm'))) {
      this.historyItems.set([]);
      this.saveHistory();
      this.toastService.success('History cleared');
    }
  }
  
  // Select item
  selectItem(item: HistoryItem): void {
    this.selectedItem.set(item);
    if (typeof document !== 'undefined') {
      document.body.classList.add('body-scroll-lock');
    }
  }
  
  // Close details
  closeDetails(): void {
    this.selectedItem.set(null);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('body-scroll-lock');
    }
  }

  
  // Download item
  downloadItem(item: HistoryItem): void {
    try {
      if (item.type === 'png-to-html' && item.data?.htmlCode) {
        const filename = `generated-${item.id}.html`;
        this.downloadService.downloadText(item.data.htmlCode, filename, 'text/html');
        this.toastService.success('HTML downloaded');
      } else if (item.data?.pngBase64) {
        const filename = `${item.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        this.downloadService.downloadPng(item.data.pngBase64, filename);
        this.toastService.success('Image downloaded');
      } else if (item.data?.svgCode) {
        const filename = `${item.name.replace(/\s+/g, '-').toLowerCase()}.svg`;
        this.downloadService.downloadSvg(item.data.svgCode, filename);
        this.toastService.success('SVG downloaded');
      }
    } catch (error) {
      console.error('Error downloading item:', error);
      this.toastService.error('Failed to download item');
    }
  }
  
  // Get type label
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      icon: this.translate('icons'),
      favicon: this.translate('favicons'),
      banner: this.translate('banners'),
      'png-to-html': this.translate('pngToHtml')
    };
    return labels[type] || type;
  }
  
  // Format date
  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString(this.language(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Set type filter
  setType(type: string): void {
    this.selectedType.set(type);
  }
}
