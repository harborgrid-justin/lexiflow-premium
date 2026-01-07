import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input size variant
   * @default "md"
   */
  inputSize?: "sm" | "md" | "lg";
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Full width
   */
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      inputSize = "md",
      error = false,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-8 px-2.5 py-1.5 text-xs",
      md: "h-10 px-3 py-2 text-sm",
      lg: "h-12 px-4 py-3 text-base",
    };

    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex rounded-md border border-input bg-background ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "transition-colors",
          // Size variants
          sizeClasses[inputSize],
          // Focus state
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Disabled state
          disabled &&
            "cursor-not-allowed opacity-50 bg-muted text-muted-foreground",
          // Error state
          error &&
            !disabled &&
            "border-destructive focus-visible:ring-destructive",
          // Full width
          fullWidth && "w-full",
          className
        )}
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
