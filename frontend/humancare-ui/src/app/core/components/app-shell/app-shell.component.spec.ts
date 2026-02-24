import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppShellComponent } from './app-shell.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationService } from '../../services/navigation.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';

describe('AppShellComponent', () => {
  let component: AppShellComponent;
  let fixture: ComponentFixture<AppShellComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['closeSidebar'], {
      sidebarOpen$: of(true),
      isSidebarOpen: true
    });
    
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserverSpy.observe.and.returnValue(of({ matches: false }));

    await TestBed.configureTestingModule({
      imports: [
        AppShellComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call closeSidebar when onSidebarClosed is called', () => {
    component.onSidebarClosed();
    expect(navigationServiceSpy.closeSidebar).toHaveBeenCalled();
  });
});
