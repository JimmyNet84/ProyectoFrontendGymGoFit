import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, CreditCard, Edit3, Plus, Trash2, Users } from 'lucide-react'
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

export default function SocioPerfil() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addToast } = useToast()
  const [socio, setSocio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [membershipOpen, setMembershipOpen] = useState(false)
  const [renewOpen, setRenewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ nombre: '', dni: '', telefono: '', email: '' })
  const [membershipType, setMembershipType] = useState('Mensual')
  const [renewType, setRenewType] = useState('Mensual')
  const [selectedMembershipId, setSelectedMembershipId] = useState(null)
  const [clases, setClases] = useState([])

  const normalizedId = id && String(id).trim() !== '' ? String(id).trim() : null

  const normalizeSocioPayload = (payload) => {
    const candidate = payload?.socio || payload?.data || payload?.result || payload?.resultado || payload
    const base = typeof candidate === 'object' && candidate !== null ? candidate : null

    if (!base) {
      return { socio: null, memberships: [] }
    }

    const memberships = Array.isArray(base.membresias)
      ? base.membresias
      : Array.isArray(base.memberships)
        ? base.memberships
        : Array.isArray(base.membresias_historial)
          ? base.membresias_historial
          : Array.isArray(base.Membresia)
            ? base.Membresia
            : []

    return { socio: { ...base, membresias: memberships }, memberships }
  }

  const loadSocio = async () => {
    if (!normalizedId) {
      setLoading(false)
      addToast('No se encontró el identificador del socio', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/socios/${normalizedId}`)
      const { socio } = normalizeSocioPayload(response.data)

      setSocio((prev) => {
        if (!socio) return prev
        return {
          ...(prev || {}),
          ...socio,
          membresias: Array.isArray(socio.membresias) ? socio.membresias : prev?.membresias || []
        }
      })
      setForm((prevForm) => ({
        nombre: socio?.nombre || prevForm.nombre || '',
        dni: socio?.dni || prevForm.dni || '',
        telefono: socio?.telefono || prevForm.telefono || '',
        email: socio?.email || prevForm.email || ''
      }))
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo cargar el perfil del socio'
      addToast(message, 'error')
      navigate('/socios')
    } finally {
      setLoading(false)
    }
  }

  const loadClases = async () => {
    if (!normalizedId) return

    try {
      const response = await api.get(`/inscripciones/socio/${normalizedId}`)
      setClases(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se cargaron las clases inscritas'
      addToast(message, 'error')
    }
  }

  useEffect(() => {
    if (normalizedId) {
      loadSocio()
      loadClases()
    }
  }, [normalizedId])

  const handleSave = async () => {
    setSubmitting(true)
    try {
      const response = await api.put(`/socios/${id}`, form)
      addToast(response?.data?.mensaje || 'Socio actualizado', 'success')
      setEditOpen(false)
      await loadSocio()
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo actualizar el socio'
      addToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateMembership = async () => {
    setSubmitting(true)
    try {
      const response = await api.post('/membresias', { socio_id: Number(normalizedId), tipo: membershipType })
      const createdMembership = response?.data?.membresia || response?.data?.membership || response?.data?.data?.membresia || response?.data?.data?.membership || null

      addToast(response?.data?.mensaje || 'Membresía creada', 'success')
      setMembershipOpen(false)

      if (createdMembership) {
        setSocio((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            membresias: [createdMembership, ...(Array.isArray(prev.membresias) ? prev.membresias : [])]
          }
        })
      }

      await loadSocio()
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo crear la membresía'
      addToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRenew = async () => {
    if (!selectedMembershipId) return
    setSubmitting(true)
    try {
      const response = await api.put(`/membresias/${selectedMembershipId}/renovar`, { tipo: renewType })
      addToast(response?.data?.mensaje || 'Membresía renovada', 'success')
      setRenewOpen(false)
      await loadSocio()
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo renovar la membresía'
      addToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      const response = await api.delete(`/socios/${id}`)
      addToast(response?.data?.mensaje || 'Socio eliminado', 'success')
      navigate('/socios')
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo eliminar el socio'
      addToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !socio) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </motion.div>
    )
  }

  const memberships = Array.isArray(socio?.membresias) ? socio.membresias : []
  const latestMembership = memberships[0] || null

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/socios')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Edit3 className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar socio
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {socio.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">DNI</p>
              <p className="font-medium text-slate-900">{socio.dni}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Teléfono</p>
              <p className="font-medium text-slate-900">{socio.telefono}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium text-slate-900">{socio.email}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Estado actual</p>
            <div className="mt-2">
              <Badge variant={socio.estado === 'Activo' ? 'success' : socio.estado === 'Vencido' ? 'danger' : 'outline'}>
                {socio.estado || 'Sin estado'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Membresías
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="default" onClick={() => setMembershipOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear membresía
            </Button>
            {latestMembership && (
              <Button variant="outline" onClick={() => { setSelectedMembershipId(latestMembership.id); setRenewOpen(true) }}>
                <CalendarDays className="mr-2 h-4 w-4" />
                Renovar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha inicio</TableHead>
                <TableHead>Fecha fin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.length > 0 ? memberships.map((membership) => (
                <TableRow key={membership.id || `${membership.tipo}-${membership.fecha_inicio || membership.fechaInicio || ''}`}>
                  <TableCell>{membership.tipo || membership.tipo_membresia || membership.nombre || '-'}</TableCell>
                  <TableCell>{membership.fecha_inicio || membership.fechaInicio || membership.inicio || '-'}</TableCell>
                  <TableCell>{membership.fecha_fin || membership.fechaFin || membership.fin || '-'}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-slate-500">
                    Este socio aún no tiene membresías registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Clases inscritas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clase</TableHead>
                <TableHead>Horario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clases.length > 0 ? clases.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.clase?.nombre || item.nombre || 'Clase'}</TableCell>
                  <TableCell>{item.clase?.horario || item.horario || '-'}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-sm text-slate-500">
                    Este socio no tiene clases inscritas aún.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar socio</DialogTitle>
            <DialogDescription>Actualiza los datos del socio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Input id="edit-nombre" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dni">DNI</Label>
              <Input id="edit-dni" value={form.dni} onChange={(event) => setForm({ ...form, dni: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input id="edit-telefono" value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={membershipOpen} onOpenChange={setMembershipOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva membresía</DialogTitle>
            <DialogDescription>Elige el tipo de membresía para este socio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="tipo-membresia">Tipo</Label>
            <select id="tipo-membresia" value={membershipType} onChange={(event) => setMembershipType(event.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="Mensual">Mensual</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Anual">Anual</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMembershipOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateMembership} disabled={submitting}>{submitting ? 'Guardando...' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renovar membresía</DialogTitle>
            <DialogDescription>Elige el tipo para la renovación.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="tipo-renovacion">Tipo</Label>
            <select id="tipo-renovacion" value={renewType} onChange={(event) => setRenewType(event.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="Mensual">Mensual</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Anual">Anual</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewOpen(false)}>Cancelar</Button>
            <Button onClick={handleRenew} disabled={submitting}>{submitting ? 'Renovando...' : 'Renovar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar socio</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>{submitting ? 'Eliminando...' : 'Eliminar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
