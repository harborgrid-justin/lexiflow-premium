/**
 * @module components/dashboard/DashboardSidebar
 * @category Dashboard
 * @description Sidebar panel displaying firm alerts, notifications, and billing statistics.
 *
 * THEME SYSTEM USAGE:
 * This hook uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertCircle, ArrowRight, FileText, TrendingUp } from 'lucide-react';
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useBillingStats } from '../hooks/useDashboardData';

// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Components
import { Button } from '@/components/ui/atoms/Button/Button';
import { DateText } from '@/components/ui/atoms/DateText/DateText';
import { Card } from '@/components/ui/molecules/Card/Card';
import { EmptyState } from '@/components/ui/molecules/EmptyState/EmptyState';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface DashboardAlert {
    id: number | string;
    message: string;
    detail: string;
    time: string;
    caseId: string | null;
}

interface DashboardSidebarProps {
    /** Callback when a case is selected from an alert. */
    onSelectCase: (caseId: string) => void;
    /** Array of dashboard alerts to display. */
    alerts: DashboardAlert[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onSelectCase, alerts }) => {
    const { theme } = useTheme();

    // Data Fetching via the centralized hook system
    const { billingStats } = useBillingStats();

    return (
        <div className="space-y-6">
            <Card title="Firm Alerts" subtitle="Notifications & critical updates" className="h-full">
                <div className="space-y-3">
                    {alerts.length === 0 ? (
                        <EmptyState
                            icon={AlertCircle}
                            title="No alerts"
                            description="All clear! No critical updates at this time."
                            className="py-6"
                        />
                    ) : (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={cn(
                                    "relative flex items-start p-3 rounded-lg border transition-all cursor-pointer group",
                                    alert.caseId
                                        ? cn(theme.surface.default, theme.border.default, "hover:border-blue-400 hover:shadow-sm")
                                        : cn(theme.surface.highlight, theme.border.default)
                                )}
                                onClick={() => alert.caseId && onSelectCase(alert.caseId)}
                            >
                                <div
                                    className={cn("mt-0.5 mr-3 shrink-0", alert.caseId ? "text-blue-500" : "text-slate-400")}>
                                    {alert.caseId ? <AlertCircle className="h-5 w-5" /> :
                                        <TrendingUp className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-sm font-semibold leading-tight mb-1", theme.text.primary)}>
                                        {alert.message}
                                    </p>
                                    <p className={cn("text-xs line-clamp-2", theme.text.secondary)}>
                                        {alert.detail}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <DateText date={alert.time} className="text-[10px] font-medium opacity-70" />
                                        {alert.caseId && (
                                            <span className={cn(
                                                "text-[10px] font-bold flex items-center opacity-0 group-hover:opacity-100 transition-opacity",
                                                theme.primary.text
                                            )}>
                                                View Matter <ArrowRight className="h-2 w-2 ml-1" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className={cn("mt-6 pt-4 border-t text-center", theme.border.default)}>
                    <Button variant="ghost" size="sm"
                        className={cn("text-xs uppercase tracking-wide", theme.text.secondary)}>
                        View Notification Center
                    </Button>
                </div>
            </Card>

            {/* Billing Cycle Overlay Card */}
            <div className={cn("rounded-xl p-6 shadow-xl border", theme.surface.overlay, theme.text.inverse)}>
                <div className="flex items-center mb-6">
                    <div className="p-2.5 bg-white/10 rounded-lg mr-4 border border-white/10">
                        <FileText className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg leading-none">Billing Cycle</h4>
                        <p className="text-xs opacity-70 mt-1">Current Period: {billingStats?.month}</p>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-xs font-bold opacity-50 uppercase mb-1">Realization</p>
                        <p className="text-2xl font-mono font-bold text-green-400">{billingStats?.realization}%</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold opacity-50 uppercase mb-1">Total Billed</p>
                        <p className="text-xl font-mono font-bold text-blue-400">
                            ${((billingStats?.totalBilled || 0) / 1000).toFixed(0)}k
                        </p>
                    </div>
                </div>

                {/* Realization Progress Bar */}
                <div className="w-full bg-black/20 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${billingStats?.realization}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
