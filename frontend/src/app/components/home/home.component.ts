import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  apiStatus: any = null;
  loadingStatus = true;
  apiError = false;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkBackendHealth();
  }

  checkBackendHealth() {
    this.loadingStatus = true;
    this.apiError = false;
    this.cdr.detectChanges();

    this.apiService.getHealthStatus().subscribe({
      next: (data) => {
        console.log('Backend API health response received:', data);
        this.apiStatus = data;
        this.loadingStatus = false;
        this.apiError = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('API connection retry...', err);
        setTimeout(() => {
          this.apiService.getHealthStatus().subscribe({
            next: (data) => {
              this.apiStatus = data;
              this.loadingStatus = false;
              this.apiError = false;
              this.cdr.detectChanges();
            },
            error: () => {
              this.apiError = true;
              this.loadingStatus = false;
              this.cdr.detectChanges();
            }
          });
        }, 1500);
      }
    });
  }
}
