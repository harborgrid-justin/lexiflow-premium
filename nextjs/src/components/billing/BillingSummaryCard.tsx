import React from 'react';
import { DollarSign, Clock, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { cn } from '@/lib/utils';

interface BillingSummaryCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: 'dollar' | 'clock' | 'invoice' | 'trending';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export const BillingSummaryCard: React.FC<BillingSummaryCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon = 'dollar',
  color = 'blue',
}) => {
  const icons = {
    dollar: DollarSign,
    clock: Clock,
    invoice: FileText,
    trending: TrendingUp,
  };

  const accentColors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    yellow: "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
  };

  const Icon = icons[icon];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold">{value}</div>

            {change !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    change >= 0 ? 'text-emerald-500' : 'text-red-500'
                  )}
                >
                  {change >= 0 ? '+' : ''}{change}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className={cn("p-3 rounded-full", accentColors[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
