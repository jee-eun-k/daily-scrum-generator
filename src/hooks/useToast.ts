import { useState, useCallback, useRef } from 'react'

export interface Toast {
  id: number
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error'
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdCounter = useRef(0)

  const showToast = useCallback((title: string, description?: string, variant: Toast['variant'] = 'default') => {
    const id = toastIdCounter.current++
    const newToast: Toast = { id, title, description, variant }
    setToasts((prev) => [...prev, newToast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  return { toasts, showToast }
}