
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"
import {
  useToast as useToastPrimitive,
} from "@/components/ui/use-toast"
import { useEffect, useState } from "react"

// Enhanced toast state interface
export interface ToastState extends Omit<ToastProps, "children"> {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Custom hook for toast management
export const useToast = () => {
  const { toast: originalToast, ...rest } = useToastPrimitive()
  const [toasts, setToasts] = useState<ToastState[]>([])

  // Enhanced toast function with better error handling
  const toast = (props: ToastProps) => {
    console.log("Toast triggered:", props)
    
    // If this is an error, log it to help with debugging
    if (props.variant === 'destructive') {
      console.error("Toast error:", props.description || props.title)
    }
    
    return originalToast(props)
  }

  return {
    toast,
    ...rest,
  }
}

// Standalone toast function for use outside of React components
export const toast = (props: ToastProps) => {
  console.log("Standalone toast triggered:", props)
  
  // If this is an error, log it to help with debugging
  if (props.variant === 'destructive') {
    console.error("Toast error:", props.description || props.title)
  }

  // Find the toast container and dispatch a custom event
  const toastContainerEvent = new CustomEvent('toast', {
    detail: props,
  });
  
  document.dispatchEvent(toastContainerEvent);
}
