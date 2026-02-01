import { toast as sonnerToast } from "sonner";
import { ReactNode } from "react";

type ToastProps = {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive";
  action?: ReactNode;
  duration?: number;
};

function toast({ title, description, variant, action, duration }: ToastProps) {
  const options = {
    description,
    duration,
    // Note: 'action' from shadcn is a ReactNode (Component), while sonner expects { label, onClick }.
    // Complex actions might not render perfectly in Sonner without custom component.
    // For now, we rely on Sonner's default styling.
    // If action is needed, we might need to use sonner's 'action' prop with a label and onClick if we can extract it,
    // or pass a custom component to sonnerToast.
  };

  if (variant === "destructive") {
    return sonnerToast.error(title, options);
  }
  
  return sonnerToast(title, options);
}

function useToast() {
  return {
    toast,
    dismiss: (id?: string) => sonnerToast.dismiss(id),
    toasts: [] // Mock for compatibility if needed
  };
}

export { useToast, toast };
