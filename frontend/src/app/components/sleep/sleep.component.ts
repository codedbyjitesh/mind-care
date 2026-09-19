import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SleepService, SleepEntry, SleepResponse } from '../../services/sleep.service';

@Component({
  selector: 'app-sleep',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sleep.component.html',
  styleUrl: './sleep.component.css'
})
export class SleepComponent implements OnInit {
  sleepData: SleepResponse | null = null;
  loading = false;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  // Form Fields
  date = new Date().toISOString().split('T')[0];
  sleepTime = '23:00';
  wakeTime = '07:00';
  duration = 8.0;
  quality: 'Very Poor' | 'Poor' | 'Average' | 'Good' | 'Excellent' = 'Good';
  note = '';

  isEditing = false;
  editingId: string | null = null;

  qualities = ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];

  constructor(private sleepService: SleepService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.calculateDuration();
    this.loadSleep();
  }

  loadSleep(): void {
    this.loading = true;
    this.errorMessage = '';
    this.sleepService.getSleepRecords().subscribe({
      next: (data) => {
        this.sleepData = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load sleep records';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateDuration(): void {
    if (!this.sleepTime || !this.wakeTime) return;
    const [sH, sM] = this.sleepTime.split(':').map(Number);
    const [wH, wM] = this.wakeTime.split(':').map(Number);

    let sTotal = sH * 60 + sM;
    let wTotal = wH * 60 + wM;

    if (wTotal < sTotal) {
      wTotal += 24 * 60;
    }

    this.duration = Number(((wTotal - sTotal) / 60).toFixed(1));
  }

  saveSleep(): void {
    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload: Partial<SleepEntry> = {
      date: this.date,
      sleepTime: this.sleepTime,
      wakeTime: this.wakeTime,
      duration: this.duration,
      quality: this.quality,
      note: this.note.trim()
    };

    if (this.isEditing && this.editingId) {
      this.sleepService.updateSleepRecord(this.editingId, payload).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Sleep record updated.';
          this.cancelEdit();
          this.loadSleep();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.error?.message || 'Failed to update sleep record';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.sleepService.createSleepRecord(payload).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Sleep record logged successfully!';
          this.note = '';
          this.loadSleep();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.error?.message || 'Failed to save sleep record';
          this.cdr.detectChanges();
        }
      });
    }
  }

  startEdit(entry: SleepEntry): void {
    this.isEditing = true;
    this.editingId = entry._id || null;
    this.date = entry.date;
    this.sleepTime = entry.sleepTime;
    this.wakeTime = entry.wakeTime;
    this.duration = entry.duration;
    this.quality = entry.quality;
    this.note = entry.note || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingId = null;
    this.date = new Date().toISOString().split('T')[0];
    this.sleepTime = '23:00';
    this.wakeTime = '07:00';
    this.calculateDuration();
    this.quality = 'Good';
    this.note = '';
  }

  deleteEntry(id: string | undefined): void {
    if (!id) return;
    if (confirm('Delete this sleep record?')) {
      this.sleepService.deleteSleepRecord(id).subscribe({
        next: () => {
          this.successMessage = 'Sleep entry removed.';
          this.loadSleep();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to delete entry';
          this.cdr.detectChanges();
        }
      });
    }
  }
}
