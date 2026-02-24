import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Patient,
  PatientCreateRequest,
  PatientUpdateRequest,
  PatientAudit,
  PaginatedResponse,
  Doctor,
  Caregiver
} from '../../../shared/models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/patients`;

  constructor(private http: HttpClient) {}

  getPatients(page?: number, limit?: number, doctorId?: string): Observable<PaginatedResponse<Patient>> {
    let params = new HttpParams();
    if (page !== undefined) {
      params = params.set('page', page.toString());
    }
    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    if (doctorId !== undefined) {
      params = params.set('doctorId', doctorId);
    }
    return this.http.get<PaginatedResponse<Patient>>(this.apiUrl, { params });
  }

  getPatientById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  createPatient(patient: PatientCreateRequest): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient);
  }

  updatePatient(id: string, patient: PatientUpdateRequest): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  getPatientAudit(id: string): Observable<PatientAudit[]> {
    return this.http.get<PatientAudit[]>(`${this.apiUrl}/${id}/audit`);
  }

  searchPatients(query: string): Observable<Patient[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Patient[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get patients assigned to a specific doctor
   */
  getPatientsByDoctor(doctorId: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<Patient>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<Patient>>(`${this.apiUrl}/by-doctor/${doctorId}`, { params });
  }

  /**
   * Get unassigned patients (patients without a doctor)
   */
  getUnassignedPatients(page: number = 1, limit: number = 10): Observable<PaginatedResponse<Patient>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<Patient>>(`${this.apiUrl}/unassigned`, { params });
  }

  /**
   * Assign a doctor to a patient
   */
  assignDoctor(patientId: string, doctorId: string): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${patientId}/assign-doctor`, { doctorId });
  }

  /**
   * Assign a caregiver to a patient
   */
  assignCaregiver(patientId: string, caregiverId: string): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${patientId}/assign-caregiver`, { caregiverId });
  }

  /**
   * Remove doctor assignment from a patient
   */
  unassignDoctor(patientId: string): Observable<Patient> {
    return this.http.delete<Patient>(`${this.apiUrl}/${patientId}/assign-doctor`);
  }

  /**
   * Remove caregiver assignment from a patient
   */
  unassignCaregiver(patientId: string): Observable<Patient> {
    return this.http.delete<Patient>(`${this.apiUrl}/${patientId}/assign-caregiver`);
  }

  /**
   * Get all available doctors
   */
  getAvailableDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${environment.apiUrl}/api/v1/doctors`);
  }

  /**
   * Get all available caregivers
   */
  getAvailableCaregivers(): Observable<Caregiver[]> {
    return this.http.get<Caregiver[]>(`${environment.apiUrl}/api/v1/caregivers`);
  }
}
