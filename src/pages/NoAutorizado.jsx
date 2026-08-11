import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { useNavigate } from 'react-router-dom'

export default function NoAutorizado() {
  const navigate = useNavigate()

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg border-amber-200 bg-amber-50/70">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">No tienes permisos</h1>
          <p className="mt-2 text-sm text-slate-600">Esta sección solo está disponible para usuarios con el rol requerido.</p>
          <Button className="mt-6" onClick={() => navigate('/socios')}>
            Volver al panel
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
