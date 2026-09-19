import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, AppNotification, NotificationSettings } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationComponent implements OnInit {
  notifications: AppNotification[] = [];
  unreadCount = 0;
  settings: NotificationSettings | null = null;

  loading = false;
  savingSettings = false;
  successMessage = '';
  errorMessage = '';

  constructor(private notifService: NotificationService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.notifService.getNotifications().subscribe({
      next: (res) => {
        this.notifications = res.notifications;
        this.unreadCount = res.unreadCount;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to retrieve notifications';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.notifService.getSettings().subscribe({
      next: (s) => {
        this.settings = s;
        this.cdr.detectChanges();
      }
    });
  }

  markRead(n: AppNotification): void {
    if (n.read) return;
    this.notifService.markAsRead(n._id).subscribe({
      next: (updated) => {
        n.read = true;
        if (this.unreadCount > 0) this.unreadCount--;
        this.cdr.detectChanges();
      }
    });
  }

  markAllRead(): void {
    this.notifService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.read = true));
        this.unreadCount = 0;
        this.successMessage = 'All notifications marked as read.';
        this.cdr.detectChanges();
      }
    });
  }

  savePreferences(): void {
    if (!this.settings) return;
    this.savingSettings = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.notifService.updateSettings(this.settings).subscribe({
      next: () => {
        this.savingSettings = false;
        this.successMessage = 'Reminder schedule and notification preferences updated successfully!';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingSettings = false;
        this.errorMessage = err?.error?.message || 'Failed to update reminder settings';
        this.cdr.detectChanges();
      }
    });
  }
}
