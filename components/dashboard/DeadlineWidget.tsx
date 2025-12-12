import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle, Calendar } from 'lucide-react';

export interface Deadline {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  type: 'filing' | 'hearing' | 'response' | 'meeting' | 'payment' | 'other';
  status: 'upcoming' | 'due-soon' | 'overdue' | 'completed';
  caseNumber?: string;
  assignee?: string;
}

export interface DeadlineWidgetProps {
  deadlines?: Deadline[];
  onDeadlineClick?: (deadline: Deadline) => void;
  dueSoonThreshold?: number; // days
  className?: string;
}

const typeColors = {
  filing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  hearing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  response: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  meeting: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  payment: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  other: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
};

export const DeadlineWidget: React.FC<DeadlineWidgetProps> = ({
  deadlines = [],
  onDeadlineClick,
  dueSoonThreshold = 7,
  className = '',
}) => {
  const categorizedDeadlines = useMemo(() => {
    const now = new Date();
    const soon = new Date(now.getTime() + dueSoonThreshold * 24 * 60 * 60 * 1000);

    return {
      overdue: deadlines.filter((d) => {
        const dueDate = new Date(d.dueDate);
        return dueDate < now && d.status !== 'completed';
      }),
      dueSoon: deadlines.filter((d) => {
        const dueDate = new Date(d.dueDate);
        return dueDate >= now && dueDate <= soon && d.status !== 'completed';
      }),
      upcoming: deadlines.filter((d) => {
        const dueDate = new Date(d.dueDate);
        return dueDate > soon && d.status !== 'completed';
      }),
      completed: deadlines.filter((d) => d.status === 'completed'),
    };
  }, [deadlines, dueSoonThreshold]);

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const dueDate = new Date(date);
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days`;
  };

  const getStatusIcon = (deadline: Deadline) => {
    if (deadline.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
    if (deadline.status === 'overdue' || new Date(deadline.dueDate) < new Date()) {
      return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
    if (deadline.status === 'due-soon') {
      return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    }
    return <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
  };

  const getStatusColor = (deadline: Deadline) => {
    if (deadline.status === 'completed') {
      return 'border-green-500 bg-green-50 dark:bg-green-900/10';
    }
    if (deadline.status === 'overdue' || new Date(deadline.dueDate) < new Date()) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/10';
    }
    if (deadline.status === 'due-soon') {
      return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
    }
    return 'border-blue-500 bg-blue-50 dark:bg-blue-900/10';
  };

  const allActiveDeadlines = [
    ...categorizedDeadlines.overdue,
    ...categorizedDeadlines.dueSoon,
    ...categorizedDeadlines.upcoming,
  ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className={className}>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {categorizedDeadlines.overdue.length}
          </div>
          <div className="text-xs text-red-700 dark:text-red-300">Overdue</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {categorizedDeadlines.dueSoon.length}
          </div>
          <div className="text-xs text-yellow-700 dark:text-yellow-300">Due Soon</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {categorizedDeadlines.upcoming.length}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Upcoming</div>
        </div>
      </div>

      {/* Deadlines List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {allActiveDeadlines.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p className="text-gray-500 dark:text-gray-400">No active deadlines</p>
          </div>
        ) : (
          allActiveDeadlines.map((deadline, index) => (
            <motion.div
              key={deadline.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onDeadlineClick?.(deadline)}
              className={`border-l-4 rounded-lg p-3 ${getStatusColor(deadline)} ${
                onDeadlineClick ? 'cursor-pointer hover:shadow-md' : ''
              } transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(deadline)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {deadline.title}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded ${typeColors[deadline.type]}`}>
                      {deadline.type}
                    </span>
                  </div>

                  {deadline.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {deadline.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(deadline.dueDate).toLocaleDateString()}
                      </div>
                      {deadline.caseNumber && (
                        <div className="text-gray-500 dark:text-gray-500">
                          {deadline.caseNumber}
                        </div>
                      )}
                    </div>
                    <div className={`font-medium ${
                      new Date(deadline.dueDate) < new Date()
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {getDaysUntil(deadline.dueDate)}
                    </div>
                  </div>

                  {deadline.assignee && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Assigned to: {deadline.assignee}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Completed Section */}
      {categorizedDeadlines.completed.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Show {categorizedDeadlines.completed.length} completed
          </button>
        </div>
      )}
    </div>
  );
};

export default DeadlineWidget;
