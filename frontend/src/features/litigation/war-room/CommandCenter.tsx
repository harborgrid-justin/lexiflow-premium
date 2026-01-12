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
import { Activity, AlertCircle, AlertTriangle, CheckSquare, FileText, Users } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';

// Hooks & Context
import { useTheme } from '@/features/theme';

// Components
import { Card } from '@/shared/ui/molecules/Card/Card';
import { MetricCard } from '@/shared/ui/molecules/MetricCard/MetricCard';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// Types
import type { SanctionMotion, WarRoomData } from '@/types';

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
export function CommandCenter({ warRoomData, caseId }: CommandCenterProps) {
    // ============================================================================
    // HOOKS & CONTEXT
    // ============================================================================
    const { theme } = useTheme();

    // ============================================================================
    // DATA FETCHING
    // ============================================================================
    const { data: sanctions = [] } = useQuery<SanctionMotion[]>(
        ['sanctions', caseId],
        () => DataService.discovery.getSanctions(caseId)
    );

    // ============================================================================
    // DERIVED STATE & MEMOIZED VALUES
    // ============================================================================
    const exhibitsTotal = warRoomData.evidence?.length || 0;
    const exhibitsAdmitted = warRoomData.evidence?.filter((e: unknown) => (e as { status: string }).status === 'Admitted').length || 0;
    const witnessCount = warRoomData.witnesses?.length || 0;
    const tasksDue = warRoomData.tasks?.filter((t: unknown) => (t as { priority: string; status: string }).priority === 'High' && (t as { priority: string; status: string }).status !== 'Done').length || 0;
    const recentDocket = warRoomData.docket?.slice().reverse().slice(0, 5) || [];
    const sanctionsCount = sanctions.length;

    const alerts = [
        ...(tasksDue > 0 ? [{ title: 'High Priority Tasks', message: `${tasksDue} tasks require immediate attention`, type: 'warning' }] : []),
        ...(sanctionsCount > 0 ? [{ title: 'Sanctions Filed', message: `${sanctionsCount} active sanction motions`, type: 'critical' }] : []),
        ...(exhibitsAdmitted < exhibitsTotal * 0.5 ? [{ title: 'Low Admissibility', message: 'Less than 50% of exhibits admitted', type: 'info' }] : [])
    ];

    // ============================================================================
    // MAIN RENDER
    // ============================================================================

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Trial Status */}
            <Card className={cn("p-6", theme.surface.raised, "border-2", theme.primary.border)}>
                <div className="flex justify-between items-center">
                    <div className="space-y-1 flex-1">
                        <h2 className={cn("text-2xl font-bold", theme.text.primary)}>{warRoomData.case?.title || 'Case Overview'}</h2>
                        <p className={cn("text-sm", theme.text.secondary)}>Case #: {warRoomData.case?.caseNumber || 'N/A'}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <div className={cn("text-xs font-bold uppercase tracking-wider", theme.text.tertiary)}>Status</div>
                        <div className={cn("text-xl font-bold", theme.primary.text)}>{warRoomData.case?.status || 'Active'}</div>
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
                    {recentDocket.length > 0 ? (
                        <ul className="space-y-3">
                            {recentDocket.map((entry, index) => (
                                <li key={`docket-${entry.date}-${index}`} className={cn("flex items-start justify-between text-sm", theme.text.secondary)}>
                                    <div className="flex-1 pr-4">
                                        <p className={cn("font-medium", theme.text.primary)}>{entry.description}</p>
                                        <span className="text-xs">{new Date(entry.date as string).toLocaleDateString()} - Doc #{index + 1}</span>
                                    </div>
                                    <span className={cn("text-xs font-mono px-2 py-1 rounded", theme.surface.highlight, theme.border.default)}>{entry.type}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={cn("text-center py-8 text-sm", theme.text.tertiary)}>No recent activity</div>
                    )}
                </Card>
                <Card title={<div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Critical Alerts</div>}>
                    <div className="space-y-3">
                        {alerts.length > 0 ? alerts.map((alert, i) => (
                            <div key={`alert-${i}`} className={cn("p-3 rounded-lg flex items-start gap-3 border", theme.surface.highlight, theme.border.default)}>
                                <AlertTriangle className={cn("h-5 w-5 flex-shrink-0", alert.type === 'critical' ? "text-red-500" : "text-amber-500")} />
                                <div>
                                    <div className={cn("font-bold text-sm", theme.text.primary)}>{alert.title}</div>
                                    <div className={cn("text-xs", theme.text.secondary)}>{alert.message}</div>
                                </div>
                            </div>
                        )) : (
                            <div className={cn("text-center py-8 text-sm", theme.text.tertiary)}>No active alerts</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
