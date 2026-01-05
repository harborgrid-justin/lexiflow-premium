
import React from 'react';
import { Loader2, FileText, Image as ImageIcon, Film, Music, Box, Shield, Activity, DollarSign, Calendar, TrendingUp } from 'lucide-react';

// 0. Skeleton Primitive (Principle 1 & 4)
// Uses CSS variables for animation to avoid main-thread blocking (Principle 11)
export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-slate-100 animate-pulse rounded ${className}`} />
);

// 1. Status Dot
export const StatusDot: React.FC<{ status: string; size?: string }> = ({ status, size = "w-2.5 h-2.5" }) => {
  let color = "bg-slate-300";
  const s = status.toLowerCase();
  if (['active', 'online', 'paid', 'cleared', 'success', 'completed'].includes(s)) color = "bg-green-500";
  if (['pending', 'away', 'warning', 'review', 'draft', 'in progress'].includes(s)) color = "bg-amber-500";
  if (['error', 'offline', 'overdue', 'breached', 'critical', 'rejected'].includes(s)) color = "bg-red-500";
  if (['processing', 'info'].includes(s)) color = "bg-blue-500";

  return <div className={`${size} rounded-full ${color} shrink-0`} title={status} />;
};

// 2. Currency Display
export const Currency: React.FC<{ value: number; className?: string; hideSymbol?: boolean }> = ({ value, className = "", hideSymbol = false }) => {
  return (
    <span className={`font-mono tracking-tight whitespace-nowrap ${className}`}>
      {!hideSymbol && "$"}
      {value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
    </span>
  );
};

// 3. Date Text
export const DateText: React.FC<{ date: string; className?: string; icon?: boolean }> = ({ date, className = "text-slate-500", icon = false }) => (
  <span className={`flex items-center text-xs whitespace-nowrap ${className}`}>
    {icon && <Calendar className="h-3 w-3 mr-1 opacity-70 shrink-0" />}
    {date}
  </span>
);

// 4. File Icon Logic
export const FileIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "h-5 w-5" }) => {
  const t = type.toLowerCase();
  if (t.includes('image') || t.includes('jpg') || t.includes('png')) return <ImageIcon className={`text-purple-600 shrink-0 ${className}`} />;
  if (t.includes('video') || t.includes('mp4')) return <Film className={`text-red-600 shrink-0 ${className}`} />;
  if (t.includes('audio')) return <Music className={`text-pink-600 shrink-0 ${className}`} />;
  if (t.includes('evidence')) return <Shield className={`text-amber-600 shrink-0 ${className}`} />;
  if (t.includes('physical')) return <Box className={`text-slate-600 shrink-0 ${className}`} />;
  return <FileText className={`text-blue-600 shrink-0 ${className}`} />;
};

// 5. Loading Spinner
export const LoadingSpinner: React.FC<{ text?: string; className?: string }> = ({ text, className = "h-5 w-5" }) => (
  <div className="flex items-center justify-center text-slate-500">
    <Loader2 className={`animate-spin shrink-0 ${className}`} />
    {text && <span className="ml-2 text-sm">{text}</span>}
  </div>
);

// 6. Tag List
export const TagList: React.FC<{ tags: string[]; limit?: number }> = ({ tags, limit = 3 }) => (
  <div className="flex flex-wrap gap-1">
    {tags.slice(0, limit).map(t => (
      <span key={t} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-semibold uppercase tracking-tighter whitespace-nowrap">
        {t}
      </span>
    ))}
    {tags.length > limit && (
      <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded text-[10px] font-bold whitespace-nowrap">+{tags.length - limit}</span>
    )}
  </div>
);

// 7. Section Header
export const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <div className="flex justify-between items-center mb-4">
    <div>
      <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-[0.2em]">{title}</h3>
      {subtitle && <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// 8. Truncated Text with Tooltip
export const TruncatedText: React.FC<{ text: string; limit?: number; className?: string }> = ({ text, limit = 50, className = "" }) => {
  if (text.length <= limit) return <span className={className}>{text}</span>;
  return (
    <span className={`cursor-help ${className}`} title={text}>
      {text.substring(0, limit)}...
    </span>
  );
};

// 9. Priority Badge
export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const p = priority.toLowerCase();
  let style = "bg-slate-100 text-slate-600 border-slate-200";
  if (p === 'high' || p === 'critical') style = "bg-red-50 text-red-700 border-red-200";
  if (p === 'medium') style = "bg-amber-50 text-amber-700 border-amber-200";
  if (p === 'low') style = "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border whitespace-nowrap ${style}`}>
      {priority}
    </span>
  );
};

// 10. Metric Card (Dashboard Atom)
// Updated to support Loading State (Principle 4)
export const MetricCard: React.FC<{ 
  label: string; 
  value: string | number; 
  icon?: React.ElementType; 
  trend?: string;
  trendUp?: boolean;
  className?: string; 
  isLoading?: boolean;
}> = ({ label, value, icon: Icon, trend, trendUp, className = "", isLoading = false }) => (
  <div className={`bg-white p-5 rounded-xl shadow-sm border border-slate-200 group hover:shadow-md transition-all ${className}`}>
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.25em] truncate">{label}</p>
        
        {isLoading ? (
            <Skeleton className="h-8 w-24 mt-1" />
        ) : (
            <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums leading-none">{value}</p>
        )}
      </div>
      {Icon && (
        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all shadow-inner border border-transparent group-hover:border-blue-100 shrink-0">
            <Icon className="h-5 w-5"/>
        </div>
      )}
    </div>
    <div className="mt-4 h-4">
        {isLoading ? (
            <Skeleton className="h-3 w-16" />
        ) : (
            trend && (
                <div className={`text-[10px] font-semibold uppercase tracking-widest flex items-center ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                    <TrendingUp className={`h-3.5 w-3.5 mr-1.5 shrink-0 ${!trendUp && 'rotate-180'}`}/>
                    {trend}
                </div>
            )
        )}
    </div>
  </div>
);
