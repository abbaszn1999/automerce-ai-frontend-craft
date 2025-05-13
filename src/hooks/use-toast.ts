
import { useToast as useShadcnToast } from "@/components/ui/use-toast";

export const useToast = () => {
  return useShadcnToast();
};

export const toast = {
  success: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Success",
      description: message,
      variant: "default",
    });
  },
  error: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
  warning: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Warning",
      description: message,
      variant: "default",
      className: "bg-amber-500",
    });
  },
  info: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Info",
      description: message,
      variant: "default",
    });
  },
};
