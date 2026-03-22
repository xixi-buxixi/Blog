// App 路由配置
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/utils/auth';
import MainLayout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import { ArticleList, ArticleEdit } from '@/pages/Article';
import CategoryManage from '@/pages/Category';

// 路由守卫组件
const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* 登录页 */}
      <Route path="/login" element={<Login />} />

      {/* 主布局 */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* 默认重定向到仪表盘 */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 仪表盘 */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* 文章管理 */}
        <Route path="article" element={<ArticleList />} />
        <Route path="article/edit" element={<ArticleEdit />} />
        <Route path="article/edit/:id" element={<ArticleEdit />} />

        {/* 分类管理 */}
        <Route path="category" element={<CategoryManage />} />
      </Route>

      {/* 404 重定向 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;