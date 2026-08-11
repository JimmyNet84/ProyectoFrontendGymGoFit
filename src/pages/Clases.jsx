import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Plus, Users } from 'lucide-react'
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

export default function Clases() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [clases, setClases] = useState([])
  const [entrenadores, setEntrenadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ nombre: '', horario: '', cupo: '10', entrenador_id: '' })

  const loadClases = async () => {
    setLoading(true)
    try {
      const response = await api.get('/clases')
      const baseClases = Array.isArray(response.data) ? response.data : []

      const detailedClases = await Promise.all(baseClases.map(async (clase) => {
        const claseId = clase.clase_id ?? clase.id ?? clase.claseId
        if (!claseId) return clase

        try {
          const detalle = await api.get(`/inscripciones/clase/${claseId}`)
          const inscritos = Number(detalle?.data?.inscritos_actuales || 0)
          return { ...clase, inscritos_actuales: inscritos }
        } catch {
          return clase
        }
      }))

      setClases(detailedClases)
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudieron cargar las clases.'
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const normalizeEntrenadores = (payload) => {
    const candidate = payload?.entrenadores || payload?.data || payload?.result || payload?.resultado || payload
    if (Array.isArray(candidate)) return candidate
    if (Array.isArray(candidate?.entrenadores)) return candidate.entrenadores
    if (Array.isArray(candidate?.data)) return candidate.data
    return []
  }

  const loadEntrenadores = async () => {
    try {
      const response = await api.get('/entrenadores')
      setEntrenadores(normalizeEntrenadores(response.data))
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadClases()
    loadEntrenadores()
  }, [])

  const handleCreate = async () => {
    const selectedTrainerId = Number(form.entrenador_id)

    if (!form.nombre || !form.horario || !selectedTrainerId || Number.isNaN(selectedTrainerId)) {
      addToast('Completa nombre, horario y selecciona un entrenador válido.', 'error')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        nombre: form.nombre,
        horario: new Date(form.horario).toISOString(),
        cupo: Number(form.cupo) || 0,
        entrenador_id: selectedTrainerId
      }

      const response = await api.post('/clases', payload)
      addToast(response?.data?.mensaje || 'Clase creada', 'success')
      setOpen(false)
      setForm({ nombre: '', horario: '', cupo: '10', entrenador_id: '' })
      await loadClases()
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo crear la clase.'
      addToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clases</h1>
          <p className="text-sm text-slate-500">Gestiona la agenda y los cupos del gimnasio.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva clase
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Clases del gimnasio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Entrenador</TableHead>
                  <TableHead>Cupo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clases.length > 0 ? clases.map((clase) => {
                  const claseId = clase.clase_id ?? clase.id ?? clase.claseId
                  const inscritos = Number(clase.inscritos_actuales || clase.inscritos || 0)
                  const cupo = Number(clase.cupo || 0)
                  const cuposDisponibles = Math.max(0, cupo - inscritos)
                  const percent = cupo > 0 ? Math.min(100, Math.round((inscritos / cupo) * 100)) : 0
                  const fillClass = cuposDisponibles === 0 ? 'bg-red-500' : cuposDisponibles <= 2 ? 'bg-amber-500' : 'bg-emerald-500'
                  const entrenadorName = clase.Entrenador?.nombres || clase.entrenador?.nombres || clase.entrenador?.nombre || 'Sin asignar'

                  return (
                    <TableRow key={claseId ?? `${clase.nombre}-${clase.horario}`} className="cursor-pointer" onClick={() => navigate(`/clases/${claseId}`)}>
                      <TableCell className="font-medium text-slate-900">{clase.nombre}</TableCell>
                      <TableCell>{clase.horario ? new Date(clase.horario).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</TableCell>
                      <TableCell>{entrenadorName}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>{cuposDisponibles}/{cupo}</span>
                            <Badge variant="outline">{percent}%</Badge>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200">
                            <div className={`h-2 rounded-full ${fillClass}`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                }) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">
                      No hay clases registradas aún.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva clase</DialogTitle>
            <DialogDescription>Registra una nueva clase con horario, cupo y entrenador asignado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-clase">Nombre</Label>
              <Input id="nombre-clase" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horario-clase">Horario</Label>
              <Input id="horario-clase" type="datetime-local" value={form.horario} onChange={(event) => setForm({ ...form, horario: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cupo-clase">Cupo</Label>
              <Input id="cupo-clase" type="number" min="1" value={form.cupo} onChange={(event) => setForm({ ...form, cupo: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entrenador-clase">Entrenador</Label>
              <select id="entrenador-clase" value={form.entrenador_id} onChange={(event) => setForm({ ...form, entrenador_id: event.target.value })} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="">Selecciona un entrenador</option>
                {entrenadores.map((entrenador) => {
                  const trainerId = entrenador.id ?? entrenador.entrenador_id ?? entrenador.entrenadorId
                  const trainerName = entrenador.nombres || entrenador.nombre || entrenador.nombre_completo || 'Entrenador'
                  return (
                    <option key={trainerId ?? `${trainerName}-${entrenador.telefono || ''}`} value={trainerId ?? ''}>
                      {trainerName}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={submitting}>{submitting ? 'Guardando...' : 'Crear clase'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
