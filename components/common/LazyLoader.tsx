
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface LazyLoaderProps {
  message?: string;
}

export const LazyLoader: React.FC<LazyLoaderProps> = ({ message = "Loading..." }) => {
  const { theme } = useTheme();
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);

  useEffect(() => {
    // Adaptive Loading: Check connection type
    if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn && (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === '3g')) {
            setIsLowBandwidth(true);
        }
    }
  }, []);

  if (isLowBandwidth) {
      // Simplified loader for slow connections
      return (
          <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                  <div className="text-sm font-bold text-slate-500 mb-2">Loading...</div>
                  <div className="text-xs text-slate-400">Low Bandwidth Mode Active</div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full w-full p-6 space-y-6 overflow-hidden">
      {/* Skeleton Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("h-24 rounded-lg border", theme.surface, theme.border.default)}>
             <div className="h-full w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
          </div>
        ))}
      </div>

      {/* Skeleton Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className={cn("lg:col-span-2 h-96 rounded-lg border", theme.surface, theme.border.default)}>
             <div className="h-full w-full bg-slate-50/50 flex flex-col p-6 space-y-4">
                 <div className="h-8 w-1/3 bg-slate-200 rounded"></div>
                 <div className="flex-1 bg-slate-200 rounded"></div>
             </div>
        </div>
        <div className={cn("h-96 rounded-lg border", theme.surface, theme.border.default)}>
             <div className="h-full w-full bg-slate-50/50 flex flex-col p-6 space-y-4">
                 <div className="h-8 w-1/2 bg-slate-200 rounded"></div>
                 <div className="space-y-2">
                     <div className="h-12 w-full bg-slate-200 rounded"></div>
                     <div className="h-12 w-full bg-slate-200 rounded"></div>
                     <div className="h-12 w-full bg-slate-200 rounded"></div>
                 </div>
             </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-4">
         <span className="text-xs font-medium text-slate-400 animate-pulse">{message}</span>
      </div>
    </div>
  );
};
