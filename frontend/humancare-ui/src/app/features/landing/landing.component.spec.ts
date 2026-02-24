import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingComponent } from './landing.component';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, BrowserAnimationsModule],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 navigation links', () => {
    expect(component.navLinks.length).toBe(4);
  });

  it('should toggle mobile menu', () => {
    expect(component.mobileMenuOpen).toBe(false);
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen).toBe(true);
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen).toBe(false);
  });

  it('should close mobile menu when scrolling to section', () => {
    component.mobileMenuOpen = true;
    component.scrollToSection('features');
    expect(component.mobileMenuOpen).toBe(false);
  });

  it('should track scroll state', () => {
    expect(component.isScrolled).toBe(false);
    
    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    component.onWindowScroll();
    expect(component.isScrolled).toBe(true);
    
    // Reset scroll
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    component.onWindowScroll();
    expect(component.isScrolled).toBe(false);
  });
});
