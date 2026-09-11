import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  token?: string;
  emailVerified?: boolean;
  emailNotifications?: { moodReminder: boolean; journalReminder: boolean; meditationReminder: boolean; };
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';

  currentUser = signal<User | null>(this.getStoredUser());

  constructor(private http: HttpClient, private router: Router) {
    if (this.getToken()) {
      this.fetchCurrentUser().subscribe({ error: () => this.logout() });
    }
  }

  private getStoredUser(): User | null {
    const s = localStorage.getItem('mindcare_user');
    return s ? JSON.parse(s) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('mindcare_token');
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` });
  }

  private handleAuthSuccess(res: User) {
    if (res.token) localStorage.setItem('mindcare_token', res.token);
    const u = { _id: res._id, name: res.name, email: res.email, role: res.role, emailVerified: res.emailVerified, emailNotifications: res.emailNotifications };
    localStorage.setItem('mindcare_user', JSON.stringify(u));
    this.currentUser.set(u);
  }

  register(userData: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, userData).pipe(
      catchError((err) => throwError(() => err.error))
    );
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      catchError((err) => throwError(() => err.error))
    );
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/verify-email`, { params: { token } }).pipe(
      catchError((err) => throwError(() => err.error))
    );
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/resend-verification`, { email }).pipe(
      catchError((err) => throwError(() => err.error))
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/forgot-password`, { email }).pipe(
      catchError((err) => throwError(() => err.error))
    );
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reset-password`, { token, newPassword, confirmPassword }).pipe(
      catchError((err) => throwError(() => err.error))
    );
  }

  changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/change-password`,
      { currentPassword, newPassword, confirmNewPassword },
      { headers: this.getAuthHeaders() }
    ).pipe(catchError((err) => throwError(() => err.error)));
  }

  updateProfile(data: { name?: string; email?: string }): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/profile`, data, { headers: this.getAuthHeaders() }).pipe(
      tap((u) => {
        this.currentUser.set(u);
        localStorage.setItem('mindcare_user', JSON.stringify(u));
      }),
      catchError((err) => throwError(() => err.error))
    );
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`, { headers: this.getAuthHeaders() }).pipe(
      tap((user) => {
        this.currentUser.set(user);
        localStorage.setItem('mindcare_user', JSON.stringify(user));
      })
    );
  }

  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/settings`, { headers: this.getAuthHeaders() });
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/settings`, settings, { headers: this.getAuthHeaders() });
  }

  logout() {
    localStorage.removeItem('mindcare_token');
    localStorage.removeItem('mindcare_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean { return !!this.getToken() && !!this.currentUser(); }
  isAdmin(): boolean { return this.currentUser()?.role === 'admin'; }
}
