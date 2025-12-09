
import React, { memo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = memo(({ 
  text, 
  query, 
  className = "", 
  highlightClassName = "bg-yellow-200 text-slate-900 font-bold dark:bg-yellow-900/50 dark:text-yellow-100" 
}) => {
  if (!query) return <span className={className}>{text}</span>;

  // Escape special regex chars
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className={cn("rounded-sm px-0.5", highlightClassName)}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
});

HighlightedText.displayName = 'HighlightedText';
