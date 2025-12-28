import { tokens } from '@/components/theme/tokens';
import { cn } from '@/utils/cn';

type ThemeColors = typeof tokens.colors.light;

export const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-md gap-2 border shadow-sm";

export const getVariants = (theme: ThemeColors) => ({
  primary: cn(theme.action.primary.bg, theme.action.primary.text, theme.action.primary.hover, theme.action.primary.border, theme.border.focused),
  secondary: cn(theme.action.secondary.bg, theme.action.secondary.text, theme.action.secondary.hover, theme.action.secondary.border),
  outline: cn("bg-transparent border", theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`),
  ghost: cn(theme.action.ghost.bg, theme.action.ghost.text, theme.action.ghost.hover, "border-transparent shadow-none"),
  danger: cn(theme.action.danger.bg, theme.action.danger.text, theme.action.danger.hover, theme.action.danger.border, theme.border.error),
  link: "text-blue-600 hover:underline bg-transparent border-none shadow-none p-0 h-auto"
});

export const sizes = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  icon: "p-2"
};
