import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CaregiverAssignment {
  id: string;
  patientId: string;
  patientFirstName?: string;
  patientLastName?: string;
  caregiverId: string;
  caregiverFirstName?: string;
  caregiverLastName?: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  assignedAt: string;
}

export interface DoctorAssignment {
  id: string;
  patientId: string;
  patientFirstName?: string;
  patientLastName?: string;
  doctorId: string;
  doctorFirstName?: string;
  doctorLastName?: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  assignedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CareTeamService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/care-team`;

  constructor(private http: HttpClient) {}

  getCaregiverAssignments(caregiverId: string): Observable<CaregiverAssignment[]> {
    return this.http.get<CaregiverAssignment[]>(`${this.apiUrl}/caregivers/${caregiverId}/assignments`);
  }

  getDoctorAssignments(doctorId: string): Observable<DoctorAssignment[]> {
    return this.http.get<DoctorAssignment[]>(`${this.apiUrl}/doctors/${doctorId}/assignments`);
  }

  getPatientAssignments(patientId: string): Observable<{ caregivers: CaregiverAssignment[]; doctors: DoctorAssignment[] }> {
    return this.http.get<{ caregivers: CaregiverAssignment[]; doctors: DoctorAssignment[] }>(`${this.apiUrl}/patients/${patientId}`);
  }

  assignCaregiver(patientId: string, caregiverId: string): Observable<CaregiverAssignment> {
    return this.http.post<CaregiverAssignment>(`${this.apiUrl}/caregivers/${caregiverId}/patients/${patientId}`, {});
  }

  assignDoctor(patientId: string, doctorId: string): Observable<DoctorAssignment> {
    return this.http.post<DoctorAssignment>(`${this.apiUrl}/doctors/${doctorId}/patients/${patientId}`, {});
  }

  removeCaregiverAssignment(assignmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/caregivers/assignments/${assignmentId}`);
  }

  removeDoctorAssignment(assignmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/doctors/assignments/${assignmentId}`);
  }
}
