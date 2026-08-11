import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, ShieldCheck } from 'lucide-react'
import api from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../components/ui/toast'

export default function Login() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('fitgo-auth')
    if (auth) {
      const parsed = JSON.parse(auth)
      const role = parsed?.usuario?.rol?.toLowerCase?.() || ''
      if (role === 'administrador') navigate('/dashboard')
      else if (role === 'personal') navigate('/checkin')
    }
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/auth/login', form)
      const payload = response.data
      const authData = {
        token: payload.token,
        usuario: payload.usuario
      }

      localStorage.setItem('fitgo-auth', JSON.stringify(authData))
      localStorage.setItem('fitgo-user', JSON.stringify(payload.usuario))
      addToast('Inicio de sesión exitoso', 'success')

      const rol = payload?.usuario?.rol?.toLowerCase?.() || ''
      if (rol === 'administrador') {
        navigate('/dashboard')
      } else if (rol === 'personal') {
        navigate('/checkin')
      } else {
        navigate('/login')
      }
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo iniciar sesión'
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full max-w-md">
        <Card className="border-slate-200 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">FIT GO</CardTitle>
            <CardDescription>Panel administrativo del gimnasio</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="usuario@fitgo.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
                <LogIn className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
