import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LogoComponent } from '../logo/logo.component';
import { RouterModule } from '@angular/router';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), LogoComponent],
      declarations: [SidebarComponent],
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
    const category = component.menuItems()[0];
    component.toggleCategory(category.id);
    expect(component.expandedCategories()).toContain(category.id);
    
    component.toggleCategory(category.id);
    expect(component.expandedCategories()).not.toContain(category.id);
  });

  it('should check if category is expanded', () => {
    const category = component.menuItems()[0];
    expect(component.isCategoryExpanded(category.id)).toBe(false);
    
    component.toggleCategory(category.id);
    expect(component.isCategoryExpanded(category.id)).toBe(true);
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
