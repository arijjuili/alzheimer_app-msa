import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturesComponent } from './features.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('FeaturesComponent', () => {
  let component: FeaturesComponent;
  let fixture: ComponentFixture<FeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesComponent, BrowserAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 features', () => {
    expect(component.features.length).toBe(4);
  });

  it('should have correct feature data', () => {
    expect(component.features[0].title).toBe('Patient Management');
    expect(component.features[1].title).toBe('Secure Access');
    expect(component.features[2].title).toBe('Care Coordination');
    expect(component.features[3].title).toBe('Audit Trails');
  });
});
