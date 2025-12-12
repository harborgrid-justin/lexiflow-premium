
import React from 'react';
import { Download, Eye } from 'lucide-react';
import { FileIcon } from './Primitives';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

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

export const FileAttachment: React.FC<FileAttachmentProps> = ({ 
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
            onClick={(e) => { e.stopPropagation(); onPreview(); }} 
            className={cn("p-1.5 rounded", theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.primary.text}`)}
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onDownload ? onDownload() : null; }} 
          className={cn("p-1.5 rounded", theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.primary.text}`)}
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
