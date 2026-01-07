/**
 * Navigation utilities
 */

export function navigate(to: string): void {
  if (typeof window === "undefined") return;
  window.location.href = to;
}

export function replace(to: string): void {
  if (typeof window === "undefined") return;
  window.location.replace(to);
}

export function back(): void {
  if (typeof window === "undefined") return;
  window.history.back();
}

export function forward(): void {
  if (typeof window === "undefined") return;
  window.history.forward();
}

export function getCurrentPath(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname;
}

export function getQueryParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}
