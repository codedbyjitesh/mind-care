import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoodService, MoodEntry } from '../../services/mood.service';

interface MoodOption {
  label: 'Very Happy' | 'Happy' | 'Neutral' | 'Sad' | 'Very Sad';
  emoji: string;
  score: number;
  color: string;
  description: string;
}

@Component({
  selector: 'app-mood',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mood.component.html',
  styleUrl: './mood.component.css'
})
export class MoodComponent implements OnInit {
  todayMood: MoodEntry | null = null;
  moodHistory: MoodEntry[] = [];
  loading = false;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  // Options
  moodOptions: MoodOption[] = [
    { label: 'Very Happy', emoji: '😄', score: 5, color: '#10b981', description: 'Radiant, motivated & joyful' },
    { label: 'Happy', emoji: '🙂', score: 4, color: '#06b6d4', description: 'Good spirits & calm clarity' },
    { label: 'Neutral', emoji: '😐', score: 3, color: '#64748b', description: 'Balanced or indifferent' },
    { label: 'Sad', emoji: '🙁', score: 2, color: '#f59e0b', description: 'Low energy or uneasy' },
    { label: 'Very Sad', emoji: '😢', score: 1, color: '#ef4444', description: 'Exhausted, anxious or down' }
  ];

  // Current Entry form state
  selectedMood: MoodOption = this.moodOptions[1]; // default Happy
  note = '';
  entryDate = new Date().toISOString().split('T')[0];
  isEditing = false;
  editingId: string | null = null;

  // Filter state
  filterStartDate = '';
  filterEndDate = '';

  constructor(private moodService: MoodService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.moodService.getTodayMood().subscribe({
      next: (today) => {
        this.todayMood = today;
        if (today) {
          const matched = this.moodOptions.find((o) => o.label === today.mood);
          if (matched) this.selectedMood = matched;
          this.note = today.note || '';
        }
        this.cdr.detectChanges();
      }
    });

    this.fetchMoodHistory();
  }

  fetchMoodHistory(): void {
    this.moodService.getMoods(this.filterStartDate, this.filterEndDate).subscribe({
      next: (history) => {
        this.moodHistory = history;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to retrieve mood history';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectMood(opt: MoodOption): void {
    this.selectedMood = opt;
  }

  saveMood(): void {
    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isEditing && this.editingId) {
      this.moodService.updateMood(this.editingId, {
        mood: this.selectedMood.label,
        score: this.selectedMood.score,
        note: this.note.trim(),
        date: this.entryDate
      }).subscribe({
        next: (updated) => {
          this.submitting = false;
          this.successMessage = 'Mood entry updated successfully!';
          this.isEditing = false;
          this.editingId = null;
          this.loadData();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.error?.message || 'Failed to update mood';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.moodService.createMood({
        mood: this.selectedMood.label,
        score: this.selectedMood.score,
        note: this.note.trim(),
        date: this.entryDate
      }).subscribe({
        next: (created) => {
          this.submitting = false;
          this.successMessage = "Today's mood recorded successfully!";
          this.todayMood = created;
          this.loadData();
        },
        error: (err) => {
          this.submitting = false;
          if (err?.status === 409 || err?.error?.existingId) {
            this.errorMessage = 'You already have an entry for this date. Click edit on the record below to modify.';
          } else {
            this.errorMessage = err?.error?.message || 'Failed to record mood';
          }
          this.cdr.detectChanges();
        }
      });
    }
  }

  startEdit(entry: MoodEntry): void {
    this.isEditing = true;
    this.editingId = entry._id || null;
    this.entryDate = entry.date;
    this.note = entry.note || '';
    const match = this.moodOptions.find((o) => o.label === entry.mood);
    if (match) this.selectedMood = match;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingId = null;
    this.entryDate = new Date().toISOString().split('T')[0];
    this.note = this.todayMood?.note || '';
    if (this.todayMood) {
      const match = this.moodOptions.find((o) => o.label === this.todayMood?.mood);
      if (match) this.selectedMood = match;
    }
  }

  deleteEntry(id: string | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this mood record?')) {
      this.moodService.deleteMood(id).subscribe({
        next: () => {
          this.successMessage = 'Mood record deleted.';
          if (this.todayMood?._id === id) {
            this.todayMood = null;
          }
          this.loadData();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to delete record';
          this.cdr.detectChanges();
        }
      });
    }
  }

  applyFilter(): void {
    this.loading = true;
    this.fetchMoodHistory();
  }

  clearFilter(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.loading = true;
    this.fetchMoodHistory();
  }

  getEmoji(mood: string): string {
    const found = this.moodOptions.find((o) => o.label === mood);
    return found ? found.emoji : '🙂';
  }
}
