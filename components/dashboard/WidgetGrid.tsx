import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Maximize2, Minimize2, X } from 'lucide-react';

export interface Widget {
  id: string;
  title: string;
  content: React.ReactNode;
  gridArea?: string;
  defaultSize?: 'small' | 'medium' | 'large' | 'full';
  minHeight?: number;
  collapsible?: boolean;
  removable?: boolean;
}

export interface WidgetGridProps {
  widgets: Widget[];
  columns?: number;
  gap?: number;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetReorder?: (widgets: Widget[]) => void;
  className?: string;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgets: initialWidgets,
  columns = 12,
  gap = 6,
  onWidgetRemove,
  onWidgetReorder,
  className = '',
}) => {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [expandedWidgets, setExpandedWidgets] = useState<Set<string>>(new Set());
  const [collapsedWidgets, setCollapsedWidgets] = useState<Set<string>>(new Set());
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = useCallback(() => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newWidgets = [...widgets];
      const draggedItem = newWidgets[dragItem.current];
      newWidgets.splice(dragItem.current, 1);
      newWidgets.splice(dragOverItem.current, 0, draggedItem);
      setWidgets(newWidgets);
      onWidgetReorder?.(newWidgets);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  }, [widgets, onWidgetReorder]);

  const toggleExpand = (widgetId: string) => {
    setExpandedWidgets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  };

  const toggleCollapse = (widgetId: string) => {
    setCollapsedWidgets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  };

  const removeWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    onWidgetRemove?.(widgetId);
  };

  const getSizeClasses = (widget: Widget, isExpanded: boolean) => {
    if (isExpanded) {
      return 'col-span-full row-span-2';
    }

    switch (widget.defaultSize) {
      case 'small':
        return 'col-span-12 md:col-span-6 lg:col-span-3';
      case 'medium':
        return 'col-span-12 md:col-span-6 lg:col-span-6';
      case 'large':
        return 'col-span-12 md:col-span-12 lg:col-span-9';
      case 'full':
        return 'col-span-12';
      default:
        return 'col-span-12 md:col-span-6 lg:col-span-4';
    }
  };

  return (
    <div
      className={`grid grid-cols-12 gap-${gap} ${className}`}
      role="region"
      aria-label="Dashboard Widget Grid"
    >
      <AnimatePresence mode="popLayout">
        {widgets.map((widget, index) => {
          const isExpanded = expandedWidgets.has(widget.id);
          const isCollapsed = collapsedWidgets.has(widget.id);

          return (
            <motion.div
              key={widget.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`${getSizeClasses(widget, isExpanded)} ${
                isExpanded ? 'z-10' : ''
              }`}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden"
                style={{ minHeight: widget.minHeight || 200 }}
              >
                {/* Widget Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      aria-label="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {widget.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {widget.collapsible !== false && (
                      <button
                        onClick={() => toggleCollapse(widget.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        aria-label={isCollapsed ? 'Expand widget' : 'Collapse widget'}
                      >
                        {isCollapsed ? (
                          <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpand(widget.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      aria-label={isExpanded ? 'Restore widget size' : 'Maximize widget'}
                    >
                      {isExpanded ? (
                        <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    {widget.removable !== false && (
                      <button
                        onClick={() => removeWidget(widget.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        aria-label="Remove widget"
                      >
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Widget Content */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1 overflow-auto p-4"
                    >
                      {widget.content}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default WidgetGrid;
