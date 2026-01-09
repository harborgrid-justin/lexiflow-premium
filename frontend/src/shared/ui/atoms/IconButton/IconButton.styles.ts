import { cn } from '@/shared/lib/cn';

export const variantClasses = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-slate-600 hover:bg-slate-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
  warning: "bg-amber-600 hover:bg-amber-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
};

export const sizeClasses = {
  sm: { button: "p-1.5", icon: "h-3.5 w-3.5" },
  md: { button: "p-2", icon: "h-5 w-5" },
  lg: { button: "p-3", icon: "h-6 w-6" }
};

export const getButtonClasses = (
  variant: keyof typeof variantClasses,
  size: keyof typeof sizeClasses,
  rounded: boolean,
  className?: string
) => cn(
  "inline-flex items-center justify-center transition-colors",
  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  variantClasses[variant],
  sizeClasses[size].button,
  rounded ? "rounded-full" : "rounded-md",
  className
);

export const getIconClasses = (size: keyof typeof sizeClasses, disabled?: boolean) => 
  cn(sizeClasses[size].icon, disabled ? "opacity-50" : "fill-current");
