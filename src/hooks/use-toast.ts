
// This is a simple wrapper for the shadcn/ui toast component
import { toast as sonnerToast } from "sonner";
import { ToastProps } from "@/components/ui/toast";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export function useToast() {
  const toast = ({ title, description, variant, duration = 5000 }: ToastOptions) => {
    if (variant === "destructive") {
      sonnerToast.error(title, {
        description,
        duration,
      });
    } else {
      sonnerToast(title, {
        description,
        duration,
      });
    }
  };

  return {
    toast,
  };
}
