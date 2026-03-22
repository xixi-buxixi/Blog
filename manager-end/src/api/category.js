import request from '@/utils/request'

// 获取分类列表
export function getCategoryList() {
  return request.get('/categories')
}

// 创建分类
export function createCategory(data) {
  return request.post('/categories', data)
}

// 更新分类
export function updateCategory(id, data) {
  return request.put(`/categories/${id}`, data)
}

// 删除分类
export function deleteCategory(id) {
  return request.delete(`/categories/${id}`)
}