import { Routes, Route, Navigate } from 'react-router-dom'
import { getToken } from '@/utils/auth'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import ArticleList from '@/pages/Article/List'
import ArticleEdit from '@/pages/Article/Edit'
import Category from '@/pages/Category'

// 路由守卫
function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="article" element={<ArticleList />} />
        <Route path="article/add" element={<ArticleEdit />} />
        <Route path="article/edit/:id" element={<ArticleEdit />} />
        <Route path="category" element={<Category />} />
      </Route>
    </Routes>
  )
}

export default App