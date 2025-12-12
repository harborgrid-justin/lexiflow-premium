import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  assignee?: string;
}

export interface TaskWidgetProps {
  tasks?: Task[];
  onTaskToggle?: (taskId: string) => void;
  onTaskAdd?: (task: Omit<Task, 'id'>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskClick?: (task: Task) => void;
  showCompleted?: boolean;
  className?: string;
}

const priorityConfig = {
  low: {
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    label: 'Low',
  },
  medium: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Medium',
  },
  high: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    label: 'High',
  },
  urgent: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Urgent',
  },
};

export const TaskWidget: React.FC<TaskWidgetProps> = ({
  tasks = [],
  onTaskToggle,
  onTaskAdd,
  onTaskDelete,
  onTaskClick,
  showCompleted = true,
  className = '',
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState('');

  const displayTasks = showCompleted
    ? tasks
    : tasks.filter((task) => !task.completed);

  const completedCount = tasks.filter((task) => task.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddTask = () => {
    if (newTask.trim() && onTaskAdd) {
      onTaskAdd({
        title: newTask,
        completed: false,
        priority: 'medium',
      });
      setNewTask('');
      setShowAddForm(false);
    }
  };

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !tasks.find((t) => t.dueDate === dueDate)?.completed;
  };

  return (
    <div className={className}>
      {/* Header with Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {completedCount} of {totalCount} completed
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {Math.round(completionPercentage)}%
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-green-500 h-full rounded-full"
          />
        </div>
      </div>

      {/* Add Task Button */}
      {onTaskAdd && !showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mb-3 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      )}

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask();
                  if (e.key === 'Escape') {
                    setShowAddForm(false);
                    setNewTask('');
                  }
                }}
                placeholder="Task title..."
                autoFocus
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTask}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTask('');
                }}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {displayTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500 dark:text-gray-400"
            >
              No tasks yet
            </motion.div>
          ) : (
            displayTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
                layout
                className={`group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => onTaskToggle?.(task.id)}
                    className="mt-0.5 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div
                      className={`text-sm font-medium text-gray-900 dark:text-white ${
                        task.completed ? 'line-through' : ''
                      }`}
                    >
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {task.description}
                      </div>
                    )}

                    {/* Task Meta */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Priority */}
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          priorityConfig[task.priority].bgColor
                        } ${priorityConfig[task.priority].color}`}
                      >
                        {priorityConfig[task.priority].label}
                      </span>

                      {/* Due Date */}
                      {task.dueDate && (
                        <div
                          className={`flex items-center gap-1 text-xs ${
                            isOverdue(task.dueDate)
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {isOverdue(task.dueDate) ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}

                      {/* Assignee */}
                      {task.assignee && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          @{task.assignee}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  {onTaskDelete && (
                    <button
                      onClick={() => onTaskDelete(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskWidget;
