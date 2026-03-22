// 全局状态管理 - 使用 Zustand
import { create } from 'zustand';
import { setToken, removeToken, setUser, getUser, getToken } from '@/utils/auth';

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string | null;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  user: getUser() as User | null,
  isAuthenticated: !!getToken(),
  setAuth: (token, user) => {
    setToken(token);
    setUser(user as unknown as Record<string, unknown>);
    set({ token, user, isAuthenticated: true });
  },
  clearAuth: () => {
    removeToken();
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

// 侧边栏折叠状态
interface SidebarState {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
}));