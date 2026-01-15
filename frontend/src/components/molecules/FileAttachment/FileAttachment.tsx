/**
 * @module components/common/FileAttachment
 * @category Common
 * @description File attachment card with preview and download.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Download, Eye } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/theme';

// Components
import { FileIcon } from '@/components/atoms/FileIcon';

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface FileAttachmentProps {
  name: string;
  size?: string;
  type?: string;
  date?: string;
  onDownload?: () => void;
  onPreview?: () => void;
  className?: string;
  variant?: 'card' | 'minimal'; // 'card' has border/bg, 'minimal' is transparent
}

/**
 * FileAttachment - React 18 optimized with React.memo
 */
export const FileAttachment = React.memo<FileAttachmentProps>(({
  name, size, type = 'doc', date, onDownload, onPreview, className = '', variant = 'card'
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "flex items-center p-3 rounded-lg transition-all group overflow-hidden",
      variant === 'card' ? cn(theme.surface.default, theme.border.default, "border hover:shadow-md") : "",
      className
    )}>
      <div className={cn("p-2 rounded-lg mr-3 shrink-0", theme.surface.highlight)}>
        <FileIcon type={type} className="h-6 w-6" />
      </div>

      <div className="flex-1 min-w-0 mr-2">
        <h4 className={cn("text-sm font-medium truncate", theme.text.primary)} title={name}>{name}</h4>
        <div className={cn("flex items-center gap-2 text-xs mt-0.5", theme.text.secondary)}>
          {size && <span>{size}</span>}
          {date && (
            <>
              <span>•</span>
              <span>{new Date(date).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onPreview && (
          <button
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onPreview(); }}
            className={cn("p-1.5 rounded", theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.primary.text}`)}
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={(e: React.MouseEvent) => { 
            e.stopPropagation(); 
            if (onDownload) {
              onDownload();
            }
          }}
          className={cn("p-1.5 rounded", theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.primary.text}`)}
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});