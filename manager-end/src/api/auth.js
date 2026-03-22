import request from '@/utils/request'

// 获取密码BCrypt哈希
export function encodePassword(password) {
  return request.get('/auth/encode', { params: { password } })
}

// 登录
export function login(data) {
  return request.post('/auth/login', data)
}

// 退出登录
export function logout() {
  return request.post('/auth/logout')
}

// 获取当前用户信息
export function getUserInfo() {
  return request.get('/auth/info')
}