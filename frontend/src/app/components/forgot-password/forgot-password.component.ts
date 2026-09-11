import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email = '';
  message = '';
  isSuccess = false;
  loading = false;

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  onSubmit() {
    if (!this.email) { this.message = 'Please enter your email address.'; return; }
    this.loading = true;
    this.message = '';
    this.cdr.detectChanges();

    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.isSuccess = true;
        this.message = res.message || 'If this email is registered, a reset link has been sent.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.isSuccess = true; // Always show generic success to prevent enumeration
        this.message = 'If this email is registered, a password reset link has been sent to your inbox.';
        this.cdr.detectChanges();
      }
    });
  }
}
