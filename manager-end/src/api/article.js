import request from '@/utils/request'

// 获取文章列表
export function getArticleList(params) {
  return request.get('/articles', { params })
}

// 获取文章详情
export function getArticleDetail(id) {
  return request.get(`/articles/${id}`)
}

// 创建文章
export function createArticle(data) {
  return request.post('/articles', data)
}

// 更新文章
export function updateArticle(id, data) {
  return request.put(`/articles/${id}`, data)
}

// 删除文章
export function deleteArticle(id) {
  return request.delete(`/articles/${id}`)
}

// 获取文章统计数据
export function getArticleStats() {
  return request.get('/articles/stats')
}