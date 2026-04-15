import httpClient from './httpClient';

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const unwrap = <T>(response: T | ApiEnvelope<T>): T => {
  if (response && typeof response === 'object' && 'data' in (response as ApiEnvelope<T>)) {
    return ((response as ApiEnvelope<T>).data as T) ?? (response as T);
  }
  return response as T;
};

export interface BlogPostDto {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImageUrl?: string | null;
  status: string;
  authorId?: string;
  authorName?: string | null;
  categoryId?: string;
  categoryName?: string | null;
  viewCount: number;
  likeCount: number;
  publishedAt?: string | null;
  createdAt: string;
  tags?: string[];
}

export interface BlogCommentDto {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  parentCommentId?: string | null;
  commentText: string;
  isApproved: boolean;
  createdAt: string;
  replies: BlogCommentDto[];
}

export interface BlogPostDetailDto extends BlogPostDto {
  isLikedByCurrentUser?: boolean;
  comments: BlogCommentDto[];
}

export interface BlogCategoryDto {
  id: string;
  categoryName: string;
  slug: string;
  description?: string | null;
  postCount: number;
}

export type CreateBlogPayload = {
  categoryId: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  status: 'draft' | 'published';
  tags?: string[];
};

export type UpdateBlogPayload = {
  title?: string;
  content?: string;
  categoryId?: string;
  excerpt?: string;
  featuredImageUrl?: string;
  status?: 'draft' | 'published';
  tags?: string[];
};

export type CreateBlogCategoryPayload = {
  categoryName: string;
  description?: string;
};

const BlogService = {
  async getPublishedPosts(): Promise<BlogPostDto[]> {
    const response = await httpClient.get<ApiEnvelope<BlogPostDto[]>>('/blogs');
    const raw = unwrap(response);
    return Array.isArray(raw) ? raw : [];
  },

  async getAllPosts(): Promise<BlogPostDto[]> {
    const response = await httpClient.get<ApiEnvelope<BlogPostDto[]>>('/blogs/all');
    const raw = unwrap(response);
    return Array.isArray(raw) ? raw : [];
  },

  async getBySlug(slug: string): Promise<BlogPostDetailDto> {
    const response = await httpClient.get<ApiEnvelope<BlogPostDetailDto>>(`/blogs/slug/${encodeURIComponent(slug)}`);
    return unwrap(response) as BlogPostDetailDto;
  },

  async getById(id: string): Promise<BlogPostDetailDto> {
    const response = await httpClient.get<ApiEnvelope<BlogPostDetailDto>>(`/blogs/${encodeURIComponent(id)}`);
    return unwrap(response) as BlogPostDetailDto;
  },

  async getByCategory(categoryId: string): Promise<BlogPostDto[]> {
    const response = await httpClient.get<ApiEnvelope<BlogPostDto[]>>(
      `/blogs/category/${encodeURIComponent(categoryId)}`
    );
    const raw = unwrap(response);
    return Array.isArray(raw) ? raw : [];
  },

  async getCategories(): Promise<BlogCategoryDto[]> {
    const response = await httpClient.get<ApiEnvelope<BlogCategoryDto[]>>('/blogs/categories');
    const raw = unwrap(response);
    return Array.isArray(raw) ? raw : [];
  },

  async createPost(payload: CreateBlogPayload): Promise<BlogPostDto> {
    const response = await httpClient.post<ApiEnvelope<BlogPostDto>>('/blogs', payload);
    return unwrap(response) as BlogPostDto;
  },

  async updatePost(postId: string, payload: UpdateBlogPayload): Promise<BlogPostDto> {
    const response = await httpClient.put<ApiEnvelope<BlogPostDto>>(`/blogs/${encodeURIComponent(postId)}`, payload);
    return unwrap(response) as BlogPostDto;
  },

  async deletePost(postId: string): Promise<boolean> {
    const response = await httpClient.delete<ApiEnvelope<boolean>>(`/blogs/${encodeURIComponent(postId)}`);
    const raw = unwrap(response);
    return Boolean(raw);
  },

  async publish(postId: string): Promise<boolean> {
    const response = await httpClient.patch<ApiEnvelope<boolean>>(`/blogs/${encodeURIComponent(postId)}/publish`);
    const raw = unwrap(response);
    return Boolean(raw);
  },

  async unpublish(postId: string): Promise<boolean> {
    const response = await httpClient.patch<ApiEnvelope<boolean>>(`/blogs/${encodeURIComponent(postId)}/unpublish`);
    const raw = unwrap(response);
    return Boolean(raw);
  },

  async addComment(postId: string, commentText: string, parentCommentId?: string): Promise<unknown> {
    const response = await httpClient.post<ApiEnvelope<unknown>>(`/blogs/${encodeURIComponent(postId)}/comments`, {
      commentText,
      parentCommentId: parentCommentId ?? undefined,
    });
    return unwrap(response);
  },

  async approveComment(commentId: string): Promise<boolean> {
    const response = await httpClient.patch<ApiEnvelope<boolean>>(
      `/blogs/comments/${encodeURIComponent(commentId)}/approve`
    );
    const raw = unwrap(response);
    return Boolean(raw);
  },

  async deleteComment(commentId: string): Promise<boolean> {
    const response = await httpClient.delete<ApiEnvelope<boolean>>(
      `/blogs/comments/${encodeURIComponent(commentId)}`
    );
    const raw = unwrap(response);
    return Boolean(raw);
  },

  async toggleLike(postId: string): Promise<{ liked: boolean; message?: string }> {
    const response = await httpClient.post<ApiEnvelope<boolean>>(`/blogs/${encodeURIComponent(postId)}/like`);
    const envelope = response as ApiEnvelope<boolean>;
    const liked = Boolean(unwrap(response));
    return { liked, message: envelope?.message };
  },

  async createCategory(payload: CreateBlogCategoryPayload): Promise<BlogCategoryDto> {
    const response = await httpClient.post<ApiEnvelope<BlogCategoryDto>>('/blogs/categories', payload);
    return unwrap(response) as BlogCategoryDto;
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    const response = await httpClient.delete<ApiEnvelope<boolean>>(
      `/blogs/categories/${encodeURIComponent(categoryId)}`
    );
    const raw = unwrap(response);
    return Boolean(raw);
  },
};

export default BlogService;
