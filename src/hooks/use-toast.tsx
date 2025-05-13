
// This file contains the toast hook implementation
import { useToast as useToastShadcn } from "@/components/ui/use-toast"
import { toast as toastShadcn } from "@/components/ui/use-toast"

export const useToast = useToastShadcn;

interface ToastAPI {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  default: (message: string) => void;
}

// Create a more user-friendly toast API
export const toast: ToastAPI = {
  success: (message) => {
    toastShadcn({
      title: "Success",
      description: message,
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  },
  error: (message) => {
    toastShadcn({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
  warning: (message) => {
    toastShadcn({
      title: "Warning",
      description: message,
      variant: "default",
      className: "bg-yellow-50 border-yellow-200 text-yellow-800",
    });
  },
  info: (message) => {
    toastShadcn({
      title: "Info",
      description: message,
      variant: "default",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
  },
  default: (message) => {
    toastShadcn({
      description: message,
    });
  },
};
