import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, WellnessHistoryResponse } from '../../services/analytics.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  activeTab: 'all' | 'moods' | 'stress' = 'all';
  activeFilter: 'all' | 'weekly' | 'monthly' = 'all';
  page = 1;
  limit = 15;

  historyData: WellnessHistoryResponse | null = null;
  loading = false;
  errorMessage = '';

  constructor(private analyticsService: AnalyticsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.errorMessage = '';
    this.analyticsService.getHistory(this.activeFilter, this.page, this.limit).subscribe({
      next: (data) => {
        this.historyData = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to retrieve wellness history';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setFilter(filter: 'all' | 'weekly' | 'monthly'): void {
    this.activeFilter = filter;
    this.page = 1;
    this.loadHistory();
  }

  setTab(tab: 'all' | 'moods' | 'stress'): void {
    this.activeTab = tab;
  }

  nextPage(): void {
    this.page++;
    this.loadHistory();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadHistory();
    }
  }

  getMoodEmoji(mood: string): string {
    switch (mood) {
      case 'Very Happy': return '😄';
      case 'Happy': return '🙂';
      case 'Neutral': return '😐';
      case 'Sad': return '🙁';
      case 'Very Sad': return '😢';
      default: return '🙂';
    }
  }
}
