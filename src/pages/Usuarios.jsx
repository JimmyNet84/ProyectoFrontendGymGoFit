import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Plus, Trash2, UserCog } from 'lucide-react'
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

export default function Usuarios() {
  const { addToast } = useToast()
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol_id: '' })

  const getRoleId = (rol) => rol?.id ?? rol?.rol_id ?? rol?.role_id
  const getRoleName = (rol) => rol?.nombre || rol?.name || 'Sin rol'
  const getDefaultRoleId = () => {
    const firstRole = roles.find((rol) => getRoleId(rol) != null)
    return firstRole ? String(getRoleId(firstRole)) : ''
  }
  const roleMap = useMemo(() => Object.fromEntries(roles.map((rol) => [String(getRoleId(rol)), getRoleName(rol)])), [roles])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usuariosResponse, rolesResponse] = await Promise.all([api.get('/usuarios'), api.get('/roles')])
      const usuariosPayload = usuariosResponse?.data
      const rolesPayload = rolesResponse?.data
      setUsuarios(Array.isArray(usuariosPayload) ? usuariosPayload : Array.isArray(usuariosPayload?.data) ? usuariosPayload.data : [])
      setRoles(Array.isArray(rolesPayload) ? rolesPayload : Array.isArray(rolesPayload?.data) ? rolesPayload.data : [])
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudieron cargar los usuarios'
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setForm({ nombre: '', email: '', password: '', rol_id: getDefaultRoleId() })
    setEditingId(null)
  }

  useEffect(() => {
    if (!form.rol_id && roles.length > 0) {
      setForm((current) => ({ ...current, rol_id: getDefaultRoleId() }))
    }
  }, [roles, form.rol_id])

  const openCreate = () => {
    resetForm()
    setOpen(true)
  }

  const openEdit = (usuario) => {
    setEditingId(usuario?.id ?? usuario?.usuario_id ?? null)
    setForm({
      nombre: usuario?.nombre || '',
      email: usuario?.email || '',
      password: '',
      rol_id: usuario?.rol_id ? String(usuario.rol_id) : ''
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const defaultRoleId = getDefaultRoleId()
      const selectedRoleId = form.rol_id || defaultRoleId
      const normalizedRoleId = Number(selectedRoleId)

      if (!normalizedRoleId) {
        addToast('Selecciona un rol válido para crear el usuario', 'error')
        return
      }

      const payload = { nombre: form.nombre, email: form.email, rol_id: normalizedRoleId }
      if (form.password) payload.password = form.password

      if (editingId) {
        const response = await api.put(`/usuarios/${editingId}`, payload)
        addToast(response?.data?.mensaje || 'Usuario actualizado', 'success')
      } else {
        if (!form.password) {
          addToast('La contraseña es obligatoria', 'error')
          return
        }
        const response = await api.post('/usuarios', { ...payload, password: form.password })
        addToast(response?.data?.mensaje || 'Usuario creado', 'success')
      }
      setOpen(false)
      resetForm()
      await loadData()
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo guardar el usuario'
      addToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este usuario?')) return
    try {
      const response = await api.delete(`/usuarios/${id}`)
      addToast(response?.data?.mensaje || 'Usuario eliminado', 'success')
      await loadData()
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo eliminar el usuario'
      addToast(message, 'error')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Administración</p>
          <h1 className="text-2xl font-semibold text-slate-900">Usuarios</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-blue-600" />
            Listado de usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      <TableCell><Skeleton className="ml-auto h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                : usuarios.length > 0
                  ? usuarios.map((usuario) => {
                      const id = usuario?.id ?? usuario?.usuario_id ?? usuario?.usuarioId
                      return (
                        <TableRow key={id ?? `${usuario.nombre}-${usuario.email}`}>
                          <TableCell className="font-medium text-slate-900">{usuario.nombre}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            <Badge variant={roleMap[usuario.rol_id] === 'Administrador' ? 'default' : roleMap[usuario.rol_id] === 'Personal' ? 'warning' : 'outline'}>
                              {roleMap[usuario.rol_id] || usuario.rol || 'Sin rol'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEdit(usuario)}>
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
                          No hay usuarios registrados.
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
            <DialogTitle>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
            <DialogDescription>Completa los datos del usuario del sistema.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario-nombre">Nombre</Label>
              <Input id="usuario-nombre" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usuario-email">Email</Label>
              <Input id="usuario-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usuario-password">Contraseña</Label>
              <Input id="usuario-password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={editingId ? 'Opcional al editar' : 'Requerida'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usuario-rol">Rol</Label>
              <select id="usuario-rol" value={form.rol_id} onChange={(event) => setForm({ ...form, rol_id: event.target.value })} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
                {roles.map((rol) => {
                  const roleId = getRoleId(rol)
                  return (
                    <option key={roleId ?? `${getRoleName(rol)}-${rol.descripcion}`} value={roleId ?? ''}>
                      {getRoleName(rol)}
                    </option>
                  )
                })}
              </select>
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
