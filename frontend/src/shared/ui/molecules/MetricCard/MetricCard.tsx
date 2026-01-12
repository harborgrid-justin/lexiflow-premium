/**
 * @module components/common/primitives/MetricCard
 * @category Common Components - UI Primitives
 * @description Animated metric card with sparkline support, trend indicators, and live status
 */

import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number | React.ReactNode;
  icon?: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  isLive?: boolean;
  sparklineData?: number[];
}

export const MetricCard = React.memo<MetricCardProps>(({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  className = "",
  isLive = false,
  sparklineData
}) => {
  const { theme } = useTheme();

  // Normalize value to handle undefined, null, and NaN
  const normalizedValue = React.useMemo(() => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number' && isNaN(value)) return 0;
    return value;
  }, [value]);

  const [displayValue, setDisplayValue] = useState<string | number>(() => {
    if (typeof normalizedValue === 'number') return 0;
    if (typeof normalizedValue === 'string') return '';
    return '';
  });
  const prevValueRef = useRef(normalizedValue);

  // Animation effect for numeric values
  useEffect(() => {
    if (typeof normalizedValue === 'number') {
      const start = typeof displayValue === 'number' ? displayValue : 0;
      const end = normalizedValue;
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
      setDisplayValue(typeof normalizedValue === 'bigint' ? Number(normalizedValue) : normalizedValue as string | number);
      prevValueRef.current = normalizedValue;
    }
  }, [normalizedValue, displayValue]);

  // Sparkline Generator (memoized for performance)
  const sparklinePath = useMemo(() => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const height = 40;
    const width = 100;
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;

    return sparklineData.map((d, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
  }, [sparklineData]);

  const renderSparkline = () => {
    if (!sparklinePath) return null;
    const height = 40;
    const width = 100;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible opacity-50">
        <polyline
          points={sparklinePath}
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
      theme.surface.default,
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
          <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1.5", theme.text.secondary)}>
            {label}
          </p>
          <div className={cn("text-2xl font-bold tracking-tight", theme.text.primary)}>
            {typeof displayValue === 'number' ? displayValue.toLocaleString() : (displayValue || '0')}
          </div>
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-lg bg-opacity-10", theme.surface.highlight)}>
            <Icon className={cn("h-5 w-5", theme.text.secondary)} />
          </div>
        )}
      </div>

      {sparklineData ? (
        <div className="h-10 mt-2">
          {renderSparkline()}
        </div>
      ) : (
        trend && (
          <div className={cn(
            "mt-4 text-xs font-medium flex items-center",
            trendUp ? "text-emerald-600" : "text-rose-600"
          )}>
            {trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {trend}
          </div>
        )
      )}
    </div>
  );
});

MetricCard.displayName = 'MetricCard';
