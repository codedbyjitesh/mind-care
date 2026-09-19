import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  loading = false;
  saving = false;
  successMessage = '';
  errorMessage = '';

  // Form Fields
  name = '';
  bio = '';
  studentId = '';
  phone = '';

  // Change Password
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordLoading = false;
  passwordSuccess = '';
  passwordError = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.name = data.name || '';
        this.bio = data.bio || '';
        this.studentId = data.studentId || '';
        this.phone = data.phone || '';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load user profile';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateProfile(): void {
    if (!this.name.trim()) {
      this.errorMessage = 'Full Name is required.';
      return;
    }

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userService.updateProfile({
      name: this.name.trim(),
      bio: this.bio.trim(),
      studentId: this.studentId.trim(),
      phone: this.phone.trim()
    }).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.saving = false;
        this.successMessage = 'Profile updated successfully!';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'Failed to update profile';
        this.cdr.detectChanges();
      }
    });
  }

  changePassword(): void {
    this.passwordSuccess = '';
    this.passwordError = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'All password fields are required.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New password confirmation does not match.';
      return;
    }

    this.passwordLoading = true;
    this.authService.changePassword(this.currentPassword, this.newPassword, this.confirmPassword).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Password changed successfully!';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.passwordLoading = false;
        this.passwordError = err?.message || 'Failed to change password';
        this.cdr.detectChanges();
      }
    });
  }
}
