import { cn } from '@/shared/lib/cn';

export const containerStyles = "flex items-center justify-center text-slate-500";
export const spinnerStyles = "animate-spin";
export const textStyles = "ml-2 text-sm";

export const getSpinnerClass = (className?: string) => cn(spinnerStyles, className);
