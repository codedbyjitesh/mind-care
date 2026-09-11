import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  state: 'loading' | 'success' | 'expired' | 'error' = 'loading';
  message = '';
  resendEmail = '';
  resendMessage = '';
  resendLoading = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'error';
      this.message = 'No verification token found in the URL.';
      this.cdr.detectChanges();
      return;
    }
    this.authService.verifyEmail(token).subscribe({
      next: (res: any) => {
        this.state = 'success';
        this.message = res.message || 'Email verified successfully!';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (err?.tokenExpired) {
          this.state = 'expired';
        } else {
          this.state = 'error';
        }
        this.message = err?.message || 'Verification failed.';
        this.cdr.detectChanges();
      }
    });
  }

  resendVerification() {
    if (!this.resendEmail) return;
    this.resendLoading = true;
    this.authService.resendVerification(this.resendEmail).subscribe({
      next: () => {
        this.resendLoading = false;
        this.resendMessage = 'Verification email sent! Check your inbox.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.resendLoading = false;
        this.resendMessage = 'Email sent if your address is registered.';
        this.cdr.detectChanges();
      }
    });
  }
}
