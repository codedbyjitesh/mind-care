import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalService, JournalEntry } from '../../services/journal.service';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.css'
})
export class JournalComponent implements OnInit {
  journals: JournalEntry[] = [];
  selectedJournal: JournalEntry | null = null;
  loading = false;
  saving = false;
  successMessage = '';
  errorMessage = '';

  // Search & Filter
  searchTerm = '';
  filterDate = '';

  // Form Editor State
  isWriting = false;
  editingId: string | null = null;
  title = '';
  content = '';
  mood = '';
  date = new Date().toISOString().split('T')[0];

  moodList = ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad'];

  constructor(private journalService: JournalService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadJournals();
  }

  loadJournals(): void {
    this.loading = true;
    this.errorMessage = '';
    this.journalService.getJournals(this.searchTerm, this.filterDate).subscribe({
      next: (list) => {
        this.journals = list;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to retrieve your journals';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openNewEditor(): void {
    this.isWriting = true;
    this.editingId = null;
    this.title = '';
    this.content = '';
    this.mood = '';
    this.date = new Date().toISOString().split('T')[0];
    this.selectedJournal = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  editJournal(entry: JournalEntry): void {
    this.isWriting = true;
    this.editingId = entry._id || null;
    this.title = entry.title;
    this.content = entry.content;
    this.mood = entry.mood || '';
    this.date = entry.date;
    this.selectedJournal = null;
    this.successMessage = '';
    this.errorMessage = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewJournal(entry: JournalEntry): void {
    this.selectedJournal = entry;
    this.isWriting = false;
  }

  cancelEditor(): void {
    this.isWriting = false;
    this.editingId = null;
  }

  saveJournal(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.errorMessage = 'Please provide both a title and journal reflection.';
      return;
    }

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      title: this.title.trim(),
      content: this.content.trim(),
      mood: this.mood,
      date: this.date
    };

    if (this.editingId) {
      this.journalService.updateJournal(this.editingId, payload).subscribe({
        next: (updated) => {
          this.saving = false;
          this.successMessage = 'Journal entry updated successfully.';
          this.isWriting = false;
          this.editingId = null;
          this.loadJournals();
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err?.error?.message || 'Failed to update journal.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.journalService.createJournal(payload).subscribe({
        next: (created) => {
          this.saving = false;
          this.successMessage = 'Private journal entry saved securely.';
          this.isWriting = false;
          this.loadJournals();
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err?.error?.message || 'Failed to save journal.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteJournal(id: string | undefined): void {
    if (!id) return;
    if (confirm('Permanently delete this journal entry? This action cannot be undone.')) {
      this.journalService.deleteJournal(id).subscribe({
        next: () => {
          this.successMessage = 'Journal entry deleted permanently.';
          if (this.selectedJournal?._id === id) {
            this.selectedJournal = null;
          }
          this.loadJournals();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to delete journal entry.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  search(): void {
    this.loadJournals();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterDate = '';
    this.loadJournals();
  }
}
