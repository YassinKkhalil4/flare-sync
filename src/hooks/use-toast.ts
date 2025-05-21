
import { toast as sonnerToast } from "sonner";
import { ReactNode } from "react";

export type ToastProps = {
  title?: string;
  description?: ReactNode;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  id?: string;
};

export function toast(props: ToastProps) {
  const { title, description, variant = "default", duration, id } = props;
  
  const options = {
    description,
    duration,
    id,
  };
  
  switch (variant) {
    case "destructive":
      return sonnerToast.error(title, options);
    case "success":
      return sonnerToast.success(title, options);
    default:
      return sonnerToast(title, options);
  }
}

export const useToast = () => {
  return {
    toast,
  };
};
