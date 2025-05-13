
import React from "react";
import {
  Toast,
  ToastActionElement,
  ToastProps
} from "@/components/ui/toast";

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

// Create a standalone toast API without useToast hook
const toastFunctions = {
  success: (message: string) => {
    // We can't directly use the hook here, but we can dispatch a custom event
    // that the Toaster component will listen for
    const event = new CustomEvent("toast", {
      detail: {
        title: "Success",
        description: message,
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      }
    });
    document.dispatchEvent(event);
  },
  error: (message: string) => {
    const event = new CustomEvent("toast", {
      detail: {
        title: "Error",
        description: message,
        variant: "destructive",
      }
    });
    document.dispatchEvent(event);
  },
  warning: (message: string) => {
    const event = new CustomEvent("toast", {
      detail: {
        title: "Warning",
        description: message,
        variant: "default",
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      }
    });
    document.dispatchEvent(event);
  },
  info: (message: string) => {
    const event = new CustomEvent("toast", {
      detail: {
        title: "Info",
        description: message,
        variant: "default",
        className: "bg-blue-50 border-blue-200 text-blue-800",
      }
    });
    document.dispatchEvent(event);
  },
  default: (message: string) => {
    const event = new CustomEvent("toast", {
      detail: {
        description: message,
      }
    });
    document.dispatchEvent(event);
  },
};

export const toast = toastFunctions;

// Define a type for the toast event
export interface ToastEvent {
  detail: ToastProps;
}
