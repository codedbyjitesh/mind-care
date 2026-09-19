import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitService, Habit, HabitResponse } from '../../services/habit.service';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habits.component.html',
  styleUrl: './habits.component.css'
})
export class HabitComponent implements OnInit {
  habitData: HabitResponse | null = null;
  loading = false;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  // Habit Form
  title = '';
  description = '';
  frequency: 'Daily' | 'Weekly' = 'Daily';
  startDate = new Date().toISOString().split('T')[0];

  isEditing = false;
  editingId: string | null = null;
  showForm = false;

  suggestedHabits = [
    { title: 'Drink 2.5L Water', desc: 'Maintain cerebral hydration during lectures' },
    { title: '10 Min Meditation', desc: 'Restore emotional calm with rhythmic breath' },
    { title: '30 Min Daily Exercise', desc: 'Boost dopamine and release physical study strain' },
    { title: 'Sleep by 11:30 PM', desc: 'Anchor circadian rhythm for deep brain recovery' },
    { title: 'Read Academic Paper', desc: 'Dedicated focus without notifications' }
  ];

  constructor(private habitService: HabitService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    this.loading = true;
    this.errorMessage = '';
    this.habitService.getHabits().subscribe({
      next: (data) => {
        this.habitData = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load habits';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleComplete(habit: Habit): void {
    if (!habit._id) return;
    this.habitService.completeHabit(habit._id).subscribe({
      next: (updatedHabit) => {
        habit.isCompletedToday = updatedHabit.isCompletedToday;
        habit.streak = updatedHabit.streak;
        habit.completionHistory = updatedHabit.completionHistory;
        this.loadHabits(); // Refresh overall completion rate
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to toggle habit status';
        this.cdr.detectChanges();
      }
    });
  }

  applySuggestion(s: { title: string; desc: string }): void {
    this.title = s.title;
    this.description = s.desc;
    this.showForm = true;
  }

  saveHabit(): void {
    if (!this.title.trim()) {
      this.errorMessage = 'Please provide a habit title';
      return;
    }

    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload: Partial<Habit> = {
      title: this.title.trim(),
      description: this.description.trim(),
      frequency: this.frequency,
      startDate: this.startDate
    };

    if (this.isEditing && this.editingId) {
      this.habitService.updateHabit(this.editingId, payload).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Habit updated successfully.';
          this.cancelForm();
          this.loadHabits();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.error?.message || 'Failed to update habit';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.habitService.createHabit(payload).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'New habit added to your tracker!';
          this.cancelForm();
          this.loadHabits();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.error?.message || 'Failed to create habit';
          this.cdr.detectChanges();
        }
      });
    }
  }

  startEdit(habit: Habit): void {
    this.isEditing = true;
    this.editingId = habit._id || null;
    this.title = habit.title;
    this.description = habit.description || '';
    this.frequency = habit.frequency;
    this.startDate = habit.startDate || new Date().toISOString().split('T')[0];
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.title = '';
    this.description = '';
    this.frequency = 'Daily';
  }

  deleteHabit(id: string | undefined): void {
    if (!id) return;
    if (confirm('Delete this habit and its completion history?')) {
      this.habitService.deleteHabit(id).subscribe({
        next: () => {
          this.successMessage = 'Habit deleted successfully.';
          this.loadHabits();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to delete habit';
          this.cdr.detectChanges();
        }
      });
    }
  }
}
