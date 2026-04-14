import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Routine,
  CreateRoutineRequest,
  UpdateRoutineRequest,
  Page
} from '../../../shared/models/routine.model';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/routines`;

  constructor(private http: HttpClient) {}

  getAllRoutines(
    page = 0,
    size = 20,
    sort = 'createdAt,desc'
  ): Observable<Page<Routine>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<Page<Routine>>(this.apiUrl, { params });
  }

  getRoutineById(id: string): Observable<Routine> {
    return this.http.get<Routine>(`${this.apiUrl}/${id}`);
  }

  getRoutinesByPatient(
    patientId: string,
    page = 0,
    size = 20,
    sort = 'createdAt,desc'
  ): Observable<Page<Routine>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<Page<Routine>>(`${this.apiUrl}/patient/${patientId}`, { params });
  }

  createRoutine(request: CreateRoutineRequest): Observable<Routine> {
    return this.http.post<Routine>(this.apiUrl, request);
  }

  updateRoutine(id: string, request: UpdateRoutineRequest): Observable<Routine> {
    return this.http.put<Routine>(`${this.apiUrl}/${id}`, request);
  }

  deleteRoutine(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  completeRoutine(id: string): Observable<Routine> {
    return this.http.patch<Routine>(`${this.apiUrl}/${id}/complete`, {});
  }

  uncompleteRoutine(id: string): Observable<Routine> {
    return this.http.patch<Routine>(`${this.apiUrl}/${id}/uncomplete`, {});
  }
}
