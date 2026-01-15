/**
 * @module enterprise/dashboard/CaseStatusWidget
 * @category Enterprise Dashboard
 * @description Case status distribution visualization widget
 */

import { cn } from '@/lib/cn';
import { useTheme } from '@/contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface CaseStatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CaseStatusWidgetProps {
  data: CaseStatusData[];
  totalCases: number;
  title?: string;
  showLegend?: boolean;
  showDetails?: boolean;
  className?: string;
}

/**
 * CaseStatusWidget - Case status distribution visualization
 * Displays case statistics with interactive pie chart and detailed breakdown
 */
export const CaseStatusWidget: React.FC<CaseStatusWidgetProps> = ({
  data,
  totalCases,
  title = 'Case Status Distribution',
  showLegend = true,
  showDetails = true,
  className,
}) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  interface TooltipPayload {
    payload: CaseStatusData;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length && payload[0]) {
      const data = payload[0].payload;
      return (
        <div
          className={cn(
            'p-3 rounded-lg shadow-lg border',
            theme.surface.raised,
            theme.border.default
          )}
        >
          <p className={cn('text-sm font-medium mb-1', theme.text.primary)}>
            {data.status}
          </p>
          <p className={cn('text-xs', theme.text.secondary)}>
            Cases: {data.count}
          </p>
          <p className={cn('text-xs', theme.text.tertiary)}>
            {data.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border shadow-sm overflow-hidden',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className={cn('text-lg font-bold', theme.text.primary)}>{title}</h3>
              <p className={cn('text-sm mt-0.5', theme.text.tertiary)}>
                Total: {totalCases} cases
              </p>
            </div>
          </div>
          {showDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={cn(
                'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors',
                theme.text.secondary
              )}
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
            >
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data as never[]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={90}
                innerRadius={50}
                fill="#8884d8"
                dataKey="count"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                    style={{
                      filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className={cn('text-sm', theme.text.secondary)}>{value}</span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Breakdown */}
        <AnimatePresence>
          {showDetails && expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6 space-y-3"
            >
              {data.map((item, index) => (
                <motion.div
                  key={item.status}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'p-3 rounded-lg border transition-all',
                    activeIndex === index
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-slate-700',
                    theme.surface.raised
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={cn('text-sm font-medium', theme.text.primary)}>
                        {item.status}
                      </span>
                    </div>
                    <span className={cn('text-sm font-bold', theme.text.primary)}>
                      {item.count}
                    </span>
                  </div>
                  <div style={{ backgroundColor: 'var(--color-border)' }} className="relative h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <p className={cn('text-xs mt-1', theme.text.tertiary)}>
                    {item.percentage.toFixed(1)}% of total cases
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
