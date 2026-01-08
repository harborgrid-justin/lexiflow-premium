import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Textarea size variant
   * @default "md"
   */
  textareaSize?: "sm" | "md" | "lg";
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Full width
   */
  fullWidth?: boolean;
  /**
   * Auto-resize to content
   */
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      textareaSize = "md",
      error = false,
      fullWidth = false,
      autoResize = false,
      disabled,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    const sizeClasses = {
      sm: "min-h-[60px] px-2.5 py-1.5 text-xs",
      md: "min-h-[80px] px-3 py-2 text-sm",
      lg: "min-h-[100px] px-4 py-3 text-base",
    };

    // Auto-resize functionality
    const handleResize = React.useCallback(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [autoResize]);

    // Handle onChange with auto-resize
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleResize();
        onChange?.(e);
      },
      [handleResize, onChange]
    );

    // Initial resize on mount
    React.useEffect(() => {
      handleResize();
    }, [handleResize]);

    // Combine refs
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <textarea
        className={cn(
          // Base styles
          "flex w-full rounded-md border border-input bg-background ring-offset-background",
          "placeholder:text-muted-foreground",
          "transition-colors",
          "resize-y",
          // Size variants
          sizeClasses[textareaSize],
          // Focus state
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Disabled state
          disabled &&
            "cursor-not-allowed opacity-50 bg-muted text-muted-foreground resize-none",
          // Error state
          error &&
            !disabled &&
            "border-destructive focus-visible:ring-destructive",
          // Auto-resize
          autoResize && "resize-none overflow-hidden",
          // Full width
          fullWidth && "w-full",
          className
        )}
        ref={setRefs}
        disabled={disabled}
        onChange={handleChange}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
