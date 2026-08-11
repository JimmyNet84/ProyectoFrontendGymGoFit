import { Navigate, Route, Routes } from 'react-router-dom'
import { motion } from 'framer-motion'
import Login from './pages/Login'
import { ToastProvider } from './components/ui/toast'

function App() {
  const auth = localStorage.getItem('fitgo-auth')
  const isAuthenticated = Boolean(auth)

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex min-h-screen items-center justify-center"><p className="text-lg text-slate-600">Dashboard en construcción</p></motion.div>} />
          <Route path="/checkin" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex min-h-screen items-center justify-center"><p className="text-lg text-slate-600">Check-in en construcción</p></motion.div>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </div>
    </ToastProvider>
  )
}

export default App
