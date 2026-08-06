import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from '../main-layout/main-layout.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent, RouterModule.forRoot([]), HttpClientTestingModule],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have sidebar open by default on desktop', () => {
    expect(component.isSidebarOpen()).toBe(true);
  });

  it('should toggle sidebar', () => {
    component.toggleSidebar();
    expect(component.isSidebarOpen()).toBe(false);
    
    component.toggleSidebar();
    expect(component.isSidebarOpen()).toBe(true);
  });

  it('should close sidebar', () => {
    component.closeSidebar();
    expect(component.isSidebarOpen()).toBe(false);
  });

  it('should open sidebar', () => {
    component.closeSidebar();
    component.openSidebar();
    expect(component.isSidebarOpen()).toBe(true);
  });

  it('should toggle language', () => {
    const initialLang = component.language();
    component.toggleLanguage();
    expect(component.language()).not.toBe(initialLang);
  });

  it('should get content padding class', () => {
    const padding = component.getContentPadding();
    expect(padding).toBe('64px');
  });

  it('should get sidebar width class', () => {
    const width = component.getSidebarWidth();
    expect(width).toBe('280px');
  });
});
