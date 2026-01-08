"use client";

/**
 * use-toast - Toast management hook for Sonner integration
 * Provides programmatic access to toast notifications
 *
 * This is a simple re-export wrapper around Sonner's toast function
 * for consistency with shadcn/ui patterns
 *
 * @example
 * ```tsx
 * import { useToast } from "@/hooks/use-toast"
 *
 * function MyComponent() {
 *   const { toast } = useToast()
 *
 *   const handleClick = () => {
 *     toast({
 *       title: "Success!",
 *       description: "Your changes have been saved.",
 *     })
 *   }
 *
 *   return <button onClick={handleClick}>Save</button>
 * }
 * ```
 *
 * For direct usage with Sonner API, import from sonner:
 * ```tsx
 * import { toast } from "sonner"
 *
 * toast.success("Case created successfully")
 * toast.error("Failed to save document")
 * toast.promise(saveData(), {
 *   loading: 'Saving...',
 *   success: 'Saved!',
 *   error: 'Failed to save',
 * })
 * ```
 */

import { toast as sonnerToast } from "sonner";

type ToastActionElement = React.ReactElement;

interface ToastProps {
  id?: string | number;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  duration?: number;
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

/**
 * Toast function with shadcn/ui-style API
 * Wraps Sonner's toast to match shadcn patterns
 */
function toast({ title, description, action, duration, ...props }: ToastProps) {
  // Build toast message
  let message = title || "";

  if (description) {
    message = (
      <div className="grid gap-1">
        {title && <div className="font-semibold">{title}</div>}
        <div className="text-sm opacity-90">{description}</div>
      </div>
    ) as any;
  }

  // Show toast with Sonner
  return sonnerToast(message, {
    duration,
    action: action as any,
    ...props,
  });
}

/**
 * useToast hook
 * Returns toast function for imperative toast triggering
 */
export function useToast() {
  return {
    toast,
    // Re-export Sonner methods for convenience
    success: sonnerToast.success,
    error: sonnerToast.error,
    info: sonnerToast.info,
    warning: sonnerToast.warning,
    promise: sonnerToast.promise,
    custom: sonnerToast.custom,
    dismiss: sonnerToast.dismiss,
    message: sonnerToast.message,
  };
}

// Type exports
export type { ToastProps, ToastActionElement };
