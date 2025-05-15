
import { toast as sonnerToast } from "sonner";
import { ReactNode } from "react";

export type ToastProps = {
  title?: string;
  description?: ReactNode;
  variant?: "default" | "destructive" | "success";
};

export function toast(props: ToastProps) {
  const { title, description, variant = "default" } = props;
  
  switch (variant) {
    case "destructive":
      return sonnerToast.error(title, {
        description,
      });
    case "success":
      return sonnerToast.success(title, {
        description,
      });
    default:
      return sonnerToast(title, {
        description,
      });
  }
}

export const useToast = () => {
  return {
    toast,
  };
};
