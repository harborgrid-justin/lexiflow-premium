
/**
 * @module components/war-room/CommandCenter
 * @category WarRoom
 * @description Central dashboard for the War Room, displaying key metrics, status, and recent activity.
 * Provides navigation to other War Room modules.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors for backgrounds,
 * text, and borders, ensuring a consistent look in both light and dark modes.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { CheckSquare, FileText, Activity, AlertCircle, Users, ArrowRight, AlertTriangle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services';
import { useQuery } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { Card } from '@/components/molecules/Card';
import { MetricCard } from '@/components/molecules/MetricCard';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import type { WarRoomData, SanctionMotion } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface CommandCenterProps {
  /** The ID of the current case. */
  caseId: string;
  /** The comprehensive data object for the war room. */
  warRoomData: WarRoomData;
  /** Callback function to handle navigation to other views. */
  onNavigate: (view: string, context?: Record<string, unknown>) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================
export function CommandCenter({ caseId, warRoomData, onNavigate }: CommandCenterProps) {
  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const { theme } = useTheme();
  
  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const { data: sanctions = [] } = useQuery<SanctionMotion[]>(
    ['sanctions', 'all'], 
    DataService.discovery.getSanctions
  );
  
  // ============================================================================
  // DERIVED STATE & MEMOIZED VALUES
  // ============================================================================
  const exhibitsTotal = warRoomData.evidence?.length || 0;
  const exhibitsAdmitted = warRoomData.evidence?.filter((e: any) => e.status === 'Admitted').length || 0;
  const witnessCount = warRoomData.witnesses?.length || 0;
  const tasksDue = warRoomData.tasks?.filter((t: any) => t.priority === 'High' && t.status !== 'Done').length || 0;
  const recentDocket = warRoomData.docket?.slice().reverse().slice(0, 5) || [];
  const sanctionsCount = sanctions.length;

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  // Skeleton component
  const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Trial Status - Skeleton Loader */}
        <Card className={cn("p-6", theme.surface.raised, "border-2", theme.primary.border)}>
            <div className="flex justify-between items-center">
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="text-right space-y-3">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-36" />
                </div>
            </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
                label="Exhibits Admitted" 
                value={`${exhibitsAdmitted} / ${exhibitsTotal}`} 
                icon={FileText}
            />
            <MetricCard 
                label="Witnesses Ready" 
                value={`${witnessCount}`} 
                icon={Users}
            />
            <MetricCard 
                label="High-Priority Tasks" 
                value={tasksDue} 
                icon={CheckSquare}
            />
            <MetricCard 
                label="Sanctions Filed" 
                value={sanctionsCount} 
                icon={AlertTriangle}
            />
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title={<div className="flex items-center gap-2"><Activity className="h-5 w-5" /> Recent Docket Activity</div>}>
                    <ul className="space-y-3">
                        {recentDocket.map((entry, index) => (
                            <li key={index} className={cn("flex items-start justify-between text-sm", theme.text.secondary)}>
                                <div className="flex-1 pr-4">
                                    <p className={cn("font-medium", theme.text.primary)}>{entry.description}</p>
                                    <span className="text-xs">{new Date(entry.date as string).toLocaleDateString()} - Doc #{index + 1}</span>
                                </div>
                                <span className={cn("text-xs font-mono px-2 py-1 rounded", theme.surface.highlight, theme.border.default)}>{entry.type}</span>
                            </li>
                        ))}
                    </ul>
            </Card>
            <Card title={<div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Critical Alerts</div>}>
                    <div className="space-y-3">
                        {/* Skeleton loaders for alerts */}
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className={cn("p-3 rounded-lg flex items-start gap-3", theme.surface.highlight, "border", theme.border.default)}>
                                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-5/6" />
                                    <Skeleton className="h-6 w-24 mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
            </Card>
        </div>
    </div>
  );
}

