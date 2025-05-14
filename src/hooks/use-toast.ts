
import * as React from "react"
import { toast as sonnerToast } from "sonner"

export type ToastProps = {
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

// Standalone toast function for use outside of React components
export const toast = ({ title, description, variant, action }: ToastProps) => {
  console.log("Toast triggered:", { title, description, variant })
  
  if (variant === 'destructive') {
    console.error("Toast error:", description || title)
    sonnerToast.error(title, {
      description: description as string,
      action
    })
  } else {
    sonnerToast(title, {
      description: description as string,
      action
    })
  }
}

// Hook for component use
export const useToast = () => {
  return { toast }
}
