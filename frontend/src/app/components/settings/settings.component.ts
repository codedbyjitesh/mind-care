import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, NotificationSettings } from '../../services/notification.service';
import { UserService, UserProfile } from '../../services/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  profile: UserProfile | null = null;
  settings: NotificationSettings | null = null;
  loading = false;
  saving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private notifService: NotificationService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (u) => {
        this.profile = u;
        this.cdr.detectChanges();
      }
    });

    this.notifService.getSettings().subscribe({
      next: (s) => {
        this.settings = s;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load settings';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveSettings(): void {
    if (!this.settings) return;
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.notifService.updateSettings(this.settings).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Settings saved successfully!';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'Failed to save settings';
        this.cdr.detectChanges();
      }
    });
  }
}
