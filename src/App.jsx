import { Navigate, Route, Routes } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from './components/Layout'
import Login from './pages/Login'
import SocioPerfil from './pages/SocioPerfil'
import Socios from './pages/Socios'
import Clases from './pages/Clases'
import ClaseDetalle from './pages/ClaseDetalle'
import Checkin from './pages/Checkin'
import { ToastProvider } from './components/ui/toast'

function ProtectedRoute({ children }) {
  const auth = localStorage.getItem('fitgo-auth')
  return auth ? children : <Navigate to="/login" replace />
}

function App() {
  const auth = localStorage.getItem('fitgo-auth')
  const isAuthenticated = Boolean(auth)

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex min-h-screen items-center justify-center"><p className="text-lg text-slate-600">Dashboard en construcción</p></motion.div></Layout></ProtectedRoute>} />
          <Route path="/socios" element={<ProtectedRoute><Layout><Socios /></Layout></ProtectedRoute>} />
          <Route path="/socios/:id" element={<ProtectedRoute><Layout><SocioPerfil /></Layout></ProtectedRoute>} />
          <Route path="/clases" element={<ProtectedRoute><Layout><Clases /></Layout></ProtectedRoute>} />
          <Route path="/clases/:id" element={<ProtectedRoute><Layout><ClaseDetalle /></Layout></ProtectedRoute>} />
          <Route path="/checkin" element={<ProtectedRoute><Checkin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </div>
    </ToastProvider>
  )
}

export default App
