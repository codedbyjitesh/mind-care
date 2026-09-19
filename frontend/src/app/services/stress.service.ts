import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface StressAnswer {
  question: string;
  score: number;
}

export interface StressAssessment {
  _id?: string;
  userId?: string;
  date: string;
  answers: StressAnswer[];
  score: number;
  level: 'Low' | 'Moderate' | 'High';
  recommendations: string[];
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StressService {
  private baseUrl = `${environment.apiUrl}/stress`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getAssessments(): Observable<StressAssessment[]> {
    return this.http.get<StressAssessment[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  getLatestAssessment(): Observable<StressAssessment | null> {
    return this.http.get<StressAssessment | null>(`${this.baseUrl}/latest`, {
      headers: this.getHeaders()
    });
  }

  submitAssessment(data: { answers: StressAnswer[]; date?: string }): Observable<StressAssessment> {
    return this.http.post<StressAssessment>(this.baseUrl, data, {
      headers: this.getHeaders()
    });
  }
}
