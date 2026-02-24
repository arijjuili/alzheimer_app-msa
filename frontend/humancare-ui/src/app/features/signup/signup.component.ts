import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

interface RegisterRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: Role;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  roles = [
    { value: Role.PATIENT, label: 'Patient', icon: 'person', description: 'I need healthcare services' },
    { value: Role.CAREGIVER, label: 'Caregiver', icon: 'family_restroom', description: 'I provide care to patients' },
    { value: Role.DOCTOR, label: 'Doctor', icon: 'medical_services', description: 'I am a medical professional' }
  ];

  private apiUrl = environment.apiUrl || 'http://localhost:8081';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // If already authenticated, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/app/dashboard']);
      return;
    }

    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/)
      ]],
      role: [Role.PATIENT, Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.signupForm.value;

    const registerData: RegisterRequest = {
      username: formValue.username,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      password: formValue.password,
      role: formValue.role
    };

    // Call our backend API to register the user (via Gateway)
    this.http.post(`${this.apiUrl}/auth/register`, registerData, { observe: 'response' }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 201) {
          this.snackBar.open('Account created successfully! Please log in.', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        const message = error.error?.message || error.message || 'Registration failed. Please try again.';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.signupForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
    if (control.errors['pattern']) {
      if (controlName === 'username') return 'Only letters, numbers, and underscores allowed';
      if (controlName === 'password') return 'Password must contain: uppercase, lowercase, number, and at least one special character';
    }
    return 'Invalid value';
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
