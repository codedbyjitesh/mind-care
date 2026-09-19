import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface WellnessTip {
  _id?: string;
  title: string;
  description: string;
  category: string;
  condition: 'general' | 'stress_high' | 'mood_low' | 'sleep_low';
  active: boolean;
}

export interface WellnessTipsResponse {
  personalized: WellnessTip[];
  general: WellnessTip[];
  conditionsDetected: string[];
  context: {
    stressLevel: string | null;
    recentMoodScore: number | null;
    recentSleepDuration: number | null;
  };
}

export interface WellnessResource {
  _id?: string;
  title: string;
  description: string;
  category: string;
  url: string;
  icon?: string;
  active: boolean;
}

export interface MeditationResource {
  _id?: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  url: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WellnessService {
  private baseUrl = `${environment.apiUrl}/wellness`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getTips(): Observable<WellnessTipsResponse> {
    return this.http.get<WellnessTipsResponse>(`${this.baseUrl}/tips`, {
      headers: this.getHeaders()
    });
  }

  getResources(category?: string, search?: string): Observable<WellnessResource[]> {
    let params: any = {};
    if (category) params.category = category;
    if (search) params.search = search;
    return this.http.get<WellnessResource[]>(`${this.baseUrl}/resources`, { params });
  }

  getMeditationResources(category?: string): Observable<MeditationResource[]> {
    let params: any = {};
    if (category) params.category = category;
    return this.http.get<MeditationResource[]>(`${this.baseUrl}/meditation`, { params });
  }
}
