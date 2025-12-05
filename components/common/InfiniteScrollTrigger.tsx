
import React, { useRef, useEffect } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  className?: string;
}

export const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({ 
  onLoadMore, 
  hasMore, 
  isLoading,
  className 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const entry = useIntersectionObserver(ref, { 
      threshold: 0.1,
      rootMargin: '200px' // Pre-fetch before user hits absolute bottom
  });
  const { theme } = useTheme();

  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [entry?.isIntersecting, hasMore, isLoading, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div 
        ref={ref} 
        className={cn("w-full py-4 flex justify-center items-center min-h-[50px]", className)}
    >
        {isLoading && (
            <div className={cn("flex items-center text-xs font-medium animate-pulse", theme.text.tertiary)}>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading more records...
            </div>
        )}
    </div>
  );
};
