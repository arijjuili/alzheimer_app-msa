import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MemoryService } from '../memory/services/memory.service';
import { AuthService } from '../../core/auth/auth.service';
import { MemoryItem, MemoryCategory } from '../../shared/models/memory.model';

@Component({
  selector: 'app-patient-memory-wallet',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './patient-memory-wallet.component.html',
  styleUrls: ['./patient-memory-wallet.component.scss']
})
export class PatientMemoryWalletComponent implements OnInit {
  memoryItems: MemoryItem[] = [];
  loading = false;
  error = '';

  selectedCategory: MemoryCategory | 'ALL' = 'ALL';
  categories: (MemoryCategory | 'ALL')[] = ['ALL', ...Object.values(MemoryCategory)];

  constructor(
    private memoryService: MemoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMemoryItems();
  }

  get filteredItems(): MemoryItem[] {
    if (this.selectedCategory === 'ALL') {
      return this.memoryItems;
    }
    return this.memoryItems.filter(item => item.memoryCategory === this.selectedCategory);
  }

  loadMemoryItems(): void {
    const patientId = this.authService.getCurrentUser()?.id;
    if (!patientId) {
      this.error = 'Missing patient profile';
      return;
    }

    this.loading = true;
    this.error = '';
    this.memoryService.getMemoryItemsByPatient(patientId).subscribe({
      next: (items: MemoryItem[]) => {
        this.memoryItems = items;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.detail || 'Failed to load memory items';
        this.loading = false;
      }
    });
  }

  getCategoryLabel(category: MemoryCategory | 'ALL'): string {
    if (category === 'ALL') return 'All';
    const labels: Record<MemoryCategory, string> = {
      [MemoryCategory.FAMILY]: 'Family',
      [MemoryCategory.FRIENDS]: 'Friends',
      [MemoryCategory.PLACES]: 'Places',
      [MemoryCategory.EVENTS]: 'Events',
      [MemoryCategory.HOBBIES]: 'Hobbies',
      [MemoryCategory.WORK]: 'Work'
    };
    return labels[category] || category;
  }

  trackById(_: number, item: MemoryItem): string {
    return item.id;
  }
}
