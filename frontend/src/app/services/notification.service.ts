import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface AppNotification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

export interface NotificationSettings {
  _id?: string;
  userId?: string;
  moodReminder: boolean;
  stressReminder: boolean;
  journalReminder: boolean;
  habitReminder: boolean;
  wellnessReminder: boolean;
  reminderTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getNotifications(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(this.baseUrl, { headers: this.getHeaders() });
  }

  markAsRead(id: string): Observable<AppNotification> {
    return this.http.put<AppNotification>(`${this.baseUrl}/${id}/read`, {}, { headers: this.getHeaders() });
  }

  markAllAsRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/read-all`, {}, { headers: this.getHeaders() });
  }

  getSettings(): Observable<NotificationSettings> {
    return this.http.get<NotificationSettings>(`${this.baseUrl}/settings`, { headers: this.getHeaders() });
  }

  updateSettings(settings: Partial<NotificationSettings>): Observable<NotificationSettings> {
    return this.http.put<NotificationSettings>(`${this.baseUrl}/settings`, settings, { headers: this.getHeaders() });
  }
}
