/**
 * @component Checkbox
 * @description Enterprise-grade checkbox component built with Radix UI
 */

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const checkboxVariants = cva(
  "peer shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground transition-colors",
  {
    variants: {
      size: {
        sm: "h-3.5 w-3.5",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
      variant: {
        default: "",
        destructive:
          "border-destructive data-[state=checked]:bg-destructive data-[state=indeterminate]:bg-destructive",
        success:
          "border-green-600 data-[state=checked]:bg-green-600 data-[state=indeterminate]:bg-green-600",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Indeterminate state (for parent checkboxes)
   */
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      className,
      size,
      variant,
      error = false,
      indeterminate = false,
      checked,
      ...props
    },
    ref
  ) => {
    const iconSize = {
      sm: "h-2.5 w-2.5",
      md: "h-3 w-3",
      lg: "h-3.5 w-3.5",
    };

    const finalVariant = error ? "destructive" : variant;
    const finalChecked = indeterminate ? "indeterminate" : checked;

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(checkboxVariants({ size, variant: finalVariant }), className)}
        checked={finalChecked}
        aria-invalid={error ? "true" : undefined}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-current")}
        >
          {indeterminate ? (
            <Minus className={iconSize[size || "md"]} />
          ) : (
            <Check className={iconSize[size || "md"]} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox, checkboxVariants };
