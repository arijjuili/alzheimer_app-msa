import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import {
  Patient,
  PatientCreateRequest,
  PatientUpdateRequest,
  PatientAudit,
  PaginatedResponse,
  Doctor,
  Caregiver,
  UserRegistrationRequest,
  UserRegistrationResponse
} from '../../../shared/models/patient.model';

interface PaginatedApiResponse<T> {
  data?: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/patients`;
  private readonly usersApiUrl = `${environment.apiUrl}/api/v1`;
  private readonly authUrl = `${environment.apiUrl}/auth`;

  private currentPatient: Patient | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  resolveCurrentPatient(): Observable<Patient | null> {
    if (this.currentPatient) {
      return of(this.currentPatient);
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      return of(null);
    }

    return this.getPatients(1, 1000).pipe(
      map(response => {
        const patient = response.data.find(p =>
          p.keycloakId === currentUser.id ||
          p.email?.toLowerCase() === currentUser.email?.toLowerCase()
        ) || null;
        if (patient) {
          this.currentPatient = patient;
        }
        return patient;
      }),
      catchError(() => of(null))
    );
  }

  clearCurrentPatientCache(): void {
    this.currentPatient = null;
  }

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
    return this.http
      .get<PaginatedApiResponse<unknown>>(this.apiUrl, { params })
      .pipe(map(response => this.normalizePaginatedPatients(response)));
  }

  getPatientById(id: string): Observable<Patient> {
    return this.http
      .get<unknown>(`${this.apiUrl}/${id}`)
      .pipe(map(patient => this.normalizePatient(patient)));
  }

  createPatient(patient: PatientCreateRequest): Observable<Patient> {
    return this.http
      .post<unknown>(this.apiUrl, patient)
      .pipe(map(createdPatient => this.normalizePatient(createdPatient)));
  }

  updatePatient(id: string, patient: PatientUpdateRequest): Observable<Patient> {
    return this.http
      .put<unknown>(`${this.apiUrl}/${id}`, patient)
      .pipe(map(updatedPatient => this.normalizePatient(updatedPatient)));
  }

  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPatientAudit(id: string): Observable<PatientAudit[]> {
    return this.http.get<any>(`${this.apiUrl}/${id}/audit`).pipe(
      map(response => Array.isArray(response) ? response : (response?.data ?? []))
    );
  }

  searchPatients(query: string): Observable<Patient[]> {
    const normalizedQuery = query.trim().toLowerCase();
    return this.getPatients(1, 1000).pipe(
      map(response => response.data.filter(patient => {
        const haystack = [
          patient.firstName,
          patient.lastName,
          patient.email,
          patient.phone
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      }))
    );
  }

  /**
   * Get patients assigned to a specific doctor
   */
  getPatientsByDoctor(doctorId: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<Patient>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http
      .get<PaginatedApiResponse<unknown>>(`${this.apiUrl}/by-doctor/${doctorId}`, { params })
      .pipe(map(response => this.normalizePaginatedPatients(response)));
  }

  /**
   * Get unassigned patients (patients without a doctor)
   */
  getUnassignedPatients(page: number = 1, limit: number = 10): Observable<PaginatedResponse<Patient>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http
      .get<PaginatedApiResponse<unknown>>(`${this.apiUrl}/unassigned`, { params })
      .pipe(map(response => this.normalizePaginatedPatients(response)));
  }

  /**
   * Assign a doctor to a patient
   */
  assignDoctor(patientId: string, doctorId: string): Observable<Patient> {
    return this.http
      .put<unknown>(`${this.apiUrl}/${patientId}/assign-doctor`, { doctorId })
      .pipe(map(patient => this.normalizePatient(patient)));
  }

  /**
   * Assign a caregiver to a patient
   */
  assignCaregiver(patientId: string, caregiverId: string): Observable<Patient> {
    return this.http
      .put<unknown>(`${this.apiUrl}/${patientId}/assign-caregiver`, { caregiverId })
      .pipe(map(patient => this.normalizePatient(patient)));
  }

  /**
   * Remove doctor assignment from a patient
   */
  unassignDoctor(patientId: string): Observable<Patient> {
    return this.http
      .delete<unknown>(`${this.apiUrl}/${patientId}/assign-doctor`)
      .pipe(map(patient => this.normalizePatient(patient)));
  }

  /**
   * Remove caregiver assignment from a patient
   */
  unassignCaregiver(patientId: string): Observable<Patient> {
    return this.http
      .delete<unknown>(`${this.apiUrl}/${patientId}/assign-caregiver`)
      .pipe(map(patient => this.normalizePatient(patient)));
  }

  /**
   * Unassign current user from a patient (caregiver or doctor)
   */
  unassignPatient(patientId: string): Observable<Patient> {
    return this.http
      .delete<unknown>(`${this.apiUrl}/${patientId}/unassign`)
      .pipe(map(patient => this.normalizePatient(patient)));
  }

  /**
   * Get all available doctors
   */
  getAvailableDoctors(): Observable<Doctor[]> {
    return this.http
      .get<unknown[]>(`${this.usersApiUrl}/doctors`)
      .pipe(map(users => users.map(user => this.normalizeDoctor(user))));
  }

  /**
   * Get all available caregivers
   */
  getAvailableCaregivers(): Observable<Caregiver[]> {
    return this.http
      .get<unknown[]>(`${this.usersApiUrl}/caregivers`)
      .pipe(map(users => users.map(user => this.normalizeCaregiver(user))));
  }

  registerUser(request: UserRegistrationRequest): Observable<UserRegistrationResponse> {
    return this.http.post<UserRegistrationResponse>(`${this.authUrl}/register`, request);
  }

  private normalizePaginatedPatients(response: PaginatedApiResponse<unknown>): PaginatedResponse<Patient> {
    const pagination = response.pagination ?? {};
    const data = Array.isArray(response.data) ? response.data.map(patient => this.normalizePatient(patient)) : [];

    return {
      data,
      total: response.total ?? pagination.total ?? data.length,
      page: response.page ?? pagination.page ?? 1,
      limit: response.limit ?? pagination.limit ?? data.length,
      totalPages: response.totalPages ?? pagination.totalPages ?? (data.length > 0 ? 1 : 0)
    };
  }

  private normalizePatient(patient: any): Patient {
    if (!patient) {
      return patient;
    }

    return {
      ...patient,
      dateOfBirth: patient.dateOfBirth ?? patient.birthDate ?? undefined,
      createdAt: patient.createdAt ?? undefined,
      updatedAt: patient.updatedAt ?? undefined
    };
  }

  private normalizeDoctor(user: any): Doctor {
    return {
      id: user.id,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      username: user.username ?? '',
      specialty: user.specialty ?? undefined,
      enabled: user.enabled ?? true
    };
  }

  private normalizeCaregiver(user: any): Caregiver {
    return {
      id: user.id,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      username: user.username ?? '',
      phone: user.phone ?? undefined,
      enabled: user.enabled ?? true
    };
  }
}
