// 认证相关 API
import { request } from '@/utils/request';

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  userInfo: {
    id: number;
    username: string;
    nickname: string;
    avatar: string | null;
    role: string;
  };
}

// 登录
export const login = (params: LoginParams) => {
  return request.post<LoginResponse>('/auth/login', params);
};

// 退出登录
export const logout = () => {
  return request.post('/auth/logout');
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return request.get<LoginResponse['user']>('/auth/me');
};