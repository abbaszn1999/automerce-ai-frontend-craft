
// Re-export the toast hook and toast API from the hooks location
import { useToast, toast } from "@/hooks/use-toast";
import type { ToastProps } from "@/components/ui/toast";

// Re-export the types correctly
export { useToast, toast };
export type { ToastProps };
export type ToastEvent = {
  detail: ToastProps;
};
