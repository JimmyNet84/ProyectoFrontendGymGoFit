import * as React from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

const ToastContext = React.createContext(null)

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([])

  const addToast = React.useCallback((message, type = 'default') => {
    const id = Date.now()
    setToasts((current) => [...current, { id, message, type }])
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={cn('flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg', toast.type === 'error' && 'border-red-200 bg-red-50')}> 
            {toast.type === 'error' ? <XCircle className="h-5 w-5 text-red-600" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            <p className="text-sm text-slate-700">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export { ToastProvider, useToast }
