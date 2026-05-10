// App 路由配置
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { isAuthenticated } from '@/utils/auth';
import MainLayout from '@/components/Layout';
import Login from '@/pages/Login';

// 懒加载页面组件 - 减少首屏加载体积
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ArticleList = lazy(() => import('@/pages/Article/List'));
const ArticleEdit = lazy(() => import('@/pages/Article/Edit'));
const CategoryManage = lazy(() => import('@/pages/Category'));

// 加载中组件
const Loading: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '100px 0' }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

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
        <Route path="dashboard" element={
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        } />

        {/* 文章管理 */}
        <Route path="article" element={
          <Suspense fallback={<Loading />}>
            <ArticleList />
          </Suspense>
        } />
        <Route path="article/edit" element={
          <Suspense fallback={<Loading />}>
            <ArticleEdit />
          </Suspense>
        } />
        <Route path="article/edit/:id" element={
          <Suspense fallback={<Loading />}>
            <ArticleEdit />
          </Suspense>
        } />

        {/* 分类管理 */}
        <Route path="category" element={
          <Suspense fallback={<Loading />}>
            <CategoryManage />
          </Suspense>
        } />
      </Route>

      {/* 404 重定向 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;