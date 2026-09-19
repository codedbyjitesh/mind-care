import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface MoodEntry {
  _id?: string;
  userId?: string;
  date: string;
  mood: 'Very Happy' | 'Happy' | 'Neutral' | 'Sad' | 'Very Sad';
  score: number;
  note?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MoodService {
  private baseUrl = `${environment.apiUrl}/mood`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getMoods(startDate?: string, endDate?: string): Observable<MoodEntry[]> {
    let params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<MoodEntry[]>(this.baseUrl, {
      headers: this.getHeaders(),
      params
    });
  }

  getTodayMood(): Observable<MoodEntry | null> {
    return this.http.get<MoodEntry | null>(`${this.baseUrl}/today`, {
      headers: this.getHeaders()
    });
  }

  createMood(moodData: { mood: string; date?: string; score?: number; note?: string }): Observable<MoodEntry> {
    return this.http.post<MoodEntry>(this.baseUrl, moodData, {
      headers: this.getHeaders()
    });
  }

  updateMood(id: string, moodData: Partial<MoodEntry>): Observable<MoodEntry> {
    return this.http.put<MoodEntry>(`${this.baseUrl}/${id}`, moodData, {
      headers: this.getHeaders()
    });
  }

  deleteMood(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
