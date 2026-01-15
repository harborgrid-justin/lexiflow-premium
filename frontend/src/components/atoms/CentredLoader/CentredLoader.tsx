/**
 * @module components/common/layout/CentredLoader
 * @category Common Components - Loading States
 * @description Full-container centered loading spinner with optional message
 */
import { Loader2 } from 'lucide-react';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { containerStyles, spinnerStyles, messageStyles } from './CentredLoader.styles';

export interface CentredLoaderProps {
  className?: string;
  message?: string;
}

export function CentredLoader({ className, message }: CentredLoaderProps) {
  const { theme } = useTheme();
  
  return (
    <div className={cn(containerStyles, className)}>
      <Loader2 className={spinnerStyles(theme)}/>
      {message && <span className={messageStyles(theme)}>{message}</span>}
    </div>
  );
}
