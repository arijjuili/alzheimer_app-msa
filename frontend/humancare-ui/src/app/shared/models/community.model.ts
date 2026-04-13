export enum PostCategory {
  GENERAL = 'GENERAL',
  SUPPORT = 'SUPPORT',
  ADVICE = 'ADVICE',
  EVENT = 'EVENT'
}

export interface CommunityPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: PostCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  authorId: string;
  title: string;
  content: string;
  category: PostCategory;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  category: PostCategory;
  isActive: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
