import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroComponent } from './hero.component';
import { provideRouter } from '@angular/router';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should scroll to features section', () => {
    const mockElement = document.createElement('div');
    mockElement.id = 'features';
    mockElement.scrollIntoView = jest.fn();
    document.body.appendChild(mockElement);

    component.scrollToFeatures();
    
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    
    document.body.removeChild(mockElement);
  });
});
