import { cn } from "@/shared/lib/cn";

interface Theme {
  text: { primary: string };
}

export const currencyStyles = (theme: unknown) =>
  cn("font-mono tracking-tight", (theme as Theme).text.primary);
