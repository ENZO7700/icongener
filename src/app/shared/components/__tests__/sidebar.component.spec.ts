import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LogoComponent } from '../logo/logo.component';
import { RouterModule } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterModule.forRoot([]), LogoComponent, HttpClientTestingModule],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have menu items', () => {
    expect(component.menuItems().length).toBeGreaterThan(0);
  });

  it('should have menu categories', () => {
    expect(component.menuItems().length).toBeGreaterThan(0);
  });

  it('should get items for category', () => {
    const items = component.getItemsForCategory('generators');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should toggle category', () => {
    component.toggleCategory('tools');
    expect(component.expandedCategories().has('tools')).toBeTrue();

    component.toggleCategory('tools');
    expect(component.expandedCategories().has('tools')).toBeFalse();
  });

  it('should check if category is expanded', () => {
    expect(component.isCategoryExpanded('tools')).toBe(false);

    component.toggleCategory('tools');
    expect(component.isCategoryExpanded('tools')).toBe(true);
  });

  it('should get icon for menu item', () => {
    const category = component.menuItems()[0];
    const item = component.getItemsForCategory(category.id)[0];
    const icon = component.getIcon(item.icon);
    expect(icon).toBeTruthy();
  });

  it('should get label for menu item', () => {
    const category = component.menuItems()[0];
    const item = component.getItemsForCategory(category.id)[0];
    const label = component.getLabel(item);
    expect(label).toBeTruthy();
  });

  it('should get path for menu item', () => {
    const category = component.menuItems()[0];
    const item = component.getItemsForCategory(category.id)[0];
    const path = component.getPath(item);
    expect(path).toBeTruthy();
    expect(path).toContain('/');
  });

  it('should check if item is active', () => {
    component.setCurrentPath('/');
    const category = component.menuItems()[0];
    const dashboardItem = category.items.find(item => item.route === '/');
    if (dashboardItem) {
      expect(component.isActive(dashboardItem)).toBe(true);
    }
  });

  it('should set current path', () => {
    component.setCurrentPath('/icons');
    expect(component.currentPath()).toBe('/icons');
  });
});
