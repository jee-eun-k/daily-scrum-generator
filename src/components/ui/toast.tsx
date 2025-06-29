import { Toast as ToastType } from '@/hooks/useToast'

type ToastProps = ToastType

const Toast = ({ title, description, variant = 'default' }: ToastProps) => {
  const variantClasses = {
    default: 'bg-background text-foreground border',
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
  }
  
  return (
    <div className={`rounded-md p-4 shadow-lg ${variantClasses[variant]}`}>
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="text-sm">{description}</div>}
    </div>
  )
}

interface ToasterProps {
  toasts: ToastType[]
}

export const Toaster = ({ toasts }: ToasterProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}