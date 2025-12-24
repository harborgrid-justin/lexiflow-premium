import { cn } from '../../../utils/cn';

export const defaultHighlightClass = "bg-yellow-200 text-slate-900 font-bold dark:bg-yellow-900/50 dark:text-yellow-100";
export const highlightContainerClass = "rounded-sm px-0.5";

export const getHighlightClass = (customClass?: string) => cn(highlightContainerClass, customClass || defaultHighlightClass);
