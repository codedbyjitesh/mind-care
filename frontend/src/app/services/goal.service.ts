import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Goal {
  _id?: string;
  userId?: string;
  title: string;
  description?: string;
  startDate: string;
  targetDate: string;
  progress: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  createdAt?: string;
}

export interface GoalResponse {
  goals: Goal[];
  stats: {
    total: number;
    active: number;
    completed: number;
    avgProgress: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private baseUrl = `${environment.apiUrl}/goals`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getGoals(): Observable<GoalResponse> {
    return this.http.get<GoalResponse>(this.baseUrl, { headers: this.getHeaders() });
  }

  createGoal(data: Partial<Goal>): Observable<Goal> {
    return this.http.post<Goal>(this.baseUrl, data, { headers: this.getHeaders() });
  }

  updateGoal(id: string, data: Partial<Goal>): Observable<Goal> {
    return this.http.put<Goal>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteGoal(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
