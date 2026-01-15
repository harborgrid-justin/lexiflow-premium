
import { Download, Eye } from 'lucide-react';
import React from 'react';
import { FileIcon } from './Primitives.tsx';

interface FileAttachmentProps {
  name: string;
  size?: string;
  type?: string;
  date?: string;
  onDownload?: () => void;
  onPreview?: () => void;
  className?: string;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ name, size, type = 'doc', date, onDownload, onPreview, className = '' }) => {
  return (
    <div className={`flex items-center p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-all group ${className}`}>
      <div style={{ backgroundColor: 'var(--color-surfaceHover)' }} className="p-2 rounded-lg mr-3 group-hover:bg-blue-50 transition-colors">
        <FileIcon type={type} className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-slate-900 truncate" title={name}>{name}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
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
          <button onClick={(e) => { e.stopPropagation(); onPreview(); }} style={{ color: 'var(--color-textMuted)' }} className="p-1.5 hover:text-blue-600 hover:bg-slate-100 rounded">
            <Eye className="h-4 w-4" />
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDownload ? onDownload() : null; }} style={{ color: 'var(--color-textMuted)' }} className="p-1.5 hover:text-blue-600 hover:bg-slate-100 rounded">
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
