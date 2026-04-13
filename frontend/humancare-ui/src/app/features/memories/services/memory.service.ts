import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  MemoryItem,
  CreateMemoryItemRequest,
  UpdateMemoryItemRequest
} from '../../../shared/models/memory.model';

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/memories`;

  constructor(private http: HttpClient) {}

  getAllMemories(
    page = 0,
    size = 20,
    sort = 'createdAt,desc'
  ): Observable<MemoryItem[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<MemoryItem[]>(this.apiUrl, { params });
  }

  getMemoryById(id: string): Observable<MemoryItem> {
    return this.http.get<MemoryItem>(`${this.apiUrl}/${id}`);
  }

  getMemoriesByPatient(
    patientId: string,
    page = 0,
    size = 20,
    sort = 'createdAt,desc'
  ): Observable<MemoryItem[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<MemoryItem[]>(`${this.apiUrl}/patient/${patientId}`, { params });
  }

  createMemory(request: CreateMemoryItemRequest): Observable<MemoryItem> {
    return this.http.post<MemoryItem>(this.apiUrl, request);
  }

  updateMemory(id: string, request: UpdateMemoryItemRequest): Observable<MemoryItem> {
    return this.http.put<MemoryItem>(`${this.apiUrl}/${id}`, request);
  }

  deleteMemory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
