// API 基础配置
const API_BASE_URL = import.meta.env.API_BASE_URL || '/api/v1';

// 统一响应结构
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 分页响应
interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 文章类型
export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  categoryId: number;
  categoryName: string;
  authorId: number;
  authorName: string;
  viewCount: number;
  status: number;
  createTime: string;
  updateTime: string;
}

// 分类类型
export interface Category {
  id: number;
  name: string;
  description: string | null;
  sortOrder: number;
  articleCount: number;
  createTime: string;
}

// 请求封装
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 获取 token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse<T> = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// 文章 API
export const articleApi = {
  // 获取文章列表
  getList: (params: {
    page?: number;
    pageSize?: number;
    categoryId?: number;
    keyword?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params.categoryId) searchParams.set('categoryId', String(params.categoryId));
    if (params.keyword) searchParams.set('keyword', params.keyword);

    const queryString = searchParams.toString();
    return request<PageResponse<Article>>(`/articles${queryString ? `?${queryString}` : ''}`);
  },

  // 获取文章详情
  getDetail: (id: number) => {
    return request<Article>(`/articles/${id}`);
  },

  // 搜索文章
  search: (keyword: string, page: number = 1, pageSize: number = 10) => {
    return request<PageResponse<Article>>(`/articles?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`);
  },
};

// 分类 API
export const categoryApi = {
  // 获取分类列表
  getList: () => {
    return request<Category[]>('/categories');
  },

  // 获取分类详情
  getDetail: (id: number) => {
    return request<Category>(`/categories/${id}`);
  },
};

// 归档 API
export const archiveApi = {
  // 按年月归档
  getArchive: () => {
    return request<{ year: number; month: number; articles: Article[] }[]>('/articles/archive');
  },
};