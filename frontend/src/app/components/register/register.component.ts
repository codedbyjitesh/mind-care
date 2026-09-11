import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  registrationComplete = false;
  registeredEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please complete all fields.'; return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.'; return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.'; return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.registrationComplete = true;
        this.registeredEmail = res.email || this.email;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.message || err || 'Registration failed. Email might already be registered.';
        this.cdr.detectChanges();
      }
    });
  }
}
