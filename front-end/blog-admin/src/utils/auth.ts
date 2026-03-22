// Token 管理工具

const TOKEN_KEY = 'blog_admin_token';
const USER_KEY = 'blog_admin_user';

// 获取 Token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// 设置 Token
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// 移除 Token
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// 获取用户信息
export const getUser = (): Record<string, unknown> | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// 设置用户信息
export const setUser = (user: Record<string, unknown>): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getToken();
};