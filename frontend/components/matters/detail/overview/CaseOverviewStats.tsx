/**
 * CaseOverviewStats.tsx
 * 
 * Key performance metrics dashboard with revenue, time, and task completion stats.
 * Clickable cards open detailed views in holographic windows.
 * 
 * @module components/case-detail/overview/CaseOverviewStats
 * @category Case Management - Overview
 */

// External Dependencies
import React from 'react';
import { DollarSign, Clock, CheckCircle, TrendingUp, ExternalLink } from 'lucide-react';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../../context/ThemeContext';
import { useWindow } from '../../../../context/WindowContext';

// Internal Dependencies - Services & Utils
import { cn } from '../../../../utils/cn';

export const CaseOverviewStats: React.FC = () => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();

  const handleDetail = (title: string) => {
      const winId = `stat-${title.toLowerCase().replace(' ','-')}`;
      openWindow(
          winId,
          `Detail: ${title}`,
          <div className={cn("p-6 flex flex-col items-center justify-center h-full text-center", theme.text.primary)}>
              <h3 className="text-xl font-bold mb-2">{title} Breakdown</h3>
              <p className={theme.text.secondary}>Detailed analytics and historical data for this metric would appear here.</p>
              <button className={cn("mt-4 underline", theme.primary.text)} onClick={() => closeWindow(winId)}>Close</button>
          </div>
      );
  };

  return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
            { label: "Total Billed", value: "124,500", icon: DollarSign, color: theme.status.success.text },
            { label: "Upcoming Events", value: "3", icon: Clock, color: theme.primary.text },
            { label: "Open Tasks", value: "12", icon: CheckCircle, color: theme.chart.colors.purple },
            { label: "Risk Score", value: "Low", icon: TrendingUp, color: theme.status.warning.text }
        ].map((stat, i) => (
            <div 
                key={i} 
                onClick={() => handleDetail(stat.label)}
                className={cn(
                    "p-4 rounded-lg border shadow-sm flex flex-col justify-center cursor-pointer group relative overflow-hidden", 
                    theme.surface.default, theme.border.default,
                    `hover:${theme.surface.highlight}`,
                    `hover:${theme.primary.border} transition-all`
                )}
            >
                <p className={cn("text-xs font-bold uppercase mb-1", theme.text.secondary)}>{stat.label}</p>
                <div className={cn("flex items-center font-bold text-lg", theme.text.primary)}>
                    <stat.icon className={cn("h-4 w-4 mr-1", stat.color)}/> {stat.value}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className={cn("h-3 w-3", theme.text.tertiary)}/>
                </div>
            </div>
        ))}
      </div>
  );
};
