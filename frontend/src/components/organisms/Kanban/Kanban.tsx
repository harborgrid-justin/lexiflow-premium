/**
 * @module components/common/Kanban
 * @category Common
 * @description Kanban board with drag-and-drop columns and cards.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================

export const KanbanBoard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={cn("flex flex-col h-full overflow-hidden", className)}>
    <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 snap-x snap-mandatory overscroll-contain">
      <div className="flex h-full gap-4 px-4 w-max">
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

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, count, children, onDrop, isDragOver, action }) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className={cn(
        "flex flex-col w-[85vw] md:w-80 rounded-lg h-full border-2 transition-colors duration-200 snap-center shrink-0",
        theme.surface.highlight,
        isDragOver ? cn(theme.primary.border, theme.primary.light) : "border-transparent"
      )}
      onDragOver={(e) => { e.preventDefault(); }}
      onDrop={onDrop}
    >
      <div className={cn("flex justify-between items-center p-3 mb-2 rounded-t-lg border-b", theme.border.default)}>
        <div className="flex items-center gap-2">
          <span className={cn("font-bold text-sm", theme.text.primary)}>{title}</span>
          {count !== undefined && (
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border", theme.surface.default, theme.border.default, theme.text.secondary)}>
              {count}
            </span>
          )}
        </div>
      </div>
      <div className={cn("flex-1 space-y-3 overflow-y-auto px-2 pb-2 custom-scrollbar")}>
        {children}
      </div>
      {action && <div className="p-2 pt-0">{action}</div>}
    </div>
  );
};

interface KanbanCardProps {
  children: React.ReactNode;
  onDragStart?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  className?: string;
  onClick?: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ children, onDragStart, isDragging, className = '', onClick }) => {
  const { theme } = useTheme();
  
  return (
    <div 
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg shadow-sm border cursor-pointer transition-all duration-200 group active:scale-95 touch-manipulation",
        theme.surface.default,
        theme.border.default,
        isDragging ? cn("opacity-50 ring-2 rotate-2 scale-95", theme.primary.border) : `hover:${theme.primary.border} hover:shadow-md`,
        className
      )}
    >
      {children}
    </div>
  );
};
