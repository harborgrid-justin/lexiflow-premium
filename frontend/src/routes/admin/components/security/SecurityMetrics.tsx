import { useTheme } from '@/theme';
import { cn } from '@/lib/cn';
import { Card } from '@/components/molecules/Card/Card';
import { Activity, TrendingUp } from 'lucide-react';
import type { SecurityMetric } from './types';

interface SecurityMetricsProps {
  metrics: SecurityMetric[];
}

const severityColors = {
  success: 'text-green-600',
  warning: 'text-amber-600',
  error: 'text-rose-600',
  info: 'text-blue-600'
};

const trendIcons = {
  up: TrendingUp,
  down: Activity,
  neutral: Activity
};

export function SecurityMetrics({ metrics }: SecurityMetricsProps) {
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const TrendIcon = trendIcons[metric.trend];
        return (
          <Card key={idx}>
            <div className="flex items-start justify-between">
              <div>
                <p className={cn("text-2xl font-bold mb-1", severityColors[metric.severity])}>
                  {metric.value.toLocaleString()}
                </p>
                <p className={cn("text-sm", theme.text.secondary)}>{metric.label}</p>
              </div>
              <TrendIcon className={cn("h-5 w-5", severityColors[metric.severity])} />
            </div>
            <div className={cn("mt-2 text-xs flex items-center gap-1", theme.text.tertiary)}>
              <span className={metric.change >= 0 ? 'text-green-600' : 'text-rose-600'}>
                {metric.change >= 0 ? '+' : ''}{metric.change}%
              </span>
              <span>vs last period</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
