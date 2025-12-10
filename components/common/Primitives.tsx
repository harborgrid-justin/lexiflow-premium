
import React, { useEffect, useState, useRef } from 'react';
import { Loader2, FileText, Image as ImageIcon, Film, Music, Box, Shield, Activity, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

// 1. Status Dot
export const StatusDot: React.FC<{ status: string; size?: string; className?: string }> = ({ status, size = "w-2.5 h-2.5", className }) => {
  const { theme } = useTheme();
  let color = theme.status.neutral.bg; // Default fallback
  const s = status.toLowerCase();
  
  if (['active', 'online', 'paid', 'cleared', 'success', 'completed', 'good', 'healthy', 'connected', 'admitted'].includes(s)) color = "bg-emerald-500";
  else if (['pending', 'away', 'warning', 'review', 'draft', 'in progress', 'syncing', 'marked'].includes(s)) color = "bg-amber-500";
  else if (['error', 'offline', 'overdue', 'breached', 'critical', 'rejected', 'disconnected', 'failed', 'excluded'].includes(s)) color = "bg-rose-500";
  else if (['processing', 'info', 'open'].includes(s)) color = "bg-blue-500";

  return <div className={cn(size, "rounded-full shrink-0 transition-colors duration-500", color, className)} title={status} />;
};

// 2. Currency Display
export const Currency: React.FC<{ value: number; className?: string; hideSymbol?: boolean }> = ({ value, className = "", hideSymbol = false }) => {
  const { theme } = useTheme();
  return (
    <span className={cn("font-mono tracking-tight", theme.text.primary, className)}>
      {!hideSymbol && "$"}
      {value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
    </span>
  );
};

// 3. Date Text
export const DateText: React.FC<{ date: string; className?: string; icon?: boolean }> = ({ date, className = "", icon = false }) => {
  const { theme } = useTheme();
  return (
    <span className={cn("flex items-center text-xs", theme.text.secondary, className)}>
      {icon && <Calendar className="h-3 w-3 mr-1 opacity-70" />}
      {date}
    </span>
  );
};

// 4. File Icon Logic
export const FileIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "h-5 w-5" }) => {
  const t = type.toLowerCase();
  if (t.includes('image') || t.includes('jpg') || t.includes('png')) return <ImageIcon className={cn("text-purple-600", className)} />;
  if (t.includes('video') || t.includes('mp4')) return <Film className={cn("text-rose-600", className)} />;
  if (t.includes('audio')) return <Music className={cn("text-pink-600", className)} />;
  if (t.includes('evidence')) return <Shield className={cn("text-amber-600", className)} />;
  if (t.includes('physical')) return <Box className={cn("text-slate-600", className)} />;
  return <FileText className={cn("text-blue-600", className)} />;
};

// 5. Loading Spinner
export const LoadingSpinner: React.FC<{ text?: string; className?: string }> = ({ text, className = "h-5 w-5" }) => (
  <div className="flex items-center justify-center text-slate-500">
    <Loader2 className={cn("animate-spin", className)} />
    {text && <span className="ml-2 text-sm">{text}</span>}
  </div>
);

// 6. Tag List
export const TagList: React.FC<{ tags: string[]; limit?: number }> = ({ tags, limit = 3 }) => {
  const { theme } = useTheme();
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.slice(0, limit).map(t => (
        <span key={t} className={cn("px-2 py-0.5 rounded text-[10px] font-medium border", theme.surfaceHighlight, theme.text.secondary, theme.border.light)}>
          {t}
        </span>
      ))}
      {tags.length > limit && (
        <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium opacity-70", theme.surfaceHighlight, theme.text.secondary)}>+{tags.length - limit}</span>
      )}
    </div>
  );
};

// 7. Section Header
export const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => {
  const { theme } = useTheme();
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.primary)}>{title}</h3>
        {subtitle && <p className={cn("text-xs mt-0.5", theme.text.secondary)}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
};

// 8. Truncated Text
export const TruncatedText: React.FC<{ text: string; limit?: number; className?: string }> = ({ text, limit = 50, className = "" }) => {
  if (text.length <= limit) return <span className={className}>{text}</span>;
  return (
    <span className={cn("cursor-help", className)} title={text}>
      {text.substring(0, limit)}...
    </span>
  );
};

// 9. Metric Card with Sparkline & Animation
export const MetricCard: React.FC<{ 
  label: string; 
  value: string | number | React.ReactNode; 
  icon?: React.ElementType; 
  trend?: string;
  trendUp?: boolean;
  className?: string;
  isLive?: boolean; 
  sparklineData?: number[];
}> = ({ label, value, icon: Icon, trend, trendUp, className = "", isLive = false, sparklineData }) => {
  const { theme } = useTheme();
  const [displayValue, setDisplayValue] = useState<string | number>(typeof value === 'number' ? 0 : value);
  const prevValueRef = useRef(value);

  // Animation effect for numeric values
  useEffect(() => {
    if (typeof value === 'number') {
      let start = typeof displayValue === 'number' ? displayValue : 0;
      const end = value;
      if (start === end) return;

      const range = end - start;
      const duration = 800; // ms
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
        
        const nextValue = Math.round(start + range * easeOut);
        setDisplayValue(nextValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }
    prevValueRef.current = value;
  }, [value]);
  
  // Sparkline Generator
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const height = 40;
    const width = 100;
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    
    const points = sparklineData.map((d, i) => {
        const x = (i / (sparklineData.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible opacity-50">
            <polyline 
                points={points} 
                fill="none" 
                stroke={trendUp ? '#10b981' : '#f43f5e'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </svg>
    );
  };

  return (
    <div className={cn(
      theme.surface, 
      theme.border.default, 
      "rounded-xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between h-full relative overflow-hidden",
      className
    )}>
      {isLive && (
        <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      )}
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1.5", theme.text.secondary)}>{label}</p>
          <div className={cn("text-2xl font-bold tracking-tight", theme.text.primary)}>
              {typeof value === 'number' ? displayValue.toLocaleString() : value}
          </div>
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-lg bg-opacity-10", theme.surfaceHighlight)}>
            <Icon className={cn("h-5 w-5", theme.text.secondary)}/>
          </div>
        )}
      </div>
      
      {sparklineData ? (
          <div className="h-10 mt-2">
              {renderSparkline()}
          </div>
      ) : (
          trend && (
            <div className={cn("mt-4 text-xs font-medium flex items-center", trendUp ? "text-emerald-600" : "text-rose-600")}>
              {trendUp ? <TrendingUp className="h-3 w-3 mr-1"/> : <TrendingDown className="h-3 w-3 mr-1"/>}
              {trend}
            </div>
          )
      )}
    </div>
  );
};
