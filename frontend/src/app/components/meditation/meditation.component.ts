import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WellnessService, MeditationResource } from '../../services/wellness.service';

type BreathingPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

@Component({
  selector: 'app-meditation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meditation.component.html',
  styleUrl: './meditation.component.css'
})
export class MeditationComponent implements OnInit, OnDestroy {
  meditationGuides: MeditationResource[] = [];
  selectedCategory = 'All';
  loadingGuides = false;

  // Breathing Timer State
  isRunning = false;
  isPaused = false;
  currentPhase: BreathingPhase = 'Inhale';
  phaseCountdown = 4;
  totalTimeRemaining = 120; // in seconds (2 mins default)
  selectedTotalMinutes = 2;

  // Pattern intervals in seconds: Inhale (4), Hold (4), Exhale (4), Rest (4)
  phaseDurations = { Inhale: 4, Hold: 4, Exhale: 4, Rest: 4 };

  private timerInterval: any = null;

  categories = ['All', 'Breathing', 'Mindfulness', 'Stress Release', 'Sleep Meditation', 'Focus & Study', 'Body Scan'];

  constructor(private wellnessService: WellnessService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadGuides();
  }

  ngOnDestroy(): void {
    this.clearIntervalTimer();
  }

  loadGuides(): void {
    this.loadingGuides = true;
    this.wellnessService.getMeditationResources(this.selectedCategory).subscribe({
      next: (data) => {
        this.meditationGuides = data;
        this.loadingGuides = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingGuides = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterGuides(cat: string): void {
    this.selectedCategory = cat;
    this.loadGuides();
  }

  setDuration(minutes: number): void {
    if (this.isRunning) return;
    this.selectedTotalMinutes = minutes;
    this.totalTimeRemaining = minutes * 60;
  }

  startTimer(): void {
    if (this.isRunning && !this.isPaused) return;

    if (!this.isRunning) {
      this.totalTimeRemaining = this.selectedTotalMinutes * 60;
      this.currentPhase = 'Inhale';
      this.phaseCountdown = this.phaseDurations.Inhale;
    }

    this.isRunning = true;
    this.isPaused = false;

    this.clearIntervalTimer();
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  pauseTimer(): void {
    if (!this.isRunning) return;
    this.isPaused = true;
    this.clearIntervalTimer();
  }

  resumeTimer(): void {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  resetTimer(): void {
    this.clearIntervalTimer();
    this.isRunning = false;
    this.isPaused = false;
    this.currentPhase = 'Inhale';
    this.phaseCountdown = this.phaseDurations.Inhale;
    this.totalTimeRemaining = this.selectedTotalMinutes * 60;
    this.cdr.detectChanges();
  }

  private tick(): void {
    if (this.totalTimeRemaining <= 0) {
      this.resetTimer();
      return;
    }

    this.totalTimeRemaining--;
    this.phaseCountdown--;

    if (this.phaseCountdown <= 0) {
      this.advancePhase();
    }
    this.cdr.detectChanges();
  }

  private advancePhase(): void {
    if (this.currentPhase === 'Inhale') {
      this.currentPhase = 'Hold';
      this.phaseCountdown = this.phaseDurations.Hold;
    } else if (this.currentPhase === 'Hold') {
      this.currentPhase = 'Exhale';
      this.phaseCountdown = this.phaseDurations.Exhale;
    } else if (this.currentPhase === 'Exhale') {
      this.currentPhase = 'Rest';
      this.phaseCountdown = this.phaseDurations.Rest;
    } else {
      this.currentPhase = 'Inhale';
      this.phaseCountdown = this.phaseDurations.Inhale;
    }
  }

  private clearIntervalTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get formattedTotalTime(): string {
    const mins = Math.floor(this.totalTimeRemaining / 60);
    const secs = this.totalTimeRemaining % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  get phaseInstruction(): string {
    switch (this.currentPhase) {
      case 'Inhale': return 'Deeply expand your lungs through your nose...';
      case 'Hold': return 'Gently retain your breath with ease...';
      case 'Exhale': return 'Slowly release all air through your mouth...';
      case 'Rest': return 'Pause and feel the calm stillness...';
    }
  }
}
