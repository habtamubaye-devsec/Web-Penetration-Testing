
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useEffect, useState } from "react"

export function Toaster() {
  const { toasts } = useToast()
  const [visibleToasts, setVisibleToasts] = useState<typeof toasts>(toasts)
  
  useEffect(() => {
    setVisibleToasts(toasts)
    
    // Set up auto-dismiss for each toast
    toasts.forEach(toast => {
      if (!toast.id) return
      
      const timer = setTimeout(() => {
        setVisibleToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 3000) // 3 seconds
      
      return () => {
        clearTimeout(timer)
      }
    })
  }, [toasts])

  return (
    <ToastProvider>
      {visibleToasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="animate-fade-in">
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
