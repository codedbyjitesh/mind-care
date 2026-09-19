import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface SleepEntry {
  _id?: string;
  userId?: string;
  date: string;
  sleepTime: string;
  wakeTime: string;
  duration: number;
  quality: 'Very Poor' | 'Poor' | 'Average' | 'Good' | 'Excellent';
  note?: string;
  createdAt?: string;
}

export interface SleepResponse {
  entries: SleepEntry[];
  summary: {
    totalRecords: number;
    avgDuration: number;
    targetDuration: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SleepService {
  private baseUrl = `${environment.apiUrl}/sleep`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getSleepRecords(): Observable<SleepResponse> {
    return this.http.get<SleepResponse>(this.baseUrl, { headers: this.getHeaders() });
  }

  createSleepRecord(data: Partial<SleepEntry>): Observable<SleepEntry> {
    return this.http.post<SleepEntry>(this.baseUrl, data, { headers: this.getHeaders() });
  }

  updateSleepRecord(id: string, data: Partial<SleepEntry>): Observable<SleepEntry> {
    return this.http.put<SleepEntry>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteSleepRecord(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
