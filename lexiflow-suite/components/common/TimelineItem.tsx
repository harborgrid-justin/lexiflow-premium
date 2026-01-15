
import React from 'react';

interface TimelineItemProps {
  date: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  colorClass?: string;
  onClick?: () => void;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  date, title, description, icon, colorClass = 'bg-slate-400', onClick, isLast
}) => {
  return (
    <div className="relative pl-10 pb-10 group">
      {/* Precision Thread Line */}
      {!isLast && (
        <div style={{ backgroundColor: 'var(--color-border)' }} className="absolute left-[13px] top-6 bottom-0 w-[1px] group-hover:bg-blue-300 transition-colors duration-300"></div>
      )}

      {/* High-Density Marker */}
      <div className={`absolute left-0 top-0 h-7 w-7 rounded-lg flex items-center justify-center text-white z-10 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${colorClass} ring-4 ring-white`}>
        <div className="scale-75">
          {icon}
        </div>
      </div>

      {/* Event Content Block */}
      <div
        onClick={onClick}
        className={`flex flex-col -mt-0.5 ${onClick ? 'cursor-pointer' : ''}`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
          <span className={`text-[13px] font-semibold text-slate-900 leading-snug tracking-tight transition-colors duration-200 ${onClick ? 'group-hover:text-blue-600' : ''}`}>
            {title}
          </span>
          <span className="text-[10px] font-medium text-slate-400 font-mono tracking-tighter uppercase shrink-0 pt-0.5">
            {date}
          </span>
        </div>

        {description && (
          <div className="mt-2 relative">
            <p style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-textMuted)', borderColor: 'transparent' }} className="text-[12px] leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300 p-2.5 rounded-lg border group-hover:border-slate-100 group-hover:bg-white group-hover:shadow-sm">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
