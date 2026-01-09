import { cn } from '@/shared/lib/cn';

export const iconColors = {
  image: "text-purple-600",
  video: "text-rose-600",
  audio: "text-pink-600",
  evidence: "text-amber-600",
  physical: "text-slate-600",
  default: "text-blue-600"
};

export const getIconClass = (colorClass: string, className?: string) => cn(colorClass, className);
