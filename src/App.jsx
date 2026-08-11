import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import SocioPerfil from './pages/SocioPerfil'
import Socios from './pages/Socios'
import Clases from './pages/Clases'
import ClaseDetalle from './pages/ClaseDetalle'
import Checkin from './pages/Checkin'
import Dashboard from './pages/Dashboard'
import Entrenadores from './pages/Entrenadores'
import Usuarios from './pages/Usuarios'
import Roles from './pages/Roles'
import NoAutorizado from './pages/NoAutorizado'
import { ToastProvider } from './components/ui/toast'

function ProtectedRoute({ children }) {
  const auth = localStorage.getItem('fitgo-auth')
  return auth ? children : <Navigate to="/login" replace />
}

function RoleBasedRoute({ children, allowedRoles = [] }) {
  const auth = localStorage.getItem('fitgo-auth')
  const parsed = auth ? JSON.parse(auth) : {}
  const role = parsed?.usuario?.rol || ''
  const isAllowed = allowedRoles.length === 0 || allowedRoles.includes(role)

  if (!auth) return <Navigate to="/login" replace />
  return isAllowed ? children : <Navigate to="/no-autorizado" replace />
}

function App() {
  const auth = localStorage.getItem('fitgo-auth')
  const isAuthenticated = Boolean(auth)

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/no-autorizado" element={<ProtectedRoute><Layout><NoAutorizado /></Layout></ProtectedRoute>} />
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<RoleBasedRoute allowedRoles={['Administrador']}><Layout><Dashboard /></Layout></RoleBasedRoute>} />
          <Route path="/socios" element={<ProtectedRoute><Layout><Socios /></Layout></ProtectedRoute>} />
          <Route path="/socios/:id" element={<ProtectedRoute><Layout><SocioPerfil /></Layout></ProtectedRoute>} />
          <Route path="/clases" element={<ProtectedRoute><Layout><Clases /></Layout></ProtectedRoute>} />
          <Route path="/clases/:id" element={<ProtectedRoute><Layout><ClaseDetalle /></Layout></ProtectedRoute>} />
          <Route path="/entrenadores" element={<RoleBasedRoute allowedRoles={['Administrador', 'Personal']}><Layout><Entrenadores /></Layout></RoleBasedRoute>} />
          <Route path="/checkin" element={<ProtectedRoute><Checkin /></ProtectedRoute>} />
          <Route path="/usuarios" element={<RoleBasedRoute allowedRoles={['Administrador']}><Layout><Usuarios /></Layout></RoleBasedRoute>} />
          <Route path="/roles" element={<RoleBasedRoute allowedRoles={['Administrador']}><Layout><Roles /></Layout></RoleBasedRoute>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </div>
    </ToastProvider>
  )
}

export default App
