export const spacingClasses = {
  none: "",
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

// Note: These classes use direct colors for semantic UI variants
// TODO: Migrate to CSS variables when Box supports dynamic theming
export const bgClasses = {
  primary: "text-white", // Use with style={{ backgroundColor: 'var(--color-primary)' }}
  secondary: "bg-slate-100 text-slate-900",
  muted: "bg-slate-50 text-slate-700",
  accent: "bg-purple-600 text-white",
  danger: "text-white", // Use with style={{ backgroundColor: 'var(--color-error)' }}
  success: "text-white", // Use with style={{ backgroundColor: 'var(--color-success)' }}
  warning: "bg-yellow-600 text-white",
};

export const roundedClasses = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export const shadowClasses = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

export const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

export const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export const gapClasses = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};
