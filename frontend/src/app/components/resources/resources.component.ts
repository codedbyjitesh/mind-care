import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WellnessService, WellnessResource } from '../../services/wellness.service';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css'
})
export class ResourcesComponent implements OnInit {
  resources: WellnessResource[] = [];
  selectedCategory = 'All';
  searchTerm = '';
  loading = false;
  errorMessage = '';

  categories = [
    'All',
    'Stress Management',
    'Meditation',
    'Sleep',
    'Study Balance',
    'Time Management',
    'Exercise',
    'Mindfulness',
    'General Wellness',
    'Support'
  ];

  constructor(private wellnessService: WellnessService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadResources();
  }

  loadResources(): void {
    this.loading = true;
    this.errorMessage = '';
    const cat = this.selectedCategory === 'All' ? undefined : this.selectedCategory;
    this.wellnessService.getResources(cat, this.searchTerm).subscribe({
      next: (data) => {
        this.resources = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to retrieve mental health resources';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterCategory(cat: string): void {
    this.selectedCategory = cat;
    this.loadResources();
  }

  search(): void {
    this.loadResources();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedCategory = 'All';
    this.loadResources();
  }
}
