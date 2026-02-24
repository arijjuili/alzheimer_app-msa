import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  MedicationPlan,
  MedicationIntake,
  MedicationPlanCreateRequest,
  MedicationPlanUpdateRequest,
  MedicationIntakeCreateRequest,
  MedicationIntakeUpdateRequest
} from '../../../shared/models/medication.model';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
  private readonly apiUrl = `${environment.apiUrl}/api/medications`;

  constructor(private http: HttpClient) {}

  // Plans
  getAllPlans(): Observable<MedicationPlan[]> {
    return this.http.get<MedicationPlan[]>(`${this.apiUrl}/plans`);
  }

  getPlanById(id: string): Observable<MedicationPlan> {
    return this.http.get<MedicationPlan>(`${this.apiUrl}/plans/${id}`);
  }

  getPlansByPatient(patientId: string): Observable<MedicationPlan[]> {
    return this.http.get<MedicationPlan[]>(`${this.apiUrl}/plans/by-patient/${patientId}`);
  }

  getActivePlansByPatient(patientId: string): Observable<MedicationPlan[]> {
    return this.http.get<MedicationPlan[]>(`${this.apiUrl}/plans/by-patient/${patientId}/active`);
  }

  createPlan(plan: MedicationPlanCreateRequest): Observable<MedicationPlan> {
    return this.http.post<MedicationPlan>(`${this.apiUrl}/plans`, plan);
  }

  updatePlan(id: string, plan: MedicationPlanUpdateRequest): Observable<MedicationPlan> {
    return this.http.put<MedicationPlan>(`${this.apiUrl}/plans/${id}`, plan);
  }

  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/plans/${id}`);
  }

  // Intakes
  getAllIntakes(): Observable<MedicationIntake[]> {
    return this.http.get<MedicationIntake[]>(`${this.apiUrl}/intakes`);
  }

  getIntakeById(id: string): Observable<MedicationIntake> {
    return this.http.get<MedicationIntake>(`${this.apiUrl}/intakes/${id}`);
  }

  getIntakesByPlan(planId: string): Observable<MedicationIntake[]> {
    return this.http.get<MedicationIntake[]>(`${this.apiUrl}/plans/${planId}/intakes`);
  }

  createIntake(planId: string, intake: MedicationIntakeCreateRequest): Observable<MedicationIntake> {
    return this.http.post<MedicationIntake>(`${this.apiUrl}/plans/${planId}/intakes`, intake);
  }

  updateIntake(id: string, intake: MedicationIntakeUpdateRequest): Observable<MedicationIntake> {
    return this.http.put<MedicationIntake>(`${this.apiUrl}/intakes/${id}`, intake);
  }

  deleteIntake(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/intakes/${id}`);
  }

  // Status updates
  markAsTaken(id: string): Observable<MedicationIntake> {
    return this.http.patch<MedicationIntake>(`${this.apiUrl}/intakes/${id}/take`, {});
  }

  markAsMissed(id: string): Observable<MedicationIntake> {
    return this.http.patch<MedicationIntake>(`${this.apiUrl}/intakes/${id}/miss`, {});
  }

  markAsSkipped(id: string): Observable<MedicationIntake> {
    return this.http.patch<MedicationIntake>(`${this.apiUrl}/intakes/${id}/skip`, {});
  }
}
