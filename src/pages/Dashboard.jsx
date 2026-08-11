import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react'
import api from '../lib/api'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { useToast } from '../components/ui/toast'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
}

export default function Dashboard() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ total_socios: 0, activos: 0, vencidos: 0 })
  const [sociosPorVencer, setSociosPorVencer] = useState([])
  const [alertas, setAlertas] = useState([])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const response = await api.get('/dashboard')
      const payload = response?.data || {}
      setSummary(payload?.resumen || { total_socios: 0, activos: 0, vencidos: 0 })
      setSociosPorVencer(Array.isArray(payload?.socios_por_vencer) ? payload.socios_por_vencer : [])
      setAlertas(Array.isArray(payload?.alertas) ? payload.alertas : [])
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo cargar el dashboard'
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const cards = useMemo(() => [
    { label: 'Total socios', value: summary.total_socios, tone: 'default' },
    { label: 'Activos', value: summary.activos, tone: 'success' },
    { label: 'Vencidos', value: summary.vencidos, tone: 'danger' }
  ], [summary])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Resumen</p>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      </div>

      {alertas.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50/70">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Alertas
            </div>
            <ul className="mt-3 space-y-2 text-sm text-amber-900">
              {alertas.map((alerta, index) => {
                const lower = alerta.toLowerCase()
                let icon = CheckCircle
                if (lower.includes('venc') || lower.includes('vencido')) icon = AlertTriangle
                else if (lower.includes('próxim') || lower.includes('vencer') || lower.includes('vencen') || lower.includes('próximo')) icon = Clock
                const Icon = icon
                return (
                  <li key={`${alerta}-${index}`} className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{alerta}</span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="mb-6 grid gap-4 md:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <motion.div key={index} variants={cardVariants}>
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-3 h-8 w-16" />
                  </CardContent>
                </Card>
              </motion.div>
            ))
          : cards.map((card) => (
              <motion.div key={card.label} variants={cardVariants}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Users className="h-4 w-4 text-blue-600" />
                      {card.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold text-slate-900">{card.value}</div>
                    <Badge variant={card.tone === 'success' ? 'success' : card.tone === 'danger' ? 'danger' : 'default'} className="mt-3">
                      {card.tone === 'danger' ? 'Requiere atención' : card.tone === 'success' ? 'En buen estado' : 'Vista general'}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Socios por vencer</CardTitle>
          <p className="text-sm text-slate-500">Lista priorizada de membresías próximas a vencer.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Fecha fin</TableHead>
                <TableHead>Días restantes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                : sociosPorVencer.length > 0
                  ? sociosPorVencer.map((socio) => {
                      const days = Number(socio.dias_restantes ?? 0)
                      const isCritical = days <= 2
                      return (
                        <TableRow key={socio.socio_id ?? `${socio.nombre}-${socio.fecha_fin}`}>
                          <TableCell className="font-medium text-slate-900">{socio.nombre}</TableCell>
                          <TableCell>{socio.fecha_fin}</TableCell>
                          <TableCell>
                            <Badge variant={isCritical ? 'danger' : 'warning'}>{days}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  : (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-sm text-slate-500">
                          No hay socios próximos a vencer.
                        </TableCell>
                      </TableRow>
                    )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  )
}
