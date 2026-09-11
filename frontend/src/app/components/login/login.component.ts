import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  emailNotVerified = false;
  unverifiedEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.emailNotVerified = false;
    this.cdr.detectChanges();

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => {
        this.loading = false;
        this.successMessage = `Welcome back, ${user.name}! Redirecting...`;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate([user.role === 'admin' ? '/admin' : '/dashboard']);
        }, 900);
      },
      error: (err) => {
        this.loading = false;
        if (err?.emailNotVerified) {
          this.emailNotVerified = true;
          this.unverifiedEmail = err.email || this.email;
          this.errorMessage = err.message || 'Please verify your email before logging in.';
        } else {
          this.errorMessage = err?.message || err || 'Invalid email or password.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  resendVerification() {
    this.authService.resendVerification(this.unverifiedEmail || this.email).subscribe({
      next: () => {
        this.errorMessage = '';
        this.successMessage = 'Verification email sent! Check your inbox.';
        this.emailNotVerified = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.successMessage = 'Verification email sent! Check your inbox.';
        this.cdr.detectChanges();
      }
    });
  }
}
