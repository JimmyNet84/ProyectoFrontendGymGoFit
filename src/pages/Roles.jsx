import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Plus, Shield, Trash2 } from 'lucide-react'
import api from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Skeleton } from '../components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { useToast } from '../components/ui/toast'

export default function Roles() {
  const { addToast } = useToast()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })

  const loadRoles = async () => {
    setLoading(true)
    try {
      const response = await api.get('/roles')
      const payload = response?.data
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []
      setRoles(list)
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudieron cargar los roles'
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const resetForm = () => {
    setForm({ nombre: '', descripcion: '' })
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setOpen(true)
  }

  const openEdit = (rol) => {
    setEditingId(rol?.id ?? rol?.rol_id ?? null)
    setForm({
      nombre: rol?.nombre || '',
      descripcion: rol?.descripcion || ''
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      if (editingId) {
        const response = await api.put(`/roles/${editingId}`, form)
        addToast(response?.data?.mensaje || 'Rol actualizado', 'success')
      } else {
        const response = await api.post('/roles', form)
        addToast(response?.data?.mensaje || 'Rol creado', 'success')
      }
      setOpen(false)
      resetForm()
      await loadRoles()
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo guardar el rol'
      addToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este rol?')) return
    try {
      const response = await api.delete(`/roles/${id}`)
      addToast(response?.data?.mensaje || 'Rol eliminado', 'success')
      await loadRoles()
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo eliminar el rol'
      addToast(message, 'error')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Administración</p>
          <h1 className="text-2xl font-semibold text-slate-900">Roles</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo rol
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Listado de roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="ml-auto h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                : roles.length > 0
                  ? roles.map((rol) => {
                      const id = rol?.id ?? rol?.rol_id ?? rol?.rolId
                      return (
                        <TableRow key={id ?? rol.nombre}>
                          <TableCell className="font-medium text-slate-900">{rol.nombre}</TableCell>
                          <TableCell>{rol.descripcion}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEdit(rol)}>
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
                        <TableCell colSpan={3} className="py-8 text-center text-sm text-slate-500">
                          No hay roles registrados.
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
            <DialogTitle>{editingId ? 'Editar rol' : 'Nuevo rol'}</DialogTitle>
            <DialogDescription>Define el nombre y la descripción del rol.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rol-nombre">Nombre</Label>
              <Input id="rol-nombre" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rol-descripcion">Descripción</Label>
              <Input id="rol-descripcion" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
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
