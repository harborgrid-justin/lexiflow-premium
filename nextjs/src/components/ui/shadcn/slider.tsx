import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sliderVariants = cva(
  "relative flex w-full touch-none select-none items-center",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const sliderTrackVariants = cva(
  "relative w-full grow overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const sliderRangeVariants = cva("absolute h-full", {
  variants: {
    variant: {
      default: "bg-primary",
      destructive: "bg-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const sliderThumbVariants = cva(
  "block rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-primary",
        destructive: "border-destructive focus-visible:ring-destructive",
      },
      size: {
        sm: "h-3 w-3",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderVariants> {
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Show value labels
   */
  showValue?: boolean;
  /**
   * Value formatter function
   */
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      variant,
      size,
      error,
      showValue = false,
      formatValue = (value) => value.toString(),
      ...props
    },
    ref
  ) => {
    const value = props.value || props.defaultValue || [0];

    return (
      <div className="w-full">
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            sliderVariants({ variant: error ? "destructive" : variant, size }),
            className
          )}
          aria-invalid={error ? "true" : undefined}
          {...props}
        >
          <SliderPrimitive.Track className={cn(sliderTrackVariants({ size }))}>
            <SliderPrimitive.Range
              className={cn(
                sliderRangeVariants({
                  variant: error ? "destructive" : variant,
                })
              )}
            />
          </SliderPrimitive.Track>
          {value.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              className={cn(
                sliderThumbVariants({
                  variant: error ? "destructive" : variant,
                  size,
                })
              )}
              aria-label={`Thumb ${index + 1}`}
            />
          ))}
        </SliderPrimitive.Root>
        {showValue && (
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            {value.map((val, index) => (
              <span key={index}>{formatValue(val)}</span>
            ))}
          </div>
        )}
      </div>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider, sliderVariants };
