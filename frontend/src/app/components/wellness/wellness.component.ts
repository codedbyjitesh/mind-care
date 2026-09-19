import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WellnessService, WellnessTipsResponse, WellnessTip } from '../../services/wellness.service';

@Component({
  selector: 'app-wellness',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wellness.component.html',
  styleUrl: './wellness.component.css'
})
export class WellnessTipsComponent implements OnInit {
  tipsResponse: WellnessTipsResponse | null = null;
  selectedCategory = 'All';
  loading = false;
  errorMessage = '';

  categories = ['All', 'Stress Relief', 'Sleep Hygiene', 'Mood Boost', 'Mindfulness', 'Physical Health', 'Study Life Balance'];

  constructor(private wellnessService: WellnessService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadTips();
  }

  loadTips(): void {
    this.loading = true;
    this.errorMessage = '';
    this.wellnessService.getTips().subscribe({
      next: (data) => {
        this.tipsResponse = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load wellness recommendations';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  getFilteredGeneralTips(): WellnessTip[] {
    if (!this.tipsResponse) return [];
    if (this.selectedCategory === 'All') {
      return this.tipsResponse.general;
    }
    return this.tipsResponse.general.filter((t) => t.category === this.selectedCategory);
  }

  getConditionTitle(condition: string): string {
    switch (condition) {
      case 'stress_high': return 'High Academic Stress Detected';
      case 'mood_low': return 'Low Mood Indicator Detected';
      case 'sleep_low': return 'Short Sleep Windows Detected';
      default: return 'Personalized Recommendation';
    }
  }
}
