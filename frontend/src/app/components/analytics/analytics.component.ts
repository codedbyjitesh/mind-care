import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, DashboardAnalytics } from '../../services/analytics.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('moodCanvas') moodCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stressCanvas') stressCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sleepCanvas') sleepCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('habitCanvas') habitCanvas!: ElementRef<HTMLCanvasElement>;

  analytics: DashboardAnalytics | null = null;
  loading = false;
  errorMessage = '';

  private moodChart?: Chart;
  private stressChart?: Chart;
  private sleepChart?: Chart;
  private habitChart?: Chart;

  constructor(private analyticsService: AnalyticsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngAfterViewInit(): void {
    // Canvas elements will be bound after loadAnalytics data returns
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private destroyCharts(): void {
    if (this.moodChart) this.moodChart.destroy();
    if (this.stressChart) this.stressChart.destroy();
    if (this.sleepChart) this.sleepChart.destroy();
    if (this.habitChart) this.habitChart.destroy();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.analyticsService.getDashboardAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderCharts(), 50);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load analytics data';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  renderCharts(): void {
    if (!this.analytics) return;
    this.destroyCharts();

    const labels = this.analytics.charts.labels;

    // 1. Mood Trend Chart (Line)
    if (this.moodCanvas) {
      this.moodChart = new Chart(this.moodCanvas.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Mood Score (1-5)',
            data: this.analytics.charts.moodScores,
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.15)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#0d9488',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 1, max: 5, ticks: { stepSize: 1 } }
          }
        }
      });
    }

    // 2. Stress Score Chart (Line/Bar)
    if (this.stressCanvas) {
      this.stressChart = new Chart(this.stressCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Stress Score (0-20)',
            data: this.analytics.charts.stressScores,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: '#ef4444',
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 0, max: 20, ticks: { stepSize: 4 } }
          }
        }
      });
    }

    // 3. Sleep Duration Chart
    if (this.sleepCanvas) {
      this.sleepChart = new Chart(this.sleepCanvas.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Sleep Duration (Hours)',
            data: this.analytics.charts.sleepDurations,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.15)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#0284c7',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 0, max: 12, ticks: { stepSize: 2 } }
          }
        }
      });
    }

    // 4. Habit Completion Rate Chart
    if (this.habitCanvas) {
      this.habitChart = new Chart(this.habitCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Habits Completed (%)',
            data: this.analytics.charts.habitCompletionRates,
            backgroundColor: 'rgba(16, 185, 129, 0.75)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 0, max: 100, ticks: { stepSize: 25 } }
          }
        }
      });
    }
  }
}
