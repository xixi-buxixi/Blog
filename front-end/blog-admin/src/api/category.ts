// 分类相关 API
import { request } from '@/utils/request';

// 分类类型
export interface Category {
  id: number;
  name: string;
  description: string | null;
  sortOrder: number;
  articleCount?: number;
  createTime: string;
}

// 创建/更新分类参数
export interface CategoryFormData {
  name: string;
  description?: string;
  sortOrder?: number;
}

// 获取分类列表
export const getCategoryList = () => {
  return request.get<Category[]>('/categories');
};

// 创建分类
export const createCategory = (data: CategoryFormData) => {
  return request.post<Category>('/categories', data);
};

// 更新分类
export const updateCategory = (id: number, data: CategoryFormData) => {
  return request.put<Category>(`/categories/${id}`, data);
};

// 删除分类
export const deleteCategory = (id: number) => {
  return request.delete(`/categories/${id}`);
};