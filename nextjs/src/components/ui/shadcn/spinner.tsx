"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Spinner variants configuration
 * Supports different sizes for various use cases
 */
const spinnerVariants = cva("animate-spin text-slate-500 dark:text-slate-400", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Optional label for accessibility and display
   */
  label?: string;
  /**
   * Whether to show the label text
   */
  showLabel?: boolean;
}

/**
 * Spinner - Animated loading indicator
 * Accessible loading spinner with size variants and optional label
 *
 * @example
 * ```tsx
 * // Basic spinner
 * <Spinner />
 *
 * // With label
 * <Spinner label="Loading..." showLabel />
 *
 * // Different sizes
 * <Spinner size="xs" />
 * <Spinner size="sm" />
 * <Spinner size="md" />
 * <Spinner size="lg" />
 * <Spinner size="xl" />
 *
 * // Inline with text
 * <button disabled>
 *   <Spinner size="sm" className="mr-2" />
 *   Loading...
 * </button>
 *
 * // Centered in container
 * <div className="flex items-center justify-center p-8">
 *   <Spinner size="lg" label="Loading cases..." showLabel />
 * </div>
 *
 * // Custom color
 * <Spinner className="text-blue-600" />
 * ```
 */
const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, label = "Loading", showLabel = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn(
          "inline-flex items-center gap-2",
          showLabel && "flex-col",
          className
        )}
        {...props}
      >
        <Loader2 className={cn(spinnerVariants({ size }))} />
        {showLabel && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {label}
          </span>
        )}
        {!showLabel && <span className="sr-only">{label}</span>}
      </div>
    );
  }
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
