import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Users } from 'lucide-react'
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

export default function Socios() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [socios, setSocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ nombre: '', dni: '', telefono: '', email: '' })

  const getSocioIdentifier = (socio) => socio?.id ?? socio?.socio_id ?? socio?.socioId ?? socio?.id_socio ?? socio?.socioid

  const getEstadoVariant = (estado) => {
    const normalized = `${estado || ''}`.trim().toLowerCase()
    if (normalized === 'inactivo' || normalized === 'inactiva' || normalized.includes('inactivo') || normalized.includes('inact') || normalized === 'inactive' || normalized.includes('inactive')) return 'danger'
    if (normalized === 'vencido' || normalized.includes('venc')) return 'danger'
    if (normalized === 'activo' || normalized.includes('activo')) return 'success'
    return 'outline'
  }

  const loadSocios = async () => {
    setLoading(true)
    try {
      const response = await api.get('/socios')
      const payload = response?.data
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.socios)
          ? payload.socios
          : Array.isArray(payload?.data)
            ? payload.data
            : []
      setSocios(list)
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudieron cargar los socios'
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSocios()
  }, [])

  const filteredSocios = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return socios

    return socios.filter((socio) => {
      const hayNombre = `${socio.nombre || ''}`.toLowerCase().includes(query)
      const hayDni = `${socio.dni || ''}`.toLowerCase().includes(query)
      return hayNombre || hayDni
    })
  }, [search, socios])

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      const response = await api.post('/socios', form)
      addToast(response?.data?.mensaje || 'Socio creado con éxito', 'success')
      setOpen(false)
      setForm({ nombre: '', dni: '', telefono: '', email: '' })
      await loadSocios()
    } catch (error) {
      const message = error?.response?.data?.mensaje || 'No se pudo crear el socio'
      addToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Gestión</p>
          <h1 className="text-2xl font-semibold text-slate-900">Socios</h1>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo socio
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Listado de socios
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">Busca por nombre o DNI y abre el perfil para ver membresías y clases.</p>
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o DNI" className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                : filteredSocios.length > 0
                  ? filteredSocios.map((socio) => {
                      const socioId = getSocioIdentifier(socio)
                      return (
                        <TableRow key={socioId ?? `${socio.nombre}-${socio.dni}`} className="cursor-pointer" onClick={() => {
                          if (socioId != null) {
                            navigate(`/socios/${socioId}`)
                          } else {
                            addToast('No se encontró el identificador del socio', 'error')
                          }
                        }}>
                          <TableCell className="font-medium text-slate-900">{socio.nombre}</TableCell>
                        <TableCell>{socio.dni}</TableCell>
                        <TableCell>{socio.telefono}</TableCell>
                        <TableCell>{socio.email}</TableCell>
                        <TableCell>
                          <Badge variant={getEstadoVariant(socio.estado)}>
                            {socio.estado || 'Sin estado'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      )
                    })
                  : (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                          No se encontraron socios con ese filtro.
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
            <DialogTitle>Crear nuevo socio</DialogTitle>
            <DialogDescription>Completa los datos básicos del nuevo socio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} placeholder="Nombre completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" value={form.dni} onChange={(event) => setForm({ ...form, dni: event.target.value })} placeholder="12345678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} placeholder="999999999" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="socio@fitgo.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
