import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Pencil, Plus, Trash2 } from 'lucide-react'
import api from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Skeleton } from '../components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { useToast } from '../components/ui/toast'

export default function Entrenadores() {
  const { addToast } = useToast()
  const [entrenadores, setEntrenadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ nombres: '', telefono: '', especialidad: '' })

  const loadEntrenadores = async () => {
    setLoading(true)
    try {
      const response = await api.get('/entrenadores')
      const payload = response?.data
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []
      setEntrenadores(list)
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudieron cargar los entrenadores'
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntrenadores()
  }, [])

  const resetForm = () => {
    setForm({ nombres: '', telefono: '', especialidad: '' })
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setOpen(true)
  }

  const openEdit = (entrenador) => {
    setEditingId(entrenador?.id ?? entrenador?.entrenador_id ?? null)
    setForm({
      nombres: entrenador?.nombres || '',
      telefono: entrenador?.telefono || '',
      especialidad: entrenador?.especialidad || ''
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      if (editingId) {
        const response = await api.put(`/entrenadores/${editingId}`, form)
        addToast(response?.data?.mensaje || 'Entrenador actualizado', 'success')
      } else {
        const response = await api.post('/entrenadores', form)
        addToast(response?.data?.mensaje || 'Entrenador creado', 'success')
      }
      setOpen(false)
      resetForm()
      await loadEntrenadores()
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo guardar el entrenador'
      addToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este entrenador?')) return
    try {
      const response = await api.delete(`/entrenadores/${id}`)
      addToast(response?.data?.mensaje || 'Entrenador eliminado', 'success')
      await loadEntrenadores()
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo eliminar el entrenador'
      addToast(message, 'error')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Gestión</p>
          <h1 className="text-2xl font-semibold text-slate-900">Entrenadores</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo entrenador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-600" />
            Listado de entrenadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="ml-auto h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                : entrenadores.length > 0
                  ? entrenadores.map((entrenador) => {
                      const id = entrenador?.id ?? entrenador?.entrenador_id ?? entrenador?.entrenadorId
                      return (
                        <TableRow key={id ?? `${entrenador.nombres}-${entrenador.telefono}`}>
                          <TableCell className="font-medium text-slate-900">{entrenador.nombres}</TableCell>
                          <TableCell>{entrenador.telefono}</TableCell>
                          <TableCell>{entrenador.especialidad}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEdit(entrenador)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  : (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">
                          No hay entrenadores registrados.
                        </TableCell>
                      </TableRow>
                    )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar entrenador' : 'Nuevo entrenador'}</DialogTitle>
            <DialogDescription>Completa los datos del entrenador.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres</Label>
              <Input id="nombres" value={form.nombres} onChange={(event) => setForm({ ...form, nombres: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input id="especialidad" value={form.especialidad} onChange={(event) => setForm({ ...form, especialidad: event.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); resetForm() }}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
