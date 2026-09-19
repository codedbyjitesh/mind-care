import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { WellnessTip, WellnessResource, MeditationResource } from './wellness.service';

export interface AdminStats {
  totalStudents: number;
  totalTips: number;
  totalResources: number;
  totalMeditation: number;
  totalAssessments: number;
  totalMoodEntries: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.baseUrl}/stats`, { headers: this.getHeaders() });
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/users`, { headers: this.getHeaders() });
  }

  toggleUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}/status`, { isActive }, { headers: this.getHeaders() });
  }

  // Tips CRUD
  createTip(tip: Partial<WellnessTip>): Observable<WellnessTip> {
    return this.http.post<WellnessTip>(`${this.baseUrl}/tips`, tip, { headers: this.getHeaders() });
  }

  updateTip(id: string, tip: Partial<WellnessTip>): Observable<WellnessTip> {
    return this.http.put<WellnessTip>(`${this.baseUrl}/tips/${id}`, tip, { headers: this.getHeaders() });
  }

  deleteTip(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/tips/${id}`, { headers: this.getHeaders() });
  }

  // Resources CRUD
  createResource(resource: Partial<WellnessResource>): Observable<WellnessResource> {
    return this.http.post<WellnessResource>(`${this.baseUrl}/resources`, resource, { headers: this.getHeaders() });
  }

  updateResource(id: string, resource: Partial<WellnessResource>): Observable<WellnessResource> {
    return this.http.put<WellnessResource>(`${this.baseUrl}/resources/${id}`, resource, { headers: this.getHeaders() });
  }

  deleteResource(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/resources/${id}`, { headers: this.getHeaders() });
  }

  // Meditation CRUD
  createMeditation(meditation: Partial<MeditationResource>): Observable<MeditationResource> {
    return this.http.post<MeditationResource>(`${this.baseUrl}/meditation`, meditation, { headers: this.getHeaders() });
  }

  updateMeditation(id: string, meditation: Partial<MeditationResource>): Observable<MeditationResource> {
    return this.http.put<MeditationResource>(`${this.baseUrl}/meditation/${id}`, meditation, { headers: this.getHeaders() });
  }

  deleteMeditation(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/meditation/${id}`, { headers: this.getHeaders() });
  }
}
