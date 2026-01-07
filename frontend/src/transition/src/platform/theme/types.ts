/**
 * Theme types
 */

export type ThemeMode = "light" | "dark" | "system";

export interface Theme {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
  };
}
