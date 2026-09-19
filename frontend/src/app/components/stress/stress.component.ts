import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StressService, StressAssessment, StressAnswer } from '../../services/stress.service';

interface QuestionItem {
  id: number;
  text: string;
  selectedScore: number;
}

@Component({
  selector: 'app-stress',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stress.component.html',
  styleUrl: './stress.component.css'
})
export class StressComponent implements OnInit {
  latestAssessment: StressAssessment | null = null;
  pastAssessments: StressAssessment[] = [];
  loading = false;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  // Questions definition
  questions: QuestionItem[] = [
    { id: 1, text: 'How often have you felt overwhelmed by your academic workload or daily schedule?', selectedScore: 1 },
    { id: 2, text: 'How difficult has it been to mentally unwind or relax during your free time?', selectedScore: 1 },
    { id: 3, text: 'How often have you had difficulty concentrating during lectures or study hours?', selectedScore: 1 },
    { id: 4, text: 'How often have you felt unable to manage your personal or university responsibilities?', selectedScore: 1 },
    { id: 5, text: 'How often have you felt mentally exhausted or drained before the day even ends?', selectedScore: 1 }
  ];

  options = [
    { label: 'Never', score: 0 },
    { label: 'Rarely', score: 1 },
    { label: 'Sometimes', score: 2 },
    { label: 'Often', score: 3 },
    { label: 'Very Often', score: 4 }
  ];

  // Real-time calculation
  get currentCalculatedScore(): number {
    return this.questions.reduce((sum, q) => sum + Number(q.selectedScore), 0);
  }

  get currentCalculatedLevel(): 'Low' | 'Moderate' | 'High' {
    const score = this.currentCalculatedScore;
    if (score >= 14) return 'High';
    if (score >= 7) return 'Moderate';
    return 'Low';
  }

  constructor(private stressService: StressService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.stressService.getLatestAssessment().subscribe({
      next: (latest) => {
        this.latestAssessment = latest;
        this.cdr.detectChanges();
      }
    });

    this.stressService.getAssessments().subscribe({
      next: (list) => {
        this.pastAssessments = list;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load past assessments';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectScore(qIndex: number, score: number): void {
    this.questions[qIndex].selectedScore = score;
  }

  submitAssessment(): void {
    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const answersPayload: StressAnswer[] = this.questions.map((q) => ({
      question: q.text,
      score: q.selectedScore
    }));

    this.stressService.submitAssessment({ answers: answersPayload }).subscribe({
      next: (assessment) => {
        this.submitting = false;
        this.latestAssessment = assessment;
        this.successMessage = `Assessment saved! Current Stress Indicator: ${assessment.level} (${assessment.score}/20)`;
        this.loadData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Failed to submit stress assessment';
        this.cdr.detectChanges();
      }
    });
  }
}
