
import React from 'react';
import { DollarSign, Clock, CheckCircle, TrendingUp, ExternalLink } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useWindow } from '../../../context/WindowContext';

export const CaseOverviewStats: React.FC = () => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();

  const handleDetail = (title: string) => {
      const winId = `stat-${title.toLowerCase().replace(' ','-')}`;
      openWindow(
          winId,
          `Detail: ${title}`,
          <div className="p-6 flex flex-col items-center justify-center h-full text-center">
              <h3 className="text-xl font-bold mb-2">{title} Breakdown</h3>
              <p className="text-slate-500">Detailed analytics and historical data for this metric would appear here.</p>
              <button className="mt-4 text-blue-600 underline" onClick={() => closeWindow(winId)}>Close</button>
          </div>
      );
  };

  return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
            { label: "Total Billed", value: "124,500", icon: DollarSign, color: "text-green-600" },
            { label: "Upcoming Events", value: "3", icon: Clock, color: "text-blue-600" },
            { label: "Open Tasks", value: "12", icon: CheckCircle, color: "text-purple-600" },
            { label: "Risk Score", value: "Low", icon: TrendingUp, color: "text-amber-500" }
        ].map((stat, i) => (
            <div 
                key={i} 
                onClick={() => handleDetail(stat.label)}
                className={cn(
                    "p-4 rounded-lg border shadow-sm flex flex-col justify-center cursor-pointer group relative overflow-hidden", 
                    theme.surface, theme.border.default,
                    `hover:${theme.surfaceHighlight}`,
                    "hover:border-blue-300 transition-all"
                )}
            >
                <p className={cn("text-xs font-bold uppercase mb-1", theme.text.secondary)}>{stat.label}</p>
                <div className={cn("flex items-center font-bold text-lg", theme.text.primary)}>
                    <stat.icon className={cn("h-4 w-4 mr-1", stat.color)}/> {stat.value}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3 w-3 text-slate-400"/>
                </div>
            </div>
        ))}
      </div>
  );
};
