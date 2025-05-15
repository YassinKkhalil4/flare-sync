
import { useToast as useToastHook } from "@/hooks/use-toast"
import { toast as toastFn } from "@/hooks/use-toast"
import { ToastProps } from "@/hooks/use-toast"

export type { ToastProps }
export const useToast = useToastHook
export const toast = toastFn
