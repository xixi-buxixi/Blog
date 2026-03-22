// 文章相关 API
import { request, PageResponse } from '@/utils/request';

// 文章类型
export interface Article {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  categoryId: number | null;
  categoryName: string | null;
  authorId: number;
  authorName: string;
  viewCount: number;
  status: 0 | 1; // 0: 草稿, 1: 发布
  createTime: string;
  updateTime: string;
}

// 文章查询参数
export interface ArticleQueryParams {
  page?: number;
  pageSize?: number;
  title?: string;
  categoryId?: number;
  status?: number;
}

// 创建/更新文章参数
export interface ArticleFormData {
  title: string;
  summary?: string;
  content: string;
  coverImage?: string;
  categoryId?: number;
  status?: 0 | 1;
}

// 获取文章列表
export const getArticleList = (params: ArticleQueryParams) => {
  return request.get<PageResponse<Article>>('/articles', { params });
};

// 获取文章详情
export const getArticleDetail = (id: number) => {
  return request.get<Article>(`/articles/${id}`);
};

// 创建文章
export const createArticle = (data: ArticleFormData) => {
  return request.post<Article>('/articles', data);
};

// 更新文章
export const updateArticle = (id: number, data: ArticleFormData) => {
  return request.put<Article>(`/articles/${id}`, data);
};

// 删除文章
export const deleteArticle = (id: number) => {
  return request.delete(`/articles/${id}`);
};

// 批量删除文章
export const batchDeleteArticles = (ids: number[]) => {
  return request.post('/articles/batch-delete', { ids });
};