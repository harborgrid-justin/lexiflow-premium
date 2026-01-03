import { cn } from "@/utils/cn";

interface ThemeStatus {
  success: { text: string; bg: string; border: string };
}

export const getSuccessStyles = (theme: unknown) => {
  const status = (theme as { status: ThemeStatus }).status;
  return cn(status.success.text, status.success.bg, status.success.border);
};
