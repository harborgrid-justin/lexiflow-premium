import { cn } from '@/shared/lib/cn';

export const containerStyles = "relative overflow-hidden bg-slate-100 dark:bg-slate-800";

export const blurPlaceholderStyles = "absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-300";

export const skeletonContainerStyles = "absolute inset-0 animate-pulse";
export const skeletonInnerStyles = "w-full h-full";

export const imageStyles = (isLoaded: boolean) => cn(
  "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
  isLoaded ? "opacity-100" : "opacity-0"
);

export const errorContainerStyles = "absolute inset-0 flex flex-col items-center justify-center gap-2 p-4";
export const errorIconStyles = "h-8 w-8";
export const errorTextStyles = "text-sm text-center";

export const retryButtonStyles = "flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors border hover:bg-slate-100 dark:hover:bg-slate-700";

export const idleContainerStyles = "absolute inset-0 flex items-center justify-center";
