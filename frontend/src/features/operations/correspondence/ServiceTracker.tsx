/**
 * @module components/correspondence/ServiceTracker
 * @category Correspondence
 * @description Process service tracking with delivery confirmation.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { MapPin, Truck, User } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/features/theme';

// Components
import { Badge } from '@/shared/ui/atoms/Badge/Badge';

// Utils & Constants
import { ServiceStatus } from '@/types/enums';
import { cn } from '@/shared/lib/cn';

// Types
import { ServiceJob } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ServiceTrackerProps {
    /** List of service jobs. */
    jobs: ServiceJob[];
    /** Callback when a job is selected. */
    onSelect: (job: ServiceJob) => void;
    /** Currently selected job ID. */
    selectedId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ServiceTracker = React.memo<ServiceTrackerProps>(({ jobs, onSelect, selectedId }) => {
    const { theme } = useTheme();

    const getMethodIcon = useCallback((method: string, _mailType?: string) => {
        if (method === 'Mail') return <Truck className="h-4 w-4 text-purple-600" />;
        return <User className="h-4 w-4 text-blue-600" />;
    }, []);

    const getBadgeVariant = useCallback((status: string) => {
        switch (status) {
            case ServiceStatus.SERVED:
            case ServiceStatus.FILED:
                return 'success';
            case ServiceStatus.OUT_FOR_SERVICE:
                return 'warning';
            case ServiceStatus.NON_EST:
                return 'error';
            default:
                return 'neutral';
        }
    }, []);

    const memoizedJobs = useMemo(() => jobs, [jobs]);

    return (
        <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memoizedJobs.map(job => (
                    <div
                        key={job.id}
                        onClick={() => onSelect(job)}
                        className={cn(
                            "p-5 rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-md group flex flex-col",
                            theme.surface.default,
                            theme.border.default,
                            selectedId === job.id ? "ring-2 ring-blue-500 border-blue-500" : `hover:${theme.primary.border}`
                        )}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <Badge variant={getBadgeVariant(job.status)}>
                                {job.status}
                            </Badge>
                            <span className={cn("text-xs font-mono", theme.text.tertiary)}>{job.id}</span>
                        </div>

                        <h4 className={cn("font-bold text-sm mb-1", theme.text.primary)}>{job.targetPerson}</h4>
                        <div className={cn("text-xs flex items-center mb-4", theme.text.secondary)}>
                            <MapPin className="h-3 w-3 mr-1" /> {job.targetAddress}
                        </div>

                        <div className={cn("mt-auto pt-4 border-t space-y-2", theme.border.default)}>
                            <div className="flex justify-between text-xs">
                                <span className={theme.text.secondary}>Document</span>
                                <span className={cn("font-medium truncate max-w-[120px]", theme.text.primary)}>{job.documentTitle}</span>
                            </div>
                            <div className="flex justify-between text-xs items-center">
                                <span className={theme.text.secondary}>Method</span>
                                <div className="flex items-center gap-1 font-medium">
                                    {getMethodIcon(job.method, job.mailType)}
                                    <span>{job.method === 'Mail' ? 'Mail' : 'Server'}</span>
                                </div>
                            </div>
                            {job.trackingNumber && (
                                <div className="flex justify-between text-xs">
                                    <span className={theme.text.secondary}>Tracking</span>
                                    <span className="font-mono text-[10px]">{job.trackingNumber}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xs">
                                <span className={theme.text.secondary}>Carrier/Agent</span>
                                <span className={theme.text.primary}>{job.serverName}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
ServiceTracker.displayName = 'ServiceTracker';

ServiceTracker.displayName = 'ServiceTracker';
