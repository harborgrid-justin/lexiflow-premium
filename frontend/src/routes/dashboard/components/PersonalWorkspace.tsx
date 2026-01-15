/**
 * @module components/dashboard/PersonalWorkspace
 * @category Dashboard
 * @description Personal productivity workspace with tasks and notifications.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
// External
import { ArrowRight, CheckSquare, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Internal
import { queryClient, useQuery } from '@/hooks';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/data/data-service.service';

// Hooks & Context
import { useTheme } from '@/contexts/ThemeContext';
import { useBackendHealth } from '@/hooks/useBackendHealth';

// Components
import { NotificationCenter } from '@/components/organisms/notifications/NotificationCenter';
import { Button } from '@/components/atoms/Button/Button';
import { Card } from '@/components/molecules/Card/Card';

// Utils & Constants
import { cn } from '@/lib/cn';

// Types
import type { CalendarEventItem, User, WorkflowTask } from '@/types';
import { TaskStatusBackend } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface DomainNotification {
    id: string;
    type: "info" | "warning" | "error" | "success";
    title: string;
    message: string;
    read: boolean;
    timestamp: string;
    actionUrl?: string;
    metadata?: unknown;
}

interface PersonalWorkspaceProps {
    /** Active tab in the workspace. */
    activeTab: 'tasks' | 'notifications';
    /** Current user information. */
    currentUser: User;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PersonalWorkspace: React.FC<PersonalWorkspaceProps> = ({ activeTab, currentUser }) => {
    const { theme } = useTheme();
    const { isHealthy, isAvailable } = useBackendHealth();
    // const queryClient = useQueryClient(); // Removed as we import the singleton directly

    const { data: notifications = [] } = useQuery<DomainNotification[]>(
        ['notifications'],
        () => DataService.notifications.getNotifications() as unknown as Promise<DomainNotification[]>
    );

    const handleMarkAsRead = async (id: string) => {
        await DataService.notifications.update(id, { read: true });
        queryClient.invalidate(['notifications']);
    };

    const handleMarkAllAsRead = async () => {
        // Assuming DataService.notifications has a method for this, or we iterate
        // Since we don't have markAllAsRead in DataService.notifications (based on previous read),
        // we might need to implement it or iterate.
        // For now, let's iterate over unread notifications.
        const unread = notifications.filter(n => !n.read);
        await Promise.all(unread.map(n => DataService.notifications.update(n.id, { read: true })));
        // queryClient.invalidateQueries?.(['notifications']);
    };

    const handleDeleteNotification = async (id: string) => {
        await DataService.notifications.delete(id);
        // queryClient.invalidateQueries?.(['notifications']);
    };

    const [allTasks, setAllTasks] = useState<WorkflowTask[]>([]);
    const [allEvents, setAllEvents] = useState<CalendarEventItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [tasksData, eventsData] = await Promise.all([
                    DataService.tasks.getAll?.() || Promise.resolve([]),
                    DataService.calendar.getEvents?.() || Promise.resolve([])
                ]);
                setAllTasks(tasksData);
                setAllEvents(eventsData);
            } catch (err) {
                console.error('[PersonalWorkspace] Failed to load data:', err);
                setError('Failed to load workspace data');
                setAllTasks([]);
                setAllEvents([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Only load if backend is available, otherwise retry when it becomes available
        if (isAvailable && isHealthy) {
            loadData();
        }
    }, [isAvailable, isHealthy]);

    // Ensure allTasks and allEvents are arrays even if API fails
    const safeAllTasks = Array.isArray(allTasks) ? allTasks : [];
    const safeAllEvents = Array.isArray(allEvents) ? allEvents : [];

    const myTasks = safeAllTasks.filter((t: WorkflowTask) => t.assignee === currentUser?.name && !(t.status === TaskStatusBackend.COMPLETED));
    const myMeetings = safeAllEvents.filter(e => e.type === 'hearing' || e.type === 'task');

    const hasError = error || (!isAvailable || !isHealthy);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {isLoading ? (
                <div className="lg:col-span-2 flex justify-center items-center p-12">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                </div>
            ) : hasError ? (
                <div className="lg:col-span-2">
                    <Card title="Connection Issue">
                        <div className="text-center py-8">
                            <p className={cn("text-sm mb-2", theme.text.secondary)}>
                                Unable to load data. Please ensure the backend is running.
                            </p>
                            <p className={cn("text-xs", theme.text.tertiary)}>
                                Working in offline mode with cached data.
                            </p>
                        </div>
                    </Card>
                </div>
            ) : (
                <>
                    {activeTab === 'tasks' && (
                        <>
                            <Card title="My Priority Tasks" className="lg:col-span-2">
                                <div className="space-y-4">
                                    {myTasks.length === 0 &&
                                        <p className="text-center text-sm text-slate-500 py-8">No pending tasks assigned
                                            to you.</p>}
                                    {myTasks.map((task: WorkflowTask) => (
                                        <div key={`task-${task.caseId}-${task.title}`}
                                            className={cn("p-4 border rounded-lg flex items-center justify-between transition-colors", theme.surface.default, theme.border.default, `hover:${theme.surface.highlight}`)}>

                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={cn("p-2 rounded-full", task.priority === 'High' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600")}>
                                                    <CheckSquare className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className={cn("font-bold text-sm", theme.text.primary)}>{task.title}</h4>
                                                    <p className={cn("text-xs", theme.text.secondary)}>{task.caseId} •
                                                        Due: {task.dueDate}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" icon={ArrowRight}>Start</Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card title="Upcoming Meetings">
                                <div className="space-y-3">
                                    {myMeetings.slice(0, 2).map((event) => (
                                        <div key={`meeting-${event.date}-${event.priority}`}
                                            className={cn("flex items-center gap-3 p-3 rounded border-l-4 bg-slate-50", theme.border.default, event.priority === 'High' ? "border-l-red-500" : "border-l-blue-500")}>
                                            <div className="text-center w-12">
                                                <span
                                                    className="block text-xs font-bold text-slate-500">{new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                                <span
                                                    className="block text-lg font-bold text-slate-900">{new Date(event.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{event.title}</p>
                                                <p className="text-xs text-slate-500">{event.location || 'TBD'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {myMeetings.length === 0 &&
                                        <p className="text-center text-sm text-slate-500 py-4">No upcoming
                                            meetings.</p>}
                                </div>
                            </Card>
                        </>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="lg:col-span-2">
                            <NotificationCenter
                                notifications={notifications.map((n) => ({
                                    ...n,
                                    timestamp: new Date(n.timestamp).getTime(),
                                    priority: "low" as const,
                                    type: n.type === 'success' ? 'info' : n.type,
                                    metadata: (n.metadata as Record<string, unknown>) || {}
                                }))}
                                unreadCount={
                                    notifications.filter((n) => !n.read).length
                                }
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAllAsRead={handleMarkAllAsRead}
                                onDelete={handleDeleteNotification}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
