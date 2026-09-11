import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Tab state
  activeTab: 'home' | 'profile' | 'settings' = 'home';

  // Profile edit
  editName = '';
  profileMessage = '';
  profileError = '';
  profileLoading = false;

  // Change password
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  passwordMessage = '';
  passwordError = '';
  passwordLoading = false;

  // Email notification settings
  moodReminder = true;
  journalReminder = true;
  meditationReminder = true;
  settingsMessage = '';
  settingsError = '';
  settingsLoading = false;

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    this.editName = this.user?.name || '';
    this.moodReminder = this.user?.emailNotifications?.moodReminder ?? true;
    this.journalReminder = this.user?.emailNotifications?.journalReminder ?? true;
    this.meditationReminder = this.user?.emailNotifications?.meditationReminder ?? true;

    // Fetch latest settings from backend
    this.authService.getSettings().subscribe({
      next: (res: any) => {
        if (res?.emailNotifications) {
          this.moodReminder = res.emailNotifications.moodReminder;
          this.journalReminder = res.emailNotifications.journalReminder;
          this.meditationReminder = res.emailNotifications.meditationReminder;
        }
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: 'home' | 'profile' | 'settings') {
    this.activeTab = tab;
    this.clearMessages();
  }

  clearMessages() {
    this.profileMessage = this.profileError = '';
    this.passwordMessage = this.passwordError = '';
    this.settingsMessage = this.settingsError = '';
  }

  updateProfile() {
    if (!this.editName.trim()) { this.profileError = 'Name cannot be empty.'; return; }
    this.profileLoading = true;
    this.profileError = '';
    this.profileMessage = '';
    this.authService.updateProfile({ name: this.editName.trim() }).subscribe({
      next: (u: User) => {
        this.profileLoading = false;
        this.user = u;
        this.profileMessage = '✅ Profile updated successfully!';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.profileLoading = false;
        this.profileError = err?.message || 'Failed to update profile.';
        this.cdr.detectChanges();
      }
    });
  }

  changePassword() {
    this.passwordError = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.passwordError = 'All password fields are required.'; return;
    }
    if (this.newPassword.length < 8) {
      this.passwordError = 'New password must be at least 8 characters.'; return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError = 'New passwords do not match.'; return;
    }
    this.passwordLoading = true;
    this.authService.changePassword(this.currentPassword, this.newPassword, this.confirmNewPassword).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordMessage = '✅ Password changed successfully!';
        this.currentPassword = this.newPassword = this.confirmNewPassword = '';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.passwordLoading = false;
        this.passwordError = err?.message || 'Failed to change password.';
        this.cdr.detectChanges();
      }
    });
  }

  saveSettings() {
    this.settingsLoading = true;
    this.settingsError = '';
    this.settingsMessage = '';
    this.authService.updateSettings({
      emailNotifications: {
        moodReminder: this.moodReminder,
        journalReminder: this.journalReminder,
        meditationReminder: this.meditationReminder
      }
    }).subscribe({
      next: () => {
        this.settingsLoading = false;
        this.settingsMessage = '✅ Notification settings saved!';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.settingsLoading = false;
        this.settingsError = err?.message || 'Failed to save settings.';
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
