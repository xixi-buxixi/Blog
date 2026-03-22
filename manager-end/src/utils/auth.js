const TOKEN_KEY = 'blog_admin_token'

// 获取Token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// 设置Token
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

// 移除Token
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// 检查是否已登录
export function isAuthenticated() {
  return !!getToken()
}