import type { ThemeStateValue } from "@/contexts/theme/ThemeContext.types";
import { cn } from "@/utils/cn";

export const baseBadgeStyles =
  "inline-flex items-center justify-center px-2.5 h-5 rounded-full text-[10px] font-bold border ring-1 ring-inset ring-black/5 uppercase tracking-wide whitespace-nowrap";

interface ThemeStatus {
  success: { bg: string; text: string; border: string };
  warning: { bg: string; text: string; border: string };
  error: { bg: string; text: string; border: string };
  info: { bg: string; text: string; border: string };
  neutral: { bg: string; text: string; border: string };
}

export const getBadgeVariantStyles = (
  theme: ThemeStateValue["theme"],
  variant: string
) => {
  const status = (theme as unknown as { status: ThemeStatus }).status;
  switch (variant) {
    case "success":
      return cn(status.success.bg, status.success.text, status.success.border);
    case "warning":
      return cn(status.warning.bg, status.warning.text, status.warning.border);
    case "error":
    case "danger":
      return cn(status.error.bg, status.error.text, status.error.border);
    case "info":
      return cn(status.info.bg, status.info.text, status.info.border);
    case "purple":
      return "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/10 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    default:
      return cn(status.neutral.bg, status.neutral.text, status.neutral.border);
  }
};
