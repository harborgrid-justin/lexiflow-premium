import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  Users,
  Calendar,
  Search,
  Upload,
  MessageSquare,
  BarChart
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  disabled?: boolean;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  layout?: 'grid' | 'list';
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  layout = 'grid',
  className = ''
}) => {
  const defaultActions: QuickAction[] = [
    {
      id: '1',
      label: 'New Case',
      icon: <FileText className="w-5 h-5" />,
      onClick: () => console.log('New Case'),
      variant: 'primary'
    },
    {
      id: '2',
      label: 'Add Client',
      icon: <Users className="w-5 h-5" />,
      onClick: () => console.log('Add Client'),
      variant: 'primary'
    },
    {
      id: '3',
      label: 'Schedule Meeting',
      icon: <Calendar className="w-5 h-5" />,
      onClick: () => console.log('Schedule Meeting'),
      variant: 'secondary'
    },
    {
      id: '4',
      label: 'Upload Document',
      icon: <Upload className="w-5 h-5" />,
      onClick: () => console.log('Upload Document'),
      variant: 'secondary'
    },
    {
      id: '5',
      label: 'Search Cases',
      icon: <Search className="w-5 h-5" />,
      onClick: () => console.log('Search Cases'),
      variant: 'secondary'
    },
    {
      id: '6',
      label: 'Send Message',
      icon: <MessageSquare className="w-5 h-5" />,
      onClick: () => console.log('Send Message'),
      variant: 'secondary'
    },
    {
      id: '7',
      label: 'View Reports',
      icon: <BarChart className="w-5 h-5" />,
      onClick: () => console.log('View Reports'),
      variant: 'secondary'
    },
    {
      id: '8',
      label: 'Quick Action',
      icon: <Plus className="w-5 h-5" />,
      onClick: () => console.log('Quick Action'),
      variant: 'success'
    }
  ];

  const actionsList = actions || defaultActions;

  const getVariantStyles = (variant?: QuickAction['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white';
      default:
        return 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${className}`}
      role="region"
      aria-label="Quick Actions"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Common tasks and shortcuts
        </p>
      </div>

      {/* Actions */}
      <div className="p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            layout === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3'
              : 'space-y-3'
          }
        >
          {actionsList.map((action) => (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ scale: action.disabled ? 1 : 1.05 }}
              whileTap={{ scale: action.disabled ? 1 : 0.95 }}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                ${layout === 'grid' ? 'flex-col' : 'flex-row justify-start'}
                flex items-center gap-3 p-4 rounded-lg transition-all
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                disabled:opacity-50 disabled:cursor-not-allowed
                ${getVariantStyles(action.variant)}
              `}
              aria-label={action.label}
              aria-disabled={action.disabled}
            >
              <div
                className={`
                ${layout === 'grid' ? '' : 'flex-shrink-0'}
                flex items-center justify-center
              `}
              >
                {action.icon}
              </div>
              <span
                className={`
                ${layout === 'grid' ? 'text-center text-sm' : 'text-left flex-1'}
                font-medium
              `}
              >
                {action.label}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
        <button
          className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Customize quick actions"
        >
          Customize Actions
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
