
import React from "react";
import {
  Toast,
  ToastActionElement,
  ToastProps
} from "@/components/ui/toast";
import { toast as toastPrimitive } from "@radix-ui/react-toast";

// This defines the primary toast hook that the app will use
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback(
    (props: ToastProps) => {
      const id = props.id || String(Math.random());
      setToasts((toasts) => [...toasts, { ...props, id }]);
      return {
        id,
        dismiss: () => dismiss(id),
        update: (props: ToastProps) => {
          setToasts((toasts) =>
            toasts.map((toast) =>
              toast.id === id ? { ...toast, ...props } : toast
            )
          );
        },
      };
    },
    [dismiss]
  );

  return {
    toast,
    toasts,
    dismiss,
  };
}

// Create a more user-friendly toast API
export const toast = {
  success: (message: string) => {
    const { toast: toastFn } = useToast();
    toastFn({
      title: "Success",
      description: message,
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  },
  error: (message: string) => {
    const { toast: toastFn } = useToast();
    toastFn({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
  warning: (message: string) => {
    const { toast: toastFn } = useToast();
    toastFn({
      title: "Warning",
      description: message,
      variant: "default",
      className: "bg-yellow-50 border-yellow-200 text-yellow-800",
    });
  },
  info: (message: string) => {
    const { toast: toastFn } = useToast();
    toastFn({
      title: "Info",
      description: message,
      variant: "default",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
  },
  default: (message: string) => {
    const { toast: toastFn } = useToast();
    toastFn({
      description: message,
    });
  },
};
