import { cn } from "@/shared/lib/cn";

export const containerStyles =
  "flex h-full w-full items-center justify-center p-8 flex-col gap-2";

interface Theme {
  primary: { text: string };
  text: { secondary: string };
}

export const spinnerStyles = (theme: unknown) =>
  cn("animate-spin h-8 w-8", (theme as Theme).primary.text);

export const messageStyles = (theme: unknown) =>
  cn("text-xs", (theme as Theme).text.secondary);
