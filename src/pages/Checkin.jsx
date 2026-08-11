import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ScanLine, Search, UserCheck, XCircle } from 'lucide-react'
import api from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useToast } from '../components/ui/toast'

export default function Checkin() {
  const { addToast } = useToast()
  const inputRef = useRef(null)
  const [dni, setDni] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const resetFeedback = () => {
    setTimeout(() => setFeedback(null), 2400)
  }

  const handleSubmit = async (event) => {
    event?.preventDefault()
    const normalizedDni = dni.trim()
    if (!normalizedDni) {
      addToast('Ingresa un DNI.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await api.post('/asistencias/check-in', { dni: normalizedDni })
      const payload = response?.data || {}
      if (payload?.acceso === 'PERMITIDO' || response.status === 200) {
        setFeedback({ type: 'success', title: payload?.socio?.nombre || 'Acceso permitido', message: payload?.mensaje || 'Acceso permitido.' })
      } else {
        setFeedback({ type: 'error', title: 'Acceso denegado', message: payload?.mensaje || 'No se pudo validar el acceso.' })
      }
    } catch (error) {
      const payload = error?.response?.data || {}
      const message = payload?.mensaje || 'No se pudo validar el acceso.'
      setFeedback({ type: 'error', title: 'Acceso denegado', message })
    } finally {
      setIsSubmitting(false)
      setDni('')
      resetFeedback()
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl md:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600/20 p-3 text-blue-400">
            <ScanLine className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Check-in de acceso</h1>
            <p className="text-sm text-slate-400">Escanea o escribe el DNI del socio para autorizar el ingreso.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="dni-checkin" className="block text-sm font-medium text-slate-300">DNI</label>
          <Input id="dni-checkin" ref={inputRef} value={dni} onChange={(event) => setDni(event.target.value)} placeholder="Ej. 41416006" className="h-16 border-slate-700 bg-slate-800 text-xl text-white placeholder:text-slate-500" autoComplete="off" />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Validando...' : 'Validar acceso'}
          </Button>
        </form>

        {feedback && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className={`mt-6 rounded-2xl border p-6 ${feedback.type === 'success' ? 'border-emerald-600 bg-emerald-500/10 text-emerald-200' : 'border-red-600 bg-red-500/10 text-red-200'}`}>
            <div className="flex items-center gap-3">
              {feedback.type === 'success' ? <UserCheck className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
              <div>
                <h2 className="text-xl font-semibold">{feedback.title}</h2>
                <p className="text-sm opacity-90">{feedback.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
