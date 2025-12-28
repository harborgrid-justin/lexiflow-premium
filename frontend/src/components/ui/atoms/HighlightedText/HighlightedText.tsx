/**
 * @module components/common/HighlightedText
 * @category Common
 * @description Text with query highlighting.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { memo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Utils & Constants
import { getHighlightClass, defaultHighlightClass } from './HighlightedText.styles';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
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
  highlightClassName = defaultHighlightClass 
}) => {
  if (!query) return <span className={className}>{text}</span>;

  // Escape special regex chars
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className={getHighlightClass(highlightClassName)}>
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
