export const baseStyles =
  "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-md gap-2 border shadow-sm";

export const getVariants = () => ({
  primary: "bg-primary text-white hover:bg-primary-dark border-primary",
  secondary: "bg-secondary text-white hover:opacity-90 border-secondary",
  outline: "bg-transparent border-border text-text hover:bg-surface",
  ghost:
    "bg-transparent text-text hover:bg-surface border-transparent shadow-none",
  danger: "bg-error text-white hover:opacity-90 border-error",
  link: "text-secondary hover:underline bg-transparent border-none shadow-none p-0 h-auto",
});

export const sizes = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  icon: "p-2",
};
