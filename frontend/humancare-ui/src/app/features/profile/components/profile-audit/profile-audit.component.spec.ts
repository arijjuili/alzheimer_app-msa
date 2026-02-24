import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileAuditComponent } from './profile-audit.component';

describe('ProfileAuditComponent', () => {
  let component: ProfileAuditComponent;
  let fixture: ComponentFixture<ProfileAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileAuditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
