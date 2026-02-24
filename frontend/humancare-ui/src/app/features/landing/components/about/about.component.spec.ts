import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 stats', () => {
    expect(component.stats.length).toBe(4);
  });

  it('should have 4 team members', () => {
    expect(component.teamMembers.length).toBe(4);
  });

  it('should have correct stat data', () => {
    expect(component.stats[0].label).toBe('Patients');
    expect(component.stats[1].label).toBe('Caregivers');
    expect(component.stats[2].label).toBe('Uptime');
    expect(component.stats[3].label).toBe('Hospitals');
  });
});
