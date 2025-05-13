
import { useState, useEffect } from 'react';
import {
  ToastAction,
  type ToastActionElement,
  type Toast as ToastType
} from "@/components/ui/toast";

export type ToastProps = ToastType & {
  action?: ToastActionElement;
};

export type ToastHookResult = {
  toast: {
    (props: ToastProps): void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
  toasts: ToastProps[];
  dismissToast: (toastId?: string) => void;
};

export const useToast = (): ToastHookResult => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const dismissToast = (toastId?: string) => {
    setToasts((toasts) => {
      if (toastId) {
        return toasts.filter((toast) => toast.id !== toastId);
      }
      return [];
    });
  };

  const toast = (props: ToastProps) => {
    const id = props.id || String(Math.random() * 10000);
    const newToast = { ...props, id };
    
    setToasts((toasts) => [...toasts, newToast]);
    
    if (props.duration !== Infinity) {
      setTimeout(() => {
        dismissToast(id);
      }, props.duration || 5000);
    }
    
    return id;
  };

  toast.success = (message: string) => {
    return toast({ 
      title: "Success", 
      description: message, 
      variant: "default",
      className: "bg-green-100 border-green-500 text-green-900"
    });
  };
  
  toast.error = (message: string) => {
    return toast({ 
      title: "Error", 
      description: message, 
      variant: "destructive" 
    });
  };
  
  toast.warning = (message: string) => {
    return toast({ 
      title: "Warning", 
      description: message,
      variant: "default",
      className: "bg-amber-100 border-amber-500 text-amber-900"
    });
  };
  
  toast.info = (message: string) => {
    return toast({ 
      title: "Info", 
      description: message,
      variant: "default",
      className: "bg-blue-100 border-blue-500 text-blue-900"
    });
  };

  return { toast, toasts, dismissToast };
};

// Make toast accessible globally
const { toast } = useToast();
export { toast };
