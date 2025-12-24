import { cn } from '@/utils/cn';

export const labelContainerStyles = "flex justify-between text-sm mb-1";
export const valueStyles = "font-bold";
export const trackStyles = "w-full rounded-full h-2";
export const fillStyles = "h-2 rounded-full";

export const getFillStyle = (width: number) => ({ width: `${Math.min(100, Math.max(0, width))}%` });
