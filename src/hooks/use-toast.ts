
import { toast as sonnerToast } from "sonner";
import { ReactNode } from "react";

/**
 * Custom toast hook for consistent toast notifications throughout the app
 */

export type ToastProps = {
  title?: string;
  description?: ReactNode;
  variant?: "default" | "destructive" | "success";
};

export function toast(props: ToastProps) {
  const { variant = "default" } = props;
  
  switch (variant) {
    case "destructive":
      return sonnerToast.error(props.title, {
        description: props.description,
      });
    case "success":
      return sonnerToast.success(props.title, {
        description: props.description,
      });
    default:
      return sonnerToast(props.title, {
        description: props.description,
      });
  }
}

export const useToast = () => {
  return {
    toast,
  };
};
