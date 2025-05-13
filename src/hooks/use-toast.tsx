
// This file contains the toast hook implementation
import {
  Toast,
  ToastActionElement,
  ToastProps
} from "@/components/ui/toast";

import {
  useToast as useToastShadcn,
} from "@/components/ui/use-toast";

export const useToast = useToastShadcn;

export interface ToastOptions extends Omit<ToastProps, "variant"> {
  action?: ToastActionElement;
}

// Create a more user-friendly toast API
export const toast = {
  success: (message: string) => {
    useToastShadcn().toast({
      title: "Success",
      description: message,
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  },
  error: (message: string) => {
    useToastShadcn().toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
  warning: (message: string) => {
    useToastShadcn().toast({
      title: "Warning",
      description: message,
      variant: "default",
      className: "bg-yellow-50 border-yellow-200 text-yellow-800",
    });
  },
  info: (message: string) => {
    useToastShadcn().toast({
      title: "Info",
      description: message,
      variant: "default",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
  },
  default: (message: string) => {
    useToastShadcn().toast({
      description: message,
    });
  },
};
