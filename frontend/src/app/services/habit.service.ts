import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface HabitCompletion {
  date: string;
  completed: boolean;
}

export interface Habit {
  _id?: string;
  userId?: string;
  title: string;
  description?: string;
  frequency: 'Daily' | 'Weekly';
  startDate?: string;
  active: boolean;
  completionHistory: HabitCompletion[];
  streak: number;
  isCompletedToday?: boolean;
  totalCompletedDays?: number;
  createdAt?: string;
}

export interface HabitResponse {
  habits: Habit[];
  statistics: {
    total: number;
    active: number;
    completedToday: number;
    completionRate: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private baseUrl = `${environment.apiUrl}/habits`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getHabits(): Observable<HabitResponse> {
    return this.http.get<HabitResponse>(this.baseUrl, { headers: this.getHeaders() });
  }

  createHabit(data: Partial<Habit>): Observable<Habit> {
    return this.http.post<Habit>(this.baseUrl, data, { headers: this.getHeaders() });
  }

  completeHabit(id: string, date?: string): Observable<Habit> {
    return this.http.post<Habit>(`${this.baseUrl}/${id}/complete`, { date }, { headers: this.getHeaders() });
  }

  updateHabit(id: string, data: Partial<Habit>): Observable<Habit> {
    return this.http.put<Habit>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteHabit(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
