import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { AnalyticsService, DashboardAnalytics } from '../../services/analytics.service';
import { WellnessService, WellnessTip } from '../../services/wellness.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('moodTrendCanvas') moodTrendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stressTrendCanvas') stressTrendCanvas!: ElementRef<HTMLCanvasElement>;

  user: User | null = null;
  todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  analytics: DashboardAnalytics | null = null;
  recommendedTips: WellnessTip[] = [];
  loading = false;
  errorMessage = '';

  private moodChart?: Chart;
  private stressChart?: Chart;

  constructor(
    public authService: AuthService,
    private analyticsService: AnalyticsService,
    private wellnessService: WellnessService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Will render after analytics data returns
  }

  ngOnDestroy(): void {
    if (this.moodChart) this.moodChart.destroy();
    if (this.stressChart) this.stressChart.destroy();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.analyticsService.getDashboardAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderMiniCharts(), 50);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load dashboard metrics';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.wellnessService.getTips().subscribe({
      next: (res) => {
        // Show up to 2 personalized tips or general tips
        if (res.personalized.length > 0) {
          this.recommendedTips = res.personalized.slice(0, 2);
        } else {
          this.recommendedTips = res.general.slice(0, 2);
        }
        this.cdr.detectChanges();
      }
    });
  }

  renderMiniCharts(): void {
    if (!this.analytics) return;

    if (this.moodChart) this.moodChart.destroy();
    if (this.stressChart) this.stressChart.destroy();

    const labels = this.analytics.charts.labels;

    if (this.moodTrendCanvas) {
      this.moodChart = new Chart(this.moodTrendCanvas.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Mood (1-5)',
            data: this.analytics.charts.moodScores,
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#0d9488'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 1, max: 5, ticks: { stepSize: 1 } }
          }
        }
      });
    }

    if (this.stressTrendCanvas) {
      this.stressChart = new Chart(this.stressTrendCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Stress (0-20)',
            data: this.analytics.charts.stressScores,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: '#ef4444',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 20, ticks: { stepSize: 5 } }
          }
        }
      });
    }
  }

  getMoodEmoji(mood: string | undefined): string {
    switch (mood) {
      case 'Very Happy': return '😄';
      case 'Happy': return '🙂';
      case 'Neutral': return '😐';
      case 'Sad': return '🙁';
      case 'Very Sad': return '😢';
      default: return '❓';
    }
  }
}
