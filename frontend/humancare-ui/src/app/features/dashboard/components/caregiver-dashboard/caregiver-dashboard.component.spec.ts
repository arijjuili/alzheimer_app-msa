import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaregiverDashboardComponent } from './caregiver-dashboard.component';

describe('CaregiverDashboardComponent', () => {
  let component: CaregiverDashboardComponent;
  let fixture: ComponentFixture<CaregiverDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaregiverDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaregiverDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
