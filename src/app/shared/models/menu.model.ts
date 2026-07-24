export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  category: string;
  translationKey?: string;
  title: {
    en: string;
    sk: string;
  };
  children?: MenuItem[];
  badge?: string;
  disabled?: boolean;
  external?: boolean;
}

export interface MenuCategory {
  id: string;
  label: string;
  icon: string;
  translationKey?: string;
  title: {
    en: string;
    sk: string;
  };
  items: MenuItem[];
  expanded?: boolean;
  visible?: boolean;
}

// Menu items for the sidebar
export const MENU_ITEMS: MenuCategory[] = [
  {
    id: 'main',
    label: 'Main',
    title: { en: 'Main', sk: 'Hlavné' },
    icon: 'dashboard',
    translationKey: 'menuMain',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        title: { en: 'Dashboard', sk: 'Nástroje' },
        icon: 'dashboard',
        route: '/',
        category: 'main',
        translationKey: 'menuDashboard'
      }
    ]
  },
  {
    id: 'generators',
    label: 'Generators',
    title: { en: 'Generators', sk: 'Generátory' },
    icon: 'icon',
    translationKey: 'menuGenerators',
    items: [
      {
        id: 'icon-generator',
        label: 'Icon Generator',
        title: { en: 'Icon Generator', sk: 'Generátor ikon' },
        icon: 'icon',
        route: '/icon-generator',
        category: 'generators',
        translationKey: 'menuIconGenerator'
      },
      {
        id: 'favicon-generator',
        label: 'Favicon Generator',
        title: { en: 'Favicon Generator', sk: 'Generátor faviconov' },
        icon: 'favicon',
        route: '/favicon-generator',
        category: 'generators',
        translationKey: 'menuFaviconGenerator'
      },
      {
        id: 'banner-generator',
        label: 'Banner Generator',
        title: { en: 'Banner Generator', sk: 'Generátor bannerov' },
        icon: 'banner',
        route: '/banner-generator',
        category: 'generators',
        translationKey: 'menuBannerGenerator'
      }
    ]
  },
  {
    id: 'tools',
    label: 'Tools',
    title: { en: 'Tools', sk: 'Nástroje' },
    icon: 'convert',
    translationKey: 'menuTools',
    items: [
      {
        id: 'png-to-html',
        label: 'PNG to HTML',
        title: { en: 'PNG to HTML', sk: 'PNG na HTML' },
        icon: 'convert',
        route: '/png-to-html',
        category: 'tools',
        translationKey: 'menuPngToHtml'
      },
      {
        id: 'history',
        label: 'History',
        title: { en: 'History', sk: 'História' },
        icon: 'history',
        route: '/history',
        category: 'tools',
        translationKey: 'menuHistory'
      },
      {
        id: 'settings',
        label: 'Settings',
        title: { en: 'Settings', sk: 'Nastavenia' },
        icon: 'settings',
        route: '/settings',
        category: 'tools',
        translationKey: 'menuSettings'
      }
    ]
  }
];

// Icon definitions for menu items
export const ICONS: { [key: string]: string } = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>`,
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>`,
  favicon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <path d="M9 9h6v6H9z"/>
  </svg>`,
  banner: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <path d="M7 10h10"/>
    <path d="M7 14h10"/>
  </svg>`,
  convert: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>`,
  history: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`
};
