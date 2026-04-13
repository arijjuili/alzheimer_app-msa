import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  MemoryItem,
  MemoryItemCreateRequest,
  MemoryItemUpdateRequest
} from '../../../shared/models/memory.model';

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/memory-items`;

  constructor(private http: HttpClient) {}

  getMemoryItems(patientId?: string): Observable<MemoryItem[]> {
    let params = new HttpParams();
    if (patientId) {
      params = params.set('patientId', patientId);
    }
    return this.http.get<MemoryItem[]>(this.apiUrl, { params });
  }

  getMemoryItemById(id: string): Observable<MemoryItem> {
    return this.http.get<MemoryItem>(`${this.apiUrl}/${id}`);
  }

  getMemoryItemsByPatient(patientId: string): Observable<MemoryItem[]> {
    return this.http.get<MemoryItem[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getMemoryItemsByPatients(patientIds: string[]): Observable<MemoryItem[]> {
    return this.http.post<MemoryItem[]>(`${this.apiUrl}/batch/by-patients`, patientIds);
  }

  createMemoryItem(item: MemoryItemCreateRequest): Observable<MemoryItem> {
    return this.http.post<MemoryItem>(this.apiUrl, item);
  }

  updateMemoryItem(id: string, item: MemoryItemUpdateRequest): Observable<MemoryItem> {
    return this.http.put<MemoryItem>(`${this.apiUrl}/${id}`, item);
  }

  deleteMemoryItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
