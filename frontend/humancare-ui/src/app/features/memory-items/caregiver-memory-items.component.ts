import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MemoryService } from '../memory/services/memory.service';
import { AuthService } from '../../core/auth/auth.service';
import { PatientService } from '../profile/services/patient.service';
import { CareTeamService, CaregiverAssignment } from '../../core/services/care-team.service';
import { Patient } from '../../shared/models/patient.model';
import {
  MemoryCategory,
  MemoryItem,
  MemoryItemCreateRequest,
  MemoryItemUpdateRequest
} from '../../shared/models/memory.model';
import { catchError, map, forkJoin, of } from 'rxjs';

interface PatientOption {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-caregiver-memory-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caregiver-memory-items.component.html',
  styleUrls: ['./caregiver-memory-items.component.scss']
})
export class CaregiverMemoryItemsComponent implements OnInit {
  memoryItems: MemoryItem[] = [];
  patients: PatientOption[] = [];
  loading = false;
  error = '';
  success = '';

  categoryFilter: MemoryCategory | 'ALL' = 'ALL';
  categories = Object.values(MemoryCategory);
  patientNames: Record<string, string> = {};

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  pendingDelete: MemoryItem | null = null;
  createSubmitted = false;
  editSubmitted = false;
  createImageFileName = '';
  editImageFileName = '';

  createForm = this.getEmptyForm();
  editForm = this.getEmptyForm();
  editingItem: MemoryItem | null = null;

  constructor(
    private memoryService: MemoryService,
    private authService: AuthService,
    private careTeamService: CareTeamService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadMemoryItems();
  }

  get filteredMemoryItems(): MemoryItem[] {
    let items = this.memoryItems;
    if (this.categoryFilter !== 'ALL') {
      items = items.filter(item => item.memoryCategory === this.categoryFilter);
    }
    return items;
  }

  loadMemoryItems(): void {
    this.loading = true;
    this.error = '';
    this.memoryService.getMemoryItems().subscribe({
      next: (items: MemoryItem[]) => {
        this.memoryItems = items;
        this.resolvePatientNames(items);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load memory items:', err);
        this.error = err.error?.detail || 'Failed to load memory items';
        this.loading = false;
      }
    });
  }

  createMemoryItem(): void {
    this.createSubmitted = true;
    this.error = '';

    if (!this.createForm.patientId.trim() || !this.createForm.title.trim()) {
      this.error = 'Patient and title are required';
      return;
    }

    const payload: MemoryItemCreateRequest = {
      patientId: this.createForm.patientId,
      memoryCategory: this.createForm.memoryCategory,
      title: this.createForm.title.trim(),
      description: this.createForm.description.trim() || undefined,
      imageUrl: this.createForm.imageUrl.trim() || undefined,
      location: this.createForm.location.trim() || undefined,
      yearTaken: this.createForm.yearTaken ?? undefined,
      persons: this.cleanList(this.createForm.persons),
      questions: this.cleanList(this.createForm.questions),
      correctAnswers: this.cleanList(this.createForm.correctAnswers),
      storybookSelected: this.createForm.storybookSelected
    };

    this.loading = true;
    this.memoryService.createMemoryItem(payload).subscribe({
      next: () => {
        this.success = 'Memory item created successfully';
        this.resetCreateForm();
        this.showCreateModal = false;
        this.loadMemoryItems();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to create memory item:', err);
        this.error = err.error?.detail || 'Failed to create memory item';
        this.loading = false;
      }
    });
  }

  startEdit(item: MemoryItem): void {
    this.editingItem = item;
    this.showEditModal = true;
    this.editSubmitted = false;
    this.editForm = {
      patientId: item.patientId,
      memoryCategory: item.memoryCategory,
      title: item.title,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      location: item.location || '',
      yearTaken: item.yearTaken ?? null,
      persons: item.persons && item.persons.length > 0 ? [...item.persons] : [''],
      questions: item.questions && item.questions.length > 0 ? [...item.questions] : [''],
      correctAnswers: item.correctAnswers && item.correctAnswers.length > 0 ? [...item.correctAnswers] : [''],
      storybookSelected: item.storybookSelected
    };
    this.editImageFileName = item.imageUrl ? 'Current image selected' : '';
  }

  cancelEdit(): void {
    this.editingItem = null;
    this.showEditModal = false;
    this.editSubmitted = false;
    this.editImageFileName = '';
  }

  updateMemoryItem(): void {
    if (!this.editingItem) return;
    this.editSubmitted = true;
    this.error = '';

    if (!this.editForm.title.trim()) {
      this.error = 'Title is required';
      return;
    }

    const payload: MemoryItemUpdateRequest = {
      memoryCategory: this.editForm.memoryCategory,
      title: this.editForm.title.trim(),
      description: this.editForm.description.trim() || undefined,
      imageUrl: this.editForm.imageUrl.trim() || undefined,
      location: this.editForm.location.trim() || undefined,
      yearTaken: this.editForm.yearTaken ?? undefined,
      persons: this.cleanList(this.editForm.persons),
      questions: this.cleanList(this.editForm.questions),
      correctAnswers: this.cleanList(this.editForm.correctAnswers),
      storybookSelected: this.editForm.storybookSelected
    };

    this.loading = true;
    this.memoryService.updateMemoryItem(this.editingItem.id, payload).subscribe({
      next: () => {
        this.success = 'Memory item updated successfully';
        this.editingItem = null;
        this.showEditModal = false;
        this.editImageFileName = '';
        this.loadMemoryItems();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to update memory item:', err);
        this.error = err.error?.detail || 'Failed to update memory item';
        this.loading = false;
      }
    });
  }

