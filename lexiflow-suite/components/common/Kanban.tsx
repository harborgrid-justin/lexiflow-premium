
import React from 'react';

export const KanbanBoard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex flex-col h-full overflow-hidden ${className}`}>
    <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
      <div className="flex h-full gap-4 min-w-max px-4">
        {children}
      </div>
    </div>
  </div>
);

interface KanbanColumnProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  onDrop?: () => void;
  isDragOver?: boolean;
  action?: React.ReactNode;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, count, children, onDrop, isDragOver, action }) => (
  <div
    className={`flex flex-col w-80 rounded-lg h-full border-2 transition-colors duration-200 bg-slate-50/50 ${isDragOver ? 'bg-blue-50 border-blue-300' : 'border-transparent'
      }`}
    onDragOver={(e) => { e.preventDefault(); }}
    onDrop={onDrop}
  >
    <div style={{ backgroundColor: 'var(--color-surfaceHover)' }} className="flex justify-between items-center p-3 mb-2 rounded-t-lg">
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-700 text-sm">{title}</span>
        {count !== undefined && (
          <span style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)', borderColor: 'var(--color-border)' }} className="px-2 py-0.5 rounded-full text-xs font-bold border">
            {count}
          </span>
        )}
      </div>
    </div>
    <div className="flex-1 space-y-3 overflow-y-auto px-2 pb-2">
      {children}
    </div>
    {action && <div className="p-2 pt-0">{action}</div>}
  </div>
);

interface KanbanCardProps {
  children: React.ReactNode;
  onDragStart?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  className?: string;
  onClick?: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ children, onDragStart, isDragging, className = '', onClick }) => (
  <div
    draggable={!!onDragStart}
    onDragStart={onDragStart}
    onClick={onClick}
    className={`bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-pointer transition-all duration-200 group hover:shadow-md hover:border-blue-300 ${isDragging ? 'opacity-50 ring-2 ring-blue-400 rotate-2 scale-95' : ''
      } ${className}`}
  >
    {children}
  </div>
);
