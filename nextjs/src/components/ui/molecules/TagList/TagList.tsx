/**
 * @module components/common/primitives/TagList
 * @category Common Components - UI Primitives
 * @description Tag list display with limit and overflow indicator
 */

import React from 'react';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';

export interface TagListProps {
  tags: string[];
  limit?: number;
}

/**
 * TagList - React 18 optimized with React.memo
 * Prevents unnecessary re-renders when parent updates
 */
export const TagList = React.memo<TagListProps>(({ 
  tags, 
  limit = 3 
}) => {
  const { theme } = useTheme();
  
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.slice(0, limit).map(t => (
        <span 
          key={t} 
          className={cn(
            "px-2 py-0.5 rounded text-[10px] font-medium border", 
            theme.surface.highlight, 
            theme.text.secondary, 
            theme.border.default
          )}
        >
          {t}
        </span>
      ))}
      {tags.length > limit && (
        <span 
          className={cn(
            "px-2 py-0.5 rounded text-[10px] font-medium opacity-70", 
            theme.surface.highlight, 
            theme.text.secondary
          )}
        >
          +{tags.length - limit}
        </span>
      )}
    </div>
  );
});
TagList.displayName = 'TagList';
