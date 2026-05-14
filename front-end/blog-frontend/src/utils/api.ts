// API 基础配置
// SSR 模式: 服务端直接请求后端 (通过 PUBLIC_API_BASE_URL 环境变量或默认值)
// 浏览器模式: 通过 Nginx 代理转发请求
const API_BASE_URL = typeof window === 'undefined'
  ? (import.meta.env.PUBLIC_API_BASE_URL || 'http://149.13.91.133:8081/api/v1')
  : '/api/v1';

// 统一响应结构
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 分页响应（适配后端 PageResult 结构）
interface PageResponse<T> {
  records: T[];      // 后端返回 records
  total: number;
  current: number;   // 后端返回 current
  size: number;      // 后端返回 size
  pages: number;     // 后端返回 pages
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
    current?: number;
    size?: number;
    categoryId?: number;
    keyword?: string;
    status?: number;
  } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.current) searchParams.set('current', String(params.current));
    if (params.size) searchParams.set('size', String(params.size));
    if (params.categoryId) searchParams.set('categoryId', String(params.categoryId));
    if (params.keyword) searchParams.set('keyword', params.keyword);
    if (params.status !== undefined) searchParams.set('status', String(params.status));

    const queryString = searchParams.toString();
    return request<PageResponse<Article>>(`/articles${queryString ? `?${queryString}` : ''}`);
  },

  // 获取文章详情
  getDetail: (id: number) => {
    return request<Article>(`/articles/${id}`);
  },

  // 搜索文章
  search: (keyword: string, current: number = 1, size: number = 10) => {
    return request<PageResponse<Article>>(`/articles?keyword=${encodeURIComponent(keyword)}&current=${current}&size=${size}&status=1`);
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

// 评论类型
export interface Comment {
  id: number;
  articleId: number;
  parentId: number | null;
  replyToId: number | null;
  nickname: string;
  email: string | null;
  content: string;
  status: number;
  createTime: string;
  replyToNickname?: string;
  replies: Comment[];
}

// 评论统计类型
export interface CommentCount {
  total: number;
}

// 发表评论请求类型
export interface CreateCommentRequest {
  articleId: number;
  parentId?: number | null;
  replyToId?: number | null;
  nickname: string;
  email: string;
  content: string;
}

// 评论 API
export const commentApi = {
  // 获取评论列表
  getComments: (articleId: number, page: number = 1, size: number = 20) => {
    return request<PageResponse<Comment>>(`/comments/article/${articleId}?page=${page}&size=${size}`);
  },

  // 获取评论数量
  getCommentCount: (articleId: number) => {
    return request<CommentCount>(`/comments/article/${articleId}/count`);
  },

  // 发表评论
  createComment: (data: CreateCommentRequest) => {
    return request<number>('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 删除评论
  deleteComment: (id: number) => {
    return request<void>(`/comments/${id}`, {
      method: 'DELETE',
    });
  },
};

// 归档 API
export const archiveApi = {
  // 按年月归档
  getArchive: () => {
    return request<{ year: number; month: number; articles: Article[] }[]>('/articles/archive');
  },
};
