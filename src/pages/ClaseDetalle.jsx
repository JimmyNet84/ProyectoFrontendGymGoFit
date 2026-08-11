import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Search, Trash2, UserPlus, X } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../lib/api'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Skeleton } from '../components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { useToast } from '../components/ui/toast'

export default function ClaseDetalle() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addToast } = useToast()
  const [clase, setClase] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [socios, setSocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedSocioId, setSelectedSocioId] = useState('')
  const [inscribirOpen, setInscribirOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSocio, setPendingSocio] = useState(null)

  const normalizedId = id && String(id).trim() !== '' ? String(id).trim() : null

  const loadClase = async () => {
    if (!normalizedId) return
    setLoading(true)
    try {
      const response = await api.get(`/clases/${normalizedId}`)
      const data = response.data
      setClase(data)
    } catch (error) {
      addToast(error?.response?.data?.mensaje || 'No se pudo cargar la clase.', 'error')
      navigate('/clases')
    }
  }

  const loadDetalle = async () => {
    if (!normalizedId) return
    try {
      const response = await api.get(`/inscripciones/clase/${normalizedId}`)
      setDetalle(response.data)
    } catch (error) {
      addToast(error?.response?.data?.mensaje || 'No se pudo cargar el detalle de inscripciones.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadSocios = async () => {
    try {
      const response = await api.get('/socios')
      setSocios(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (normalizedId) {
      loadClase()
      loadDetalle()
      loadSocios()
    }
  }, [normalizedId])

  const filteredSocios = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return socios
    return socios.filter((socio) => {
      const nombre = `${socio.nombre || socio.Nombres || socio.Nombre || ''}`.toLowerCase()
      const dni = `${socio.dni || socio.DNI || socio.dni_socio || ''}`.toLowerCase()
      return nombre.includes(query) || dni.includes(query)
    })
  }, [socios, search])

  const handleInscribir = async () => {
    if (!selectedSocioId || !normalizedId) return
    setSubmitting(true)
    try {
      const response = await api.post(`/clases/${normalizedId}/inscribir`, { socio_id: Number(selectedSocioId) })
      addToast(response?.data?.mensaje || 'Inscripción creada', 'success')
      setInscribirOpen(false)
      setSelectedSocioId('')
      setSearch('')
      await loadDetalle()
    } catch (error) {
      addToast(error?.response?.data?.mensaje || 'No se pudo inscribir al socio.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!pendingSocio || !normalizedId) return
    setSubmitting(true)
    try {
      const response = await api.delete(`/clases/${normalizedId}/inscripcion/${pendingSocio.socio_id}`)
      addToast(response?.data?.mensaje || 'Inscripción cancelada', 'success')
      setConfirmOpen(false)
      setPendingSocio(null)
      await loadDetalle()
    } catch (error) {
      addToast(error?.response?.data?.mensaje || 'No se pudo cancelar la inscripción.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !clase || !detalle) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const cuposDisponibles = Number(detalle.cupos_disponibles || 0)
  const inscritosActuales = Number(detalle.inscritos_actuales || 0)
  const cupoMaximo = Number(detalle.cupo_maximo || 0)
  const percent = cupoMaximo > 0 ? Math.min(100, Math.round((inscritosActuales / cupoMaximo) * 100)) : 0
  const progressClass = cuposDisponibles === 0 ? 'bg-red-500' : cuposDisponibles <= 2 ? 'bg-amber-500' : 'bg-emerald-500'
  const inscritos = Array.isArray(detalle.inscripciones) ? detalle.inscripciones : []

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate('/clases')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button onClick={() => setInscribirOpen(true)} disabled={cuposDisponibles === 0}>
          <UserPlus className="mr-2 h-4 w-4" />
          Inscribir socio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{clase.nombre}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Horario</p>
              <p className="font-medium text-slate-900">{clase.horario ? new Date(clase.horario).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Entrenador</p>
              <p className="font-medium text-slate-900">{clase.Entrenador?.nombres || clase.entrenador?.nombres || clase.entrenador?.nombre || clase.Entrenador?.nombre || 'Sin asignar'}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Inscritos</span>
              <span>{inscritosActuales}/{cupoMaximo}</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
              <div className={`h-2 rounded-full ${progressClass}`} style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">Cupos disponibles</span>
              <span className={cuposDisponibles === 0 ? 'font-semibold text-red-600' : cuposDisponibles <= 2 ? 'font-semibold text-amber-600' : 'font-semibold text-emerald-600'}>{cuposDisponibles}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inscritos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Socio</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead className="w-16">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inscritos.length > 0 ? inscritos.map((item) => (
                <TableRow key={`${item.socio_id ?? item.Socio?.socio_id ?? item.socio?.socio_id ?? ''}-${item.socio?.dni || item.Socio?.dni || ''}`}>
                  <TableCell>{item.socio?.nombre || item.Socio?.nombre || item.nombre || 'Socio'}</TableCell>
                  <TableCell>{item.socio?.dni || item.Socio?.dni || item.dni || '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setPendingSocio(item); setConfirmOpen(true) }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-slate-500">
                    No hay inscritos aún.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={inscribirOpen} onOpenChange={setInscribirOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscribir socio</DialogTitle>
            <DialogDescription>Busca un socio por nombre o DNI y regístralo en la clase.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buscar-socio">Buscar</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="buscar-socio" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o DNI" className="pl-9" />
              </div>
            </div>
            <div className="max-h-56 space-y-2 overflow-auto rounded-lg border border-slate-200 p-2">
              {filteredSocios.length > 0 ? filteredSocios.map((socio) => {
                const socioId = socio.socio_id ?? socio.id ?? socio.socioId ?? socio.socioid
                const socioName = socio.nombre || socio.Nombre || socio.Nombres || 'Socio'
                const socioDni = socio.dni || socio.DNI || socio.dni_socio || '-'
                return (
                  <button key={socioId ?? `${socioName}-${socioDni}`} type="button" onClick={() => setSelectedSocioId(String(socioId))} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${selectedSocioId === String(socioId) ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}>
                    <span>{socioName}</span>
                    <span className="text-slate-500">{socioDni}</span>
                  </button>
                )
              }) : (
                <p className="px-2 py-4 text-sm text-slate-500">No se encontraron socios.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInscribirOpen(false)}>Cancelar</Button>
            <Button onClick={handleInscribir} disabled={!selectedSocioId || submitting}>{submitting ? 'Guardando...' : 'Inscribir'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar inscripción</DialogTitle>
            <DialogDescription>¿Deseas quitar esta inscripción de la clase?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={submitting}>{submitting ? 'Eliminando...' : 'Confirmar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
