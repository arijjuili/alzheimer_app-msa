import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    message: ''
  };

  socialLinks = [
    { icon: 'facebook', label: 'Facebook', url: '#' },
    { icon: 'twitter', label: 'Twitter', url: '#' },
    { icon: 'linkedin', label: 'LinkedIn', url: '#' },
    { icon: 'instagram', label: 'Instagram', url: '#' }
  ];

  footerLinks = [
    { label: 'Privacy Policy', url: '#' },
    { label: 'Terms of Service', url: '#' },
    { label: 'Contact', url: '#' }
  ];

  constructor(private snackBar: MatSnackBar) {}

  onSubmit(): void {
    if (this.contactForm.name && this.contactForm.email && this.contactForm.message) {
      // Simulate form submission
      this.snackBar.open('Thank you for your message! We will get back to you soon.', 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      
      // Reset form
      this.contactForm = {
        name: '',
        email: '',
        message: ''
      };
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
