
import { toast as toastFn } from "sonner";

export const toast = toastFn;

export const useToast = () => {
  return {
    toast: toastFn
  };
};
