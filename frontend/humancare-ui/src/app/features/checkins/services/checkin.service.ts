import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DailyCheckin,
  CreateDailyCheckinRequest,
  UpdateDailyCheckinRequest
} from '../../../shared/models/checkin.model';

@Injectable({
  providedIn: 'root'
})
export class CheckinService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/checkins`;

  constructor(private http: HttpClient) {}

  getAllCheckins(
    page = 0,
    size = 20,
    sort = 'checkinDate,desc'
  ): Observable<DailyCheckin[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<DailyCheckin[]>(this.apiUrl, { params });
  }

  getCheckinsByPatient(
    patientId: string,
    page = 0,
    size = 20,
    sort = 'checkinDate,desc'
  ): Observable<DailyCheckin[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<DailyCheckin[]>(`${this.apiUrl}/patient/${patientId}`, { params });
  }

  getTodaysCheckin(patientId: string): Observable<DailyCheckin> {
    return this.http.get<DailyCheckin>(`${this.apiUrl}/patient/${patientId}/today`);
  }

  createCheckin(request: CreateDailyCheckinRequest): Observable<DailyCheckin> {
    return this.http.post<DailyCheckin>(this.apiUrl, request);
  }

  updateCheckin(id: string, request: UpdateDailyCheckinRequest): Observable<DailyCheckin> {
    return this.http.put<DailyCheckin>(`${this.apiUrl}/${id}`, request);
  }

  deleteCheckin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
