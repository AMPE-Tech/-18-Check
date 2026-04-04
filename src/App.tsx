import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import PublicLayout from './components/PublicLayout'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SearchPage from './pages/Search'
import HistoryPage from './pages/History'
import PlansPage from './pages/Plans'
import type { ReactNode } from 'react'

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return user ? <Navigate to="/app" replace /> : <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route index element={<Landing />} />
            <Route
              path="login"
              element={<PublicOnly><Login /></PublicOnly>}
            />
            <Route
              path="register"
              element={<PublicOnly><Register /></PublicOnly>}
            />
          </Route>

          {/* Private routes */}
          <Route
            path="app"
            element={<PrivateRoute><Layout /></PrivateRoute>}
          >
            <Route index element={<Dashboard />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="history/:id" element={<HistoryPage />} />
            <Route path="plans" element={<PlansPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
