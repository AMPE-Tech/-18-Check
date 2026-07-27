import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import PublicLayout from './components/PublicLayout'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Privacy from './pages/Privacy'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import HistoryPage from './pages/History'
import PlansPage from './pages/Plans'
import ToastContainer from './components/ui/Toast'
import { lazy, Suspense, type ReactNode } from 'react'

/* A tela de verificação carrega o FaceLivenessDetector, que traz o
   TensorFlow.js junto — sozinho ele mais que dobra o bundle. Separado por
   rota, quem só abre a Landing não paga por isso. */
const SearchPage = lazy(() => import('./pages/Search'))

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

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
        <ToastContainer />
        <Routes>
          {/* Landing — standalone, no PublicLayout wrapper */}
          <Route index element={<Landing />} />
          <Route path="privacidade" element={<Privacy />} />

          {/* Public routes with header/footer */}
          <Route element={<PublicLayout />}>
            <Route
              path="login"
              element={<PublicOnly><Login /></PublicOnly>}
            />
            <Route
              path="register"
              element={<PublicOnly><Register /></PublicOnly>}
            />
            <Route
              path="forgot-password"
              element={<PublicOnly><ForgotPassword /></PublicOnly>}
            />
          </Route>

          {/* Private routes */}
          <Route
            path="app"
            element={<PrivateRoute><Layout /></PrivateRoute>}
          >
            <Route index element={<Dashboard />} />
            <Route
              path="search"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <SearchPage />
                </Suspense>
              }
            />
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
