
import React, { useEffect } from "react";
import { useToast, ToastEvent } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toast, toasts } = useToast();
  
  // Listen for custom toast events
  useEffect(() => {
    const handleToast = (event: Event) => {
      const toastEvent = event as CustomEvent<ToastEvent["detail"]>;
      toast(toastEvent.detail);
    };
    
    // Add event listener
    document.addEventListener("toast", handleToast as EventListener);
    
    // Cleanup
    return () => {
      document.removeEventListener("toast", handleToast as EventListener);
    };
  }, [toast]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
