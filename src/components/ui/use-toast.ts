
// Re-export from the hooks location
import { useToast as importedUseToast, toast as importedToast } from "@/hooks/use-toast";

export const useToast = importedUseToast;
export const toast = importedToast;
