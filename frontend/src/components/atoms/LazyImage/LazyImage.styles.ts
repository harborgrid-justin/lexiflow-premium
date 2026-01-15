import { cn } from "@/shared/lib/cn";

// Use theme surface for container background
export const containerStyles = "relative overflow-hidden"; // Apply theme.surface.default via style prop

export const blurPlaceholderStyles =
  "absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-300";

export const skeletonContainerStyles = "absolute inset-0 animate-pulse";
export const skeletonInnerStyles = "w-full h-full";

export const imageStyles = (isLoaded: boolean) =>
  cn(
    "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
    isLoaded ? "opacity-100" : "opacity-0"
  );

export const errorContainerStyles =
  "absolute inset-0 flex flex-col items-center justify-center gap-2 p-4";
export const errorIconStyles = "h-8 w-8";
export const errorTextStyles = "text-sm text-center";

export const retryButtonStyles =
  "flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors border"; // Apply theme.surface.hover via style

export const idleContainerStyles =
  "absolute inset-0 flex items-center justify-center";
