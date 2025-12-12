import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, ChevronDown } from 'lucide-react';

interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'delayed';
  assignee?: string;
  dependencies?: string[];
  children?: GanttTask[];
}

interface GanttChartProps {
  tasks: GanttTask[];
  title?: string;
  description?: string;
  className?: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  title,
  description,
  className = ''
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  // Calculate date range
  const allDates = tasks.flatMap((task) => [task.start, task.end]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const totalDays = Math.ceil(
    (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusColor = (status?: GanttTask['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 dark:bg-green-600';
      case 'in-progress':
        return 'bg-blue-500 dark:bg-blue-600';
      case 'delayed':
        return 'bg-red-500 dark:bg-red-600';
      default:
        return 'bg-gray-400 dark:bg-gray-600';
    }
  };

  const getStatusLabel = (status?: GanttTask['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'delayed':
        return 'Delayed';
      default:
        return 'Pending';
    }
  };

  const calculatePosition = (task: GanttTask) => {
    const startDays = Math.ceil(
      (task.start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const duration = Math.ceil(
      (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const left = (startDays / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const renderTask = (task: GanttTask, level: number = 0) => {
    const isExpanded = expandedTasks.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const position = calculatePosition(task);

    return (
      <React.Fragment key={task.id}>
        <div
          className="flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          onMouseEnter={() => setHoveredTask(task.id)}
          onMouseLeave={() => setHoveredTask(null)}
        >
          {/* Task Name Column */}
          <div className="w-1/3 p-3 border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(task.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {task.name}
                </p>
                {task.assignee && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {task.assignee}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Column */}
          <div className="flex-1 p-3 relative">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: level * 0.1 }}
              className={`absolute top-1/2 -translate-y-1/2 h-8 rounded ${getStatusColor(
                task.status
              )} cursor-pointer overflow-hidden`}
              style={{
                left: position.left,
                width: position.width,
                transformOrigin: 'left'
              }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              role="progressbar"
              aria-valuenow={task.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${task.name}: ${task.progress}% complete`}
            >
              {/* Progress Fill */}
              <div
                className="h-full bg-black/20"
                style={{ width: `${task.progress}%` }}
              />

              {/* Task Info Tooltip */}
              <AnimatePresence>
                {hoveredTask === task.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-20 whitespace-nowrap"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {task.name}
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Start: {task.start.toLocaleDateString()}</p>
                      <p>End: {task.end.toLocaleDateString()}</p>
                      <p>Progress: {task.progress}%</p>
                      <p>Status: {getStatusLabel(task.status)}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <AnimatePresence>
            {task.children!.map((child) => renderTask(child, level + 1))}
          </AnimatePresence>
        )}
      </React.Fragment>
    );
  };

  // Generate month headers
  const generateMonthHeaders = () => {
    const headers: { month: string; width: number }[] = [];
    let currentDate = new Date(minDate);

    while (currentDate <= maxDate) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const endDate = monthEnd > maxDate ? maxDate : monthEnd;

      const days = Math.ceil((endDate.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
      const width = (days / totalDays) * 100;

      headers.push({
        month: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        width
      });

      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    return headers;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      role="figure"
      aria-label={title || 'Gantt Chart'}
    >
      {/* Header */}
      {(title || description) && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}

      {/* Gantt Content */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="flex bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <div className="w-1/3 p-3 border-r border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Task Name
              </span>
            </div>
            <div className="flex-1 p-3 flex">
              {generateMonthHeaders().map((header, index) => (
                <div
                  key={index}
                  className="text-center text-sm font-semibold text-gray-900 dark:text-white"
                  style={{ width: `${header.width}%` }}
                >
                  {header.month}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div>{tasks.map((task) => renderTask(task))}</div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-xs">
          {['pending', 'in-progress', 'completed', 'delayed'].map((status) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded ${getStatusColor(
                  status as GanttTask['status']
                )}`}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {getStatusLabel(status as GanttTask['status'])}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GanttChart;
