import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactComponent } from './contact.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContactComponent,
        BrowserAnimationsModule,
        MatSnackBarModule,
        FormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 social links', () => {
    expect(component.socialLinks.length).toBe(4);
  });

  it('should have 3 footer links', () => {
    expect(component.footerLinks.length).toBe(3);
  });

  it('should reset form after submission', () => {
    component.contactForm = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message'
    };
    
    component.onSubmit();
    
    expect(component.contactForm.name).toBe('');
    expect(component.contactForm.email).toBe('');
    expect(component.contactForm.message).toBe('');
  });
});
