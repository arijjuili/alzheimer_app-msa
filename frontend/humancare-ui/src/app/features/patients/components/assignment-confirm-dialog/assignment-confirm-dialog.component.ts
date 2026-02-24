import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface AssignmentDialogData {
  patientName: string;
  assigneeName: string;
  type: 'doctor' | 'caregiver';
}

@Component({
  selector: 'app-assignment-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './assignment-confirm-dialog.component.html',
  styleUrls: ['./assignment-confirm-dialog.component.scss']
})
export class AssignmentConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AssignmentConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignmentDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  getAssignmentType(): string {
    return this.data.type === 'doctor' ? 'Doctor' : 'Caregiver';
  }
}
