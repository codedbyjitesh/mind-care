import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface JournalEntry {
  _id?: string;
  userId?: string;
  title: string;
  content: string;
  mood?: string;
  date: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private baseUrl = `${environment.apiUrl}/journals`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getJournals(search?: string, date?: string): Observable<JournalEntry[]> {
    let params: any = {};
    if (search) params.search = search;
    if (date) params.date = date;
    return this.http.get<JournalEntry[]>(this.baseUrl, {
      headers: this.getHeaders(),
      params
    });
  }

  getJournalById(id: string): Observable<JournalEntry> {
    return this.http.get<JournalEntry>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  createJournal(data: Partial<JournalEntry>): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(this.baseUrl, data, {
      headers: this.getHeaders()
    });
  }

  updateJournal(id: string, data: Partial<JournalEntry>): Observable<JournalEntry> {
    return this.http.put<JournalEntry>(`${this.baseUrl}/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteJournal(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
