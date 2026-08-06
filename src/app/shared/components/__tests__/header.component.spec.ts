import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterModule.forRoot([])],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have current time signal', () => {
    const time = component.currentTime();
    expect(time).toBeTruthy();
  });

  it('should toggle sidebar', () => {
    const spy = spyOn(component.toggleSidebar, 'emit');
    component.onToggleSidebar();
    expect(spy).toHaveBeenCalled();
  });

  it('should change language', () => {
    const spy = spyOn(component.languageChange, 'emit');
    component.onLanguageChange('sk');
    expect(spy).toHaveBeenCalledWith('sk');
  });

  it('should get current route', () => {
    const route = component.currentRoute;
    expect(route).toBeTruthy();
  });

  it('should get page title', () => {
    const title = component.pageTitle;
    expect(title).toBeTruthy();
  });
});