  requestDelete(item: MemoryItem): void {
    this.pendingDelete = item;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.pendingDelete) return;
    const item = this.pendingDelete;
    this.loading = true;
    this.memoryService.deleteMemoryItem(item.id).subscribe({
      next: () => {
        this.success = 'Memory item deleted';
        this.showDeleteModal = false;
        this.pendingDelete = null;
        this.loadMemoryItems();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to delete memory item:', err);
        this.error = err.error?.detail || 'Failed to delete memory item';
        this.loading = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.pendingDelete = null;
  }

  resetCreateForm(): void {
    this.createForm = this.getEmptyForm();
    this.createImageFileName = '';
    this.createSubmitted = false;
  }

  openCreateModal(): void {
    this.error = '';
    this.success = '';
    this.createSubmitted = false;
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createSubmitted = false;
    this.createImageFileName = '';
  }

  addPerson(target: 'create' | 'edit'): void {
    const list = target === 'create' ? this.createForm.persons : this.editForm.persons;
    list.push('');
  }

  removePerson(target: 'create' | 'edit', index: number): void {
    const list = target === 'create' ? this.createForm.persons : this.editForm.persons;
    list.splice(index, 1);
    if (list.length === 0) list.push('');
  }

  onCreateImageSelected(event: Event): void {
    this.readImageFile(event, 'create');
  }

  onEditImageSelected(event: Event): void {
    this.readImageFile(event, 'edit');
  }

  clearImage(target: 'create' | 'edit'): void {
    if (target === 'create') {
      this.createForm.imageUrl = '';
      this.createImageFileName = '';
      return;
    }
    this.editForm.imageUrl = '';
    this.editImageFileName = '';
  }

  getPatientName(patientId: string): string {
    return this.patientNames[patientId] || `Patient ${patientId.slice(0, 8)}…`;
  }

  trackById(_: number, item: MemoryItem): string {
    return item.id;
  }

  private getEmptyForm() {
    return {
      patientId: '',
      memoryCategory: MemoryCategory.FAMILY,
      title: '',
      description: '',
      imageUrl: '',
      location: '',
      yearTaken: null as number | null,
      persons: [''],
      questions: [''],
      correctAnswers: [''],
      storybookSelected: false
    };
  }

  private cleanList(values: string[]): string[] | undefined {
    const items = values.map(v => v.trim()).filter(v => v.length > 0);
    return items.length > 0 ? items : undefined;
  }

  private readImageFile(event: Event, target: 'create' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error = 'Please select a valid image file.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (target === 'create') {
        this.createForm.imageUrl = result;
        this.createImageFileName = file.name;
      } else {
        this.editForm.imageUrl = result;
        this.editImageFileName = file.name;
      }
    };
    reader.readAsDataURL(file);
  }

  private loadPatients(): void {
    const caregiverId = this.authService.getCurrentUser()?.id;
    if (!caregiverId) {
      this.patients = [];
      return;
    }

    this.careTeamService.getCaregiverAssignments(caregiverId).pipe(
      catchError(() => of([] as CaregiverAssignment[]))
    ).subscribe(assignments => {
      const activeAssignments = assignments.filter((a: CaregiverAssignment) => a.status === 'ACTIVE');
      if (activeAssignments.length === 0) {
        this.patients = [];
        return;
      }

      const patientRequests = activeAssignments.map((assignment: CaregiverAssignment) =>
        this.patientService.getPatientById(assignment.patientId).pipe(
          map((patient: Patient) => ({
            id: patient.id,
            userId: assignment.patientId,
            firstName: patient.firstName || assignment.patientFirstName || 'Unknown',
            lastName: patient.lastName || assignment.patientLastName || 'Patient'
          })),
          catchError(() => of({
            id: assignment.patientId,
            userId: assignment.patientId,
            firstName: assignment.patientFirstName || 'Unknown',
            lastName: assignment.patientLastName || 'Patient'
          }))
        )
      );

      forkJoin(patientRequests).subscribe({
        next: (patients: PatientOption[]) => {
          this.patients = patients;
          patients.forEach((patient: PatientOption) => {
            const name = `${patient.firstName} ${patient.lastName}`.trim();
            this.patientNames[patient.userId] = name || patient.userId;
          });
        },
        error: () => {
          this.patients = [];
        }
      });
    });
  }

  private resolvePatientNames(items: MemoryItem[]): void {
    const uniqueIds = Array.from(new Set(items.map(item => item.patientId)));
    uniqueIds.forEach(id => {
      if (this.patientNames[id]) return;
      this.patientService.getPatientById(id).subscribe({
        next: (profile: Patient) => {
          const name = `${profile.firstName} ${profile.lastName}`.trim();
          this.patientNames[id] = name || id;
        },
        error: () => {
          this.patientNames[id] = `Patient ${id.slice(0, 8)}…`;
        }
      });
    });
  }
}
