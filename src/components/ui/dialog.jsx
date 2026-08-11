import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const DialogContext = React.createContext(null)

const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">{children}</div>
      </div>
    </DialogContext.Provider>
  )
}

const DialogContent = ({ className, children, ...props }) => {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <div />
        <button type="button" onClick={() => onOpenChange?.(false)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  )
}

const DialogHeader = ({ className, ...props }) => <div className={cn('space-y-1.5', className)} {...props} />
const DialogTitle = ({ className, ...props }) => <h2 className={cn('text-lg font-semibold text-slate-900', className)} {...props} />
const DialogDescription = ({ className, ...props }) => <p className={cn('text-sm text-slate-500', className)} {...props} />
const DialogFooter = ({ className, ...props }) => <div className={cn('flex justify-end gap-2 pt-2', className)} {...props} />

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
