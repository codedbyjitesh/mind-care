import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface DashboardAnalytics {
  today: {
    date: string;
    mood: any;
    stress: any;
    sleep: any;
  };
  stats: {
    avgMood: number;
    avgStress: number;
    avgSleep: number;
    habitCompletionRate: number;
    avgGoalProgress: number;
    activeHabitsCount: number;
    activeGoalsCount: number;
  };
  charts: {
    labels: string[];
    moodScores: (number | null)[];
    stressScores: (number | null)[];
    sleepDurations: (number | null)[];
    habitCompletionRates: number[];
  };
}

export interface WellnessHistoryResponse {
  moods: any[];
  stress: any[];
  pagination: {
    page: number;
    limit: number;
    totalMoods: number;
    totalStress: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private baseUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getDashboardAnalytics(): Observable<DashboardAnalytics> {
    return this.http.get<DashboardAnalytics>(`${this.baseUrl}/dashboard`, {
      headers: this.getHeaders()
    });
  }

  getHistory(period?: 'all' | 'weekly' | 'monthly', page: number = 1, limit: number = 20): Observable<WellnessHistoryResponse> {
    let params: any = { page, limit };
    if (period && period !== 'all') params.period = period;
    return this.http.get<WellnessHistoryResponse>(`${this.baseUrl}/history`, {
      headers: this.getHeaders(),
      params
    });
  }
}
