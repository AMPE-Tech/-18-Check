import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning'

interface ToastMessage {
  id: string
  type: ToastType
  message: string
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
}

const colors = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-danger/30 bg-danger/10 text-danger',
  warning: 'border-warning/30 bg-warning/10 text-warning',
}

let addToastFn: ((type: ToastType, message: string) => void) | null = null

export function toast(type: ToastType, message: string) {
  addToastFn?.(type, message)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    addToastFn = (type, message) => {
      const id = Date.now().toString()
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    }
    return () => { addToastFn = null }
  }, [])

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm" aria-live="polite">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg animate-[slideInRight_300ms_ease-out] ${colors[t.type]}`}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="shrink-0 hover:opacity-70 transition-opacity" aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
