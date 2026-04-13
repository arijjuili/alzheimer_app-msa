import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CommunityPost,
  CreatePostRequest,
  UpdatePostRequest,
  Page
} from '../../../shared/models/community.model';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/posts`;

  constructor(private http: HttpClient) {}

  getPosts(
    page = 0,
    size = 20,
    sort = 'createdAt,desc',
    authorId?: string,
    category?: string
  ): Observable<Page<CommunityPost>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    if (authorId) {
      params = params.set('authorId', authorId);
    }
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<Page<CommunityPost>>(this.apiUrl, { params });
  }

  getPostById(id: string): Observable<CommunityPost> {
    return this.http.get<CommunityPost>(`${this.apiUrl}/${id}`);
  }

  createPost(request: CreatePostRequest): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(this.apiUrl, request);
  }

  updatePost(id: string, request: UpdatePostRequest): Observable<CommunityPost> {
    return this.http.put<CommunityPost>(`${this.apiUrl}/${id}`, request);
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
