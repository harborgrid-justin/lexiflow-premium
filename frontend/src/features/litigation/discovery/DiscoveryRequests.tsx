/**
 * @module components/discovery/DiscoveryRequests
 * @category Discovery
 * @description Discovery request tracking table with status indicators and due dates.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { CheckSquare, Upload, Wand2 } from 'lucide-react';
import React, { useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TaskCreationModal } from '@/features/cases/ui/components/TaskCreationModal/TaskCreationModal';
import { VirtualList } from '@/shared/ui/organisms/VirtualList/VirtualList';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';

// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useToggle } from '@/shared/hooks/useToggle';
import { useWindow } from '@/providers';

// Utils
import { DiscoveryRequestStatusEnum } from '@/types/enums';
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { DiscoveryRequest } from '@/types';
import { DiscoveryRequestsProps } from './types';

const DiscoveryRequestsComponent: React.FC<DiscoveryRequestsProps> = ({ onNavigate, items = [] }) => {
    const { theme } = useTheme();
    const { openWindow, closeWindow } = useWindow();
    const filtersToggle = useToggle();

    // Memoized: Calculate days remaining
    const getDaysRemaining = useCallback((dueDate: string) => {
        if (!dueDate) return 0;
        const due = new Date(dueDate);
        const now = new Date();
        const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    }, []);

    // Memoized: Badge variant logic
    const getBadgeVariant = useCallback((status: string) => {
        switch (status) {
            case DiscoveryRequestStatusEnum.OVERDUE: return 'error';
            case DiscoveryRequestStatusEnum.RESPONDED: return 'success';
            default: return 'info';
        }
    }, []);

    const handleCreateTask = useCallback((req: DiscoveryRequest, e: React.MouseEvent) => {
        e.stopPropagation();
        const winId = `task-create-${req.id}`;
        openWindow(
            winId,
            'Create Discovery Task',
            <div className="p-4">
                <TaskCreationModal
                    isOpen={true}
                    onClose={() => closeWindow(winId)}
                    initialTitle={`Respond to: ${req.title}`}
                    relatedModule="Discovery"
                    relatedItemId={req.id}
                    relatedItemTitle={req.title}
                />
            </div>
        );
    }, [openWindow, closeWindow]);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        'mod+n': () => {
            // Navigate to new request form
            onNavigate('requests');
        },
        'mod+f': () => {
            filtersToggle.toggle();
        }
    });

    const renderRow = useCallback((req: DiscoveryRequest) => {
        const daysLeft = req.dueDate ? getDaysRemaining(req.dueDate) : 0;
        return (
            <div key={req.id} onClick={() => onNavigate('response', req.id)} className={cn("flex items-center border-b h-[72px] px-6 transition-colors cursor-pointer group", theme.border.default, `hover:${theme.surface.highlight}`)}>
                <div className="w-[30%] pr-4">
                    <div className="flex flex-col">
                        <span className={cn("font-medium truncate", theme.text.primary)}>{req.title}</span>
                        <span className={cn("text-xs font-mono", theme.text.secondary)}>{req.id}</span>
                    </div>
                </div>
                <div className="w-[15%]"><Badge variant="neutral">{req.type}</Badge></div>
                <div className="w-[15%] text-sm text-slate-600">{req.serviceDate}</div>
                <div className="w-[20%]">
                    <div className="flex flex-col">
                        <span className={cn("font-medium text-sm", theme.text.primary)}>{req.dueDate}</span>
                        {req.status !== 'Responded' && (
                            <span className={`text-[10px] font-bold ${daysLeft < 5 ? 'text-red-600' : theme.text.secondary}`}>
                                {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
                            </span>
                        )}
                    </div>
                </div>
                <div className="w-[10%]">
                    <Badge variant={getBadgeVariant(req.status)}>
                        {req.status}
                    </Badge>
                </div>
                <div className="w-[10%] flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className={theme.text.secondary} icon={CheckSquare} onClick={(e: React.MouseEvent) => handleCreateTask(req, e)} title="Create Task" />
                    {req.type === 'Production' && (
                        <Button size="sm" variant="outline" icon={Upload} onClick={() => onNavigate('production_wizard', req.id)} title="Produce">
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" icon={Wand2} onClick={() => onNavigate('response', req.id)} title="Draft Response">
                    </Button>
                </div>
            </div>
        );
    }, [theme, getBadgeVariant, handleCreateTask, onNavigate, getDaysRemaining]);

    return (
        <div className="animate-fade-in space-y-4 h-full flex flex-col">
            {/* Desktop Table */}
            <div className={cn("hidden md:flex flex-col flex-1 border rounded-lg overflow-hidden", theme.surface.default, theme.border.default)}>
                <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider shrink-0", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                    <div className="w-[30%]">Request</div>
                    <div className="w-[15%]">Type</div>
                    <div className="w-[15%]">Service Date</div>
                    <div className="w-[20%]">Deadline</div>
                    <div className="w-[10%]">Status</div>
                    <div className="w-[10%] text-right">Action</div>
                </div>

                <div className="flex-1 relative">
                    <VirtualList
                        items={items}
                        height="100%"
                        itemHeight={72}
                        renderItem={renderRow}
                        emptyMessage="No discovery requests found."
                    />
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {items.map((req) => {
                    const daysLeft = getDaysRemaining(req.dueDate);
                    return (
                        <div
                            key={req.id}
                            onClick={() => onNavigate('response', req.id)}
                            className={cn("p-4 rounded-lg shadow-sm border cursor-pointer active:scale-[0.98] transition-transform", theme.surface.default, theme.border.default)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn("text-xs font-mono", theme.text.secondary)}>{req.id}</span>
                                <Badge variant={req.status === 'Overdue' ? 'error' : req.status === 'Responded' ? 'success' : 'info'}>
                                    {req.status}
                                </Badge>
                            </div>
                            <h4 className={cn("font-bold mb-1", theme.text.primary)}>{req.title}</h4>
                            <div className="flex gap-2 mb-3">
                                <Badge variant="neutral">{req.type}</Badge>
                            </div>

                            <div className={cn("flex justify-between items-center text-xs p-2 rounded mb-3", theme.surface.highlight, theme.text.secondary)}>
                                <span className="flex items-center">Due: {req.dueDate}</span>
                                {req.status !== 'Responded' && (
                                    <span className={`font-bold ${daysLeft < 5 ? 'text-red-600' : theme.text.secondary}`}>
                                        {daysLeft < 0 ? 'OVERDUE' : `${daysLeft}d left`}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                                <Button size="sm" variant="ghost" icon={CheckSquare} onClick={(e: React.MouseEvent) => handleCreateTask(req, e)}>Task</Button>
                                {req.type === 'Production' && (
                                    <Button size="sm" variant="outline" icon={Upload} onClick={() => onNavigate('production_wizard', req.id)}>
                                        Produce
                                    </Button>
                                )}
                                <Button size="sm" variant="ghost" icon={Wand2} onClick={() => onNavigate('response', req.id)}>
                                    Draft
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Memoized export for performance optimization
export const DiscoveryRequests = React.memo(DiscoveryRequestsComponent);

export default DiscoveryRequests;
