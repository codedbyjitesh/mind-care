import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalService, Goal, GoalResponse } from '../../services/goal.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.css'
})
export class GoalComponent implements OnInit {
  goalData: GoalResponse | null = null;
  loading = false;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  // Form State
  title = '';
  description = '';
  startDate = new Date().toISOString().split('T')[0];
  targetDate = '';
  progress = 0;
  status: 'Active' | 'Completed' | 'Cancelled' = 'Active';

  isEditing = false;
  editingId: string | null = null;
  showForm = false;

  constructor(private goalService: GoalService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Default target date: 3 weeks from now
    const target = new Date();
    target.setDate(target.getDate() + 21);
    this.targetDate = target.toISOString().split('T')[0];
    this.loadGoals();
  }

  loadGoals(): void {
    this.loading = true;
    this.errorMessage = '';
    this.goalService.getGoals().subscribe({
      next: (data) => {
        this.goalData = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load wellness goals';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateProgressQuick(goal: Goal, delta: number): void {
    if (!goal._id) return;
    const newProg = Math.min(100, Math.max(0, goal.progress + delta));
    const newStatus = newProg === 100 ? 'Completed' : goal.status;

    this.goalService.updateGoal(goal._id, { progress: newProg, status: newStatus }).subscribe({
      next: (updated) => {
        goal.progress = updated.progress;
        goal.status = updated.status;
        this.loadGoals();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to update goal progress';
        this.cdr.detectChanges();
      }
    });
  }

  markCompleted(goal: Goal): void {
    if (!goal._id) return;
    this.goalService.updateGoal(goal._id, { progress: 100, status: 'Completed' }).subscribe({
      next: (updated) => {
        goal.progress = updated.progress;
        goal.status = updated.status;
        this.loadGoals();
      }
    });
  }

  saveGoal(): void {
    if (!this.title.trim() || !this.targetDate) {
      this.errorMessage = 'Goal title and target date are required';
      return;
    }

    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload: Partial<Goal> = {
      title: this.title.trim(),
      description: this.description.trim(),
      startDate: this.startDate,
      targetDate: this.targetDate,
      progress: Number(this.progress),
      status: this.status
    };

    if (this.isEditing && this.editingId) {
      this.goalService.updateGoal(this.editingId, payload).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Goal updated successfully.';
          this.cancelForm();
          this.loadGoals();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.error?.message || 'Failed to update goal';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.goalService.createGoal(payload).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'New wellness goal established!';
          this.cancelForm();
          this.loadGoals();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.error?.message || 'Failed to create goal';
          this.cdr.detectChanges();
        }
      });
    }
  }

  startEdit(goal: Goal): void {
    this.isEditing = true;
    this.editingId = goal._id || null;
    this.title = goal.title;
    this.description = goal.description || '';
    this.startDate = goal.startDate;
    this.targetDate = goal.targetDate;
    this.progress = goal.progress;
    this.status = goal.status;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.title = '';
    this.description = '';
    this.progress = 0;
    this.status = 'Active';
  }

  deleteGoal(id: string | undefined): void {
    if (!id) return;
    if (confirm('Delete this goal permanently?')) {
      this.goalService.deleteGoal(id).subscribe({
        next: () => {
          this.successMessage = 'Goal deleted.';
          this.loadGoals();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to delete goal';
          this.cdr.detectChanges();
        }
      });
    }
  }
}
