import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getToken, removeToken } from '@/utils/auth'
import { getUserInfo } from '@/api/auth'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import ArticleList from '@/pages/Article/List'
import ArticleEdit from '@/pages/Article/Edit'
import Category from '@/pages/Category'

// 路由守卫
function PrivateRoute({ children, isAuthenticated, loading }) {
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        加载中...
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        await getUserInfo()
        setIsAuthenticated(true)
      } catch (error) {
        removeToken()
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      } />
      <Route
        path="/"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
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