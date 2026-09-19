import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminStats, AdminUser } from '../../services/admin.service';
import { WellnessService, WellnessTip, WellnessResource, MeditationResource } from '../../services/wellness.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  activeTab: 'stats' | 'tips' | 'resources' | 'meditation' | 'users' = 'stats';

  stats: AdminStats | null = null;
  users: AdminUser[] = [];
  tips: WellnessTip[] = [];
  resources: WellnessResource[] = [];
  meditationGuides: MeditationResource[] = [];

  loading = false;
  successMessage = '';
  errorMessage = '';

  // Form State for Tips
  tipForm: Partial<WellnessTip> = { title: '', description: '', category: 'Mindfulness', condition: 'general', active: true };
  editingTipId: string | null = null;
  showTipForm = false;

  // Form State for Resources
  resourceForm: Partial<WellnessResource> = { title: '', description: '', category: 'Stress Management', url: '', icon: '📚', active: true };
  editingResourceId: string | null = null;
  showResourceForm = false;

  // Form State for Meditation
  meditationForm: Partial<MeditationResource> = { title: '', description: '', category: 'Breathing', duration: 5, url: '', active: true };
  editingMeditationId: string | null = null;
  showMeditationForm = false;

  resourceCategories = [
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

  meditationCategories = ['Breathing', 'Mindfulness', 'Stress Release', 'Sleep Meditation', 'Focus & Study', 'Body Scan'];

  tipConditions = [
    { label: 'General Advice', value: 'general' },
    { label: 'High Stress Alert', value: 'stress_high' },
    { label: 'Low Mood Alert', value: 'mood_low' },
    { label: 'Low Sleep Alert', value: 'sleep_low' }
  ];

  constructor(
    private adminService: AdminService,
    private wellnessService: WellnessService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  setTab(tab: 'stats' | 'tips' | 'resources' | 'meditation' | 'users'): void {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';

    if (tab === 'stats') this.loadStats();
    else if (tab === 'tips') this.loadTips();
    else if (tab === 'resources') this.loadResources();
    else if (tab === 'meditation') this.loadMeditation();
    else if (tab === 'users') this.loadUsers();
  }

  loadStats(): void {
    this.loading = true;
    this.adminService.getStats().subscribe({
      next: (s) => {
        this.stats = s;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load system stats';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (u) => {
        this.users = u;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load user accounts';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleUser(u: AdminUser): void {
    this.adminService.toggleUserStatus(u._id, !u.isActive).subscribe({
      next: (res) => {
        u.isActive = !u.isActive;
        this.successMessage = res.message;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to update user status';
        this.cdr.detectChanges();
      }
    });
  }

  // Tips Management
  loadTips(): void {
    this.loading = true;
    this.wellnessService.getTips().subscribe({
      next: (data) => {
        this.tips = [...data.personalized, ...data.general];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveTip(): void {
    if (!this.tipForm.title || !this.tipForm.description) {
      this.errorMessage = 'Tip title and description are required.';
      return;
    }

    if (this.editingTipId) {
      this.adminService.updateTip(this.editingTipId, this.tipForm).subscribe({
        next: () => {
          this.successMessage = 'Wellness tip updated successfully.';
          this.cancelTipForm();
          this.loadTips();
        }
      });
    } else {
      this.adminService.createTip(this.tipForm).subscribe({
        next: () => {
          this.successMessage = 'New wellness tip published.';
          this.cancelTipForm();
          this.loadTips();
        }
      });
    }
  }

  editTip(t: WellnessTip): void {
    this.editingTipId = t._id || null;
    this.tipForm = { ...t };
    this.showTipForm = true;
  }

  deleteTip(id: string | undefined): void {
    if (!id || !confirm('Delete this tip?')) return;
    this.adminService.deleteTip(id).subscribe({
      next: () => {
        this.successMessage = 'Tip removed.';
        this.loadTips();
      }
    });
  }

  cancelTipForm(): void {
    this.showTipForm = false;
    this.editingTipId = null;
    this.tipForm = { title: '', description: '', category: 'Mindfulness', condition: 'general', active: true };
  }

  // Resources Management
  loadResources(): void {
    this.loading = true;
    this.wellnessService.getResources().subscribe({
      next: (r) => {
        this.resources = r;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveResource(): void {
    if (!this.resourceForm.title || !this.resourceForm.url) {
      this.errorMessage = 'Resource title and link URL are required.';
      return;
    }

    if (this.editingResourceId) {
      this.adminService.updateResource(this.editingResourceId, this.resourceForm).subscribe({
        next: () => {
          this.successMessage = 'Resource updated successfully.';
          this.cancelResourceForm();
          this.loadResources();
        }
      });
    } else {
      this.adminService.createResource(this.resourceForm).subscribe({
        next: () => {
          this.successMessage = 'Resource added to wellness library.';
          this.cancelResourceForm();
          this.loadResources();
        }
      });
    }
  }

  editResource(r: WellnessResource): void {
    this.editingResourceId = r._id || null;
    this.resourceForm = { ...r };
    this.showResourceForm = true;
  }

  deleteResource(id: string | undefined): void {
    if (!id || !confirm('Delete this resource item?')) return;
    this.adminService.deleteResource(id).subscribe({
      next: () => {
        this.successMessage = 'Resource removed.';
        this.loadResources();
      }
    });
  }

  cancelResourceForm(): void {
    this.showResourceForm = false;
    this.editingResourceId = null;
    this.resourceForm = { title: '', description: '', category: 'Stress Management', url: '', icon: '📚', active: true };
  }

  // Meditation Management
  loadMeditation(): void {
    this.loading = true;
    this.wellnessService.getMeditationResources().subscribe({
      next: (m) => {
        this.meditationGuides = m;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveMeditation(): void {
    if (!this.meditationForm.title || !this.meditationForm.url) {
      this.errorMessage = 'Title and audio/guide URL are required.';
      return;
    }

    if (this.editingMeditationId) {
      this.adminService.updateMeditation(this.editingMeditationId, this.meditationForm).subscribe({
        next: () => {
          this.successMessage = 'Meditation guide updated.';
          this.cancelMeditationForm();
          this.loadMeditation();
        }
      });
    } else {
      this.adminService.createMeditation(this.meditationForm).subscribe({
        next: () => {
          this.successMessage = 'Meditation guide created.';
          this.cancelMeditationForm();
          this.loadMeditation();
        }
      });
    }
  }

  editMeditation(m: MeditationResource): void {
    this.editingMeditationId = m._id || null;
    this.meditationForm = { ...m };
    this.showMeditationForm = true;
  }

  deleteMeditation(id: string | undefined): void {
    if (!id || !confirm('Delete this meditation audio?')) return;
    this.adminService.deleteMeditation(id).subscribe({
      next: () => {
        this.successMessage = 'Meditation guide deleted.';
        this.loadMeditation();
      }
    });
  }

  cancelMeditationForm(): void {
    this.showMeditationForm = false;
    this.editingMeditationId = null;
    this.meditationForm = { title: '', description: '', category: 'Breathing', duration: 5, url: '', active: true };
  }
}
