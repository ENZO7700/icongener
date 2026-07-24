/**
 * Menu Model Tests
 * Tests for the menu model
 */

import { MenuItem, MenuCategory, MENU_ITEMS } from '../menu.model';

describe('Menu Model', () => {
  describe('MenuItem Interface', () => {
    it('should have required properties', () => {
      const menuItem: MenuItem = {
        id: 'test',
        label: 'Test',
        title: { en: 'Test', sk: 'Test' },
        icon: 'test-icon',
        route: '/test',
        category: 'test'
      };
      
      expect(menuItem.id).toBe('test');
      expect(menuItem.title).toBeDefined();
      expect(menuItem.title.en).toBe('Test');
      expect(menuItem.title.sk).toBe('Test');
      expect(menuItem.icon).toBe('test-icon');
      expect(menuItem.route).toBe('/test');
      expect(menuItem.category).toBe('test');
    });

    it('should have optional properties', () => {
      const menuItem: MenuItem = {
        id: 'test',
        label: 'Test',
        title: { en: 'Test', sk: 'Test' },
        icon: 'test-icon',
        route: '/test',
        category: 'test',
        children: [],
        badge: 'new',
        disabled: false,
        external: true
      };
      
      expect(menuItem.children).toEqual([]);
      expect(menuItem.badge).toBe('new');
      expect(menuItem.disabled).toBe(false);
      expect(menuItem.external).toBe(true);
    });
  });

  describe('MenuCategory Interface', () => {
    it('should have required properties', () => {
      const category: MenuCategory = {
        id: 'test',
        label: 'Test Category',
        title: { en: 'Test Category', sk: 'Test Kategória' },
        icon: 'category-icon',
        items: []
      };
      
      expect(category.id).toBe('test');
      expect(category.title).toBeDefined();
      expect(category.title.en).toBe('Test Category');
      expect(category.title.sk).toBe('Test Kategória');
      expect(category.icon).toBe('category-icon');
      expect(category.items).toEqual([]);
    });

    it('should have optional properties', () => {
      const category: MenuCategory = {
        id: 'test',
        label: 'Test Category',
        title: { en: 'Test Category', sk: 'Test Kategória' },
        icon: 'category-icon',
        items: [],
        expanded: true,
        visible: false
      };
      
      expect(category.expanded).toBe(true);
      expect(category.visible).toBe(false);
    });
  });

  describe('MENU_ITEMS', () => {
    it('should be defined', () => {
      expect(MENU_ITEMS).toBeDefined();
    });

    it('should be an array', () => {
      expect(Array.isArray(MENU_ITEMS)).toBe(true);
    });

    it('should have multiple categories', () => {
      expect(MENU_ITEMS.length).toBeGreaterThan(0);
    });

    it('should have main category', () => {
      const mainCategory = MENU_ITEMS.find(c => c.id === 'main');
      expect(mainCategory).toBeDefined();
      expect(mainCategory?.title.en).toContain('Main');
    });

    it('should have generators category', () => {
      const generatorsCategory = MENU_ITEMS.find(c => c.id === 'generators');
      expect(generatorsCategory).toBeDefined();
      expect(generatorsCategory?.title.en).toContain('Generators');
    });

    it('should have tools category', () => {
      const toolsCategory = MENU_ITEMS.find(c => c.id === 'tools');
      expect(toolsCategory).toBeDefined();
      expect(toolsCategory?.title.en).toContain('Tools');
    });

    it('should have dashboard item', () => {
      const mainCategory = MENU_ITEMS.find(c => c.id === 'main');
      const dashboardItem = mainCategory?.items.find(i => i.id === 'dashboard');
      expect(dashboardItem).toBeDefined();
      expect(dashboardItem?.route).toBe('/');
      expect(dashboardItem?.icon).toBeDefined();
    });

    it('should have icon generator item', () => {
      const generatorsCategory = MENU_ITEMS.find(c => c.id === 'generators');
      const iconGenItem = generatorsCategory?.items.find(i => i.id === 'icon-generator');
      expect(iconGenItem).toBeDefined();
      expect(iconGenItem?.route).toBe('/icon-generator');
      expect(iconGenItem?.title.en).toContain('Icon');
    });

    it('should have favicon generator item', () => {
      const generatorsCategory = MENU_ITEMS.find(c => c.id === 'generators');
      const faviconItem = generatorsCategory?.items.find(i => i.id === 'favicon-generator');
      expect(faviconItem).toBeDefined();
      expect(faviconItem?.route).toBe('/favicon-generator');
      expect(faviconItem?.title.en).toContain('Favicon');
    });

    it('should have banner generator item', () => {
      const generatorsCategory = MENU_ITEMS.find(c => c.id === 'generators');
      const bannerItem = generatorsCategory?.items.find(i => i.id === 'banner-generator');
      expect(bannerItem).toBeDefined();
      expect(bannerItem?.route).toBe('/banner-generator');
      expect(bannerItem?.title.en).toContain('Banner');
    });

    it('should have PNG to HTML item', () => {
      const toolsCategory = MENU_ITEMS.find(c => c.id === 'tools');
      const pngToHtmlItem = toolsCategory?.items.find(i => i.id === 'png-to-html');
      expect(pngToHtmlItem).toBeDefined();
      expect(pngToHtmlItem?.route).toBe('/png-to-html');
      expect(pngToHtmlItem?.title.en).toContain('PNG');
    });

    it('should have history item', () => {
      const toolsCategory = MENU_ITEMS.find(c => c.id === 'tools');
      const historyItem = toolsCategory?.items.find(i => i.id === 'history');
      expect(historyItem).toBeDefined();
      expect(historyItem?.route).toBe('/history');
      expect(historyItem?.title.en).toContain('History');
    });

    it('should have settings item', () => {
      const toolsCategory = MENU_ITEMS.find(c => c.id === 'tools');
      const settingsItem = toolsCategory?.items.find(i => i.id === 'settings');
      expect(settingsItem).toBeDefined();
      expect(settingsItem?.route).toBe('/settings');
      expect(settingsItem?.title.en).toContain('Settings');
    });

    it('should have all items with proper structure', () => {
      MENU_ITEMS.forEach(category => {
        expect(category.id).toBeDefined();
        expect(category.title).toBeDefined();
        expect(category.title.en).toBeDefined();
        expect(category.title.sk).toBeDefined();
        expect(category.icon).toBeDefined();
        expect(Array.isArray(category.items)).toBe(true);
        
        category.items.forEach(item => {
          expect(item.id).toBeDefined();
          expect(item.title).toBeDefined();
          expect(item.title.en).toBeDefined();
          expect(item.title.sk).toBeDefined();
          expect(item.icon).toBeDefined();
          expect(item.route).toBeDefined();
          expect(item.category).toBeDefined();
        });
      });
    });

    it('should have unique IDs for categories', () => {
      const categoryIds = MENU_ITEMS.map(c => c.id);
      const uniqueIds = new Set(categoryIds);
      expect(categoryIds.length).toBe(uniqueIds.size);
    });

    it('should have unique IDs for menu items', () => {
      const allItems = MENU_ITEMS.flatMap(c => c.items);
      const itemIds = allItems.map(i => i.id);
      const uniqueIds = new Set(itemIds);
      expect(itemIds.length).toBe(uniqueIds.size);
    });

    it('should have unique routes for menu items', () => {
      const allItems = MENU_ITEMS.flatMap(c => c.items);
      const routes = allItems.map(i => i.route);
      const uniqueRoutes = new Set(routes);
      expect(routes.length).toBe(uniqueRoutes.size);
    });

    it('should have proper category assignment for items', () => {
      MENU_ITEMS.forEach(category => {
        category.items.forEach(item => {
          expect(item.category).toBe(category.id);
        });
      });
    });

    it('should have translations for all items', () => {
      MENU_ITEMS.forEach(category => {
        expect(category.title.en).toBeTruthy();
        expect(category.title.sk).toBeTruthy();
        
        category.items.forEach(item => {
          expect(item.title.en).toBeTruthy();
          expect(item.title.sk).toBeTruthy();
        });
      });
    });

    it('should have icons for all items', () => {
      MENU_ITEMS.forEach(category => {
        expect(category.icon).toBeTruthy();
        
        category.items.forEach(item => {
          expect(item.icon).toBeTruthy();
        });
      });
    });

    it('should have at least 6 menu items', () => {
      const allItems = MENU_ITEMS.flatMap(c => c.items);
      expect(allItems.length).toBeGreaterThanOrEqual(6);
    });

    it('should have proper route format', () => {
      const allItems = MENU_ITEMS.flatMap(c => c.items);
      allItems.forEach(item => {
        expect(item.route.startsWith('/')).toBe(true);
        expect(item.route).not.toContain(' ');
      });
    });
  });

  describe('Menu Utility Functions', () => {
    it('should get all menu items flattened', () => {
      const allItems = MENU_ITEMS.flatMap(c => c.items);
      expect(allItems.length).toBeGreaterThan(0);
    });

    it('should find menu item by ID', () => {
      const allItems = MENU_ITEMS.flatMap(c => c.items);
      const dashboardItem = allItems.find(i => i.id === 'dashboard');
      expect(dashboardItem).toBeDefined();
    });

    it('should find menu item by route', () => {
      const allItems = MENU_ITEMS.flatMap(c => c.items);
      const dashboardItem = allItems.find(i => i.route === '/');
      expect(dashboardItem).toBeDefined();
    });

    it('should get category by ID', () => {
      const mainCategory = MENU_ITEMS.find(c => c.id === 'main');
      expect(mainCategory).toBeDefined();
    });

    it('should get items by category', () => {
      const mainCategory = MENU_ITEMS.find(c => c.id === 'main');
      expect(mainCategory?.items.length).toBeGreaterThan(0);
    });
  });
});
