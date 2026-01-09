'use client';

import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/shadcn/card';
import { Download, LucideIcon, Maximize2, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onExport?: () => void;
  onExpand?: () => void;
  className?: string;
  height?: number | string;
  showActions?: boolean;
  actions?: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  icon: Icon,
  isLoading = false,
  error = null,
  onRefresh,
  onExport,
  onExpand,
  className,
  height = 300,
  showActions = true,
  actions,
}: ChartCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
        <CardHeader className="flex flex-row items-start justify-between border-b pb-4">
            <div className="flex items-start gap-4">
                 {Icon && (
                    <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-foreground" />
                    </div>
                )}
                <div>
                     <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                     {subtitle && <CardDescription>{subtitle}</CardDescription>}
                </div>
            </div>

             {showActions && (
                <div className="flex items-center gap-1">
                     {actions}
                     {onRefresh && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleRefresh}
                            disabled={isRefreshing || isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                     )}
                     {onExpand && (
                        <Button variant="ghost" size="icon" onClick={onExpand}>
                             <Maximize2 className="h-4 w-4" />
                        </Button>
                     )}
                     {onExport && (
                         <Button variant="ghost" size="icon" onClick={onExport}>
                            <Download className="h-4 w-4" />
                         </Button>
                     )}
                </div>
             )}
        </CardHeader>
        <CardContent className="p-6" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
             {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin opacity-25" />
                </div>
             ) : error ? (
                <div className="flex items-center justify-center h-full text-center">
                     <div>
                        <p className="text-destructive font-medium mb-1">Failed to load chart</p>
                        <p className="text-xs text-muted-foreground">{error}</p>
                     </div>
                </div>
             ) : (
                 <div className="h-full w-full">
                     {children}
                 </div>
             )}
        </CardContent>
    </Card>
  );
}
