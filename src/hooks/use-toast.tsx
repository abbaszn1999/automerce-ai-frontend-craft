
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

// Create a standalone toast API that can be called without hooks
type ToastFunction = (props: ToastProps) => void;

// Helper function to create CustomEvent for a toast notification
const createToastEvent = (props: ToastProps) => {
  const event = new CustomEvent("toast", { detail: props });
  document.dispatchEvent(event);
};

// Individual toast variant methods
const success = (message: string) => {
  createToastEvent({
    title: "Success",
    description: message,
    variant: "default",
    className: "bg-green-50 border-green-200 text-green-800",
  });
};

const error = (message: string) => {
  createToastEvent({
    title: "Error",
    description: message,
    variant: "destructive",
  });
};

const warning = (message: string) => {
  createToastEvent({
    title: "Warning",
    description: message,
    variant: "default",
    className: "bg-yellow-50 border-yellow-200 text-yellow-800",
  });
};

const info = (message: string) => {
  createToastEvent({
    title: "Info",
    description: message,
    variant: "default",
    className: "bg-blue-50 border-blue-200 text-blue-800",
  });
};

const defaultToast = (message: string) => {
  createToastEvent({
    description: message,
  });
};

// The main toast function that handles both variants and direct props
export const toast: ToastFunction & {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  default: (message: string) => void;
} = Object.assign(
  // Main function that accepts ToastProps directly
  (props: ToastProps) => createToastEvent(props),
  {
    success,
    error,
    warning,
    info,
    default: defaultToast,
  }
);

// Define a type for the toast event
export interface ToastEvent {
  detail: ToastProps;
}
