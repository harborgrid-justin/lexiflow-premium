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
import React from 'react';
import { CheckSquare, Calendar, ArrowRight, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '../../services/queryClient';
import { DataService } from '../../services/dataService';
import { STORES } from '../../services/db';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { NotificationCenter } from '../workflow/NotificationCenter';

// Utils & Constants
import { cn } from '../../utils/cn';

// Types
import type { User, WorkflowTask, CalendarEventItem } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
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

    const { data: allTasks = [], isLoading: tasksLoading, error: tasksError } = useQuery<WorkflowTask[]>(
        [STORES.TASKS, 'all'],
        DataService.tasks.getAll
    );
    
    const { data: allEvents = [], isLoading: eventsLoading, error: eventsError } = useQuery<CalendarEventItem[]>(
        ['calendar', 'all'],
        DataService.calendar.getEvents
    );
    
    // Ensure allTasks and allEvents are arrays even if API fails
    const safeAllTasks = Array.isArray(allTasks) ? allTasks : [];
    const safeAllEvents = Array.isArray(allEvents) ? allEvents : [];
    
    const myTasks = safeAllTasks.filter(t => t.assignee === currentUser.name && t.status !== 'Done');
    const myMeetings = safeAllEvents.filter(e => e.type === 'hearing' || e.type === 'task'); // Simple filter for demo

    const isLoading = tasksLoading || eventsLoading;
    const hasError = tasksError || eventsError;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {isLoading ? (
                <div className="lg:col-span-2 flex justify-center items-center p-12">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-600"/>
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
                                    {myTasks.length === 0 && <p className="text-center text-sm text-slate-500 py-8">No pending tasks assigned to you.</p>}
                                    {myTasks.map((task, i) => (
                                        <div key={i} className={cn("p-4 border rounded-lg flex items-center justify-between transition-colors", theme.surface.default, theme.border.default, `hover:${theme.surface.highlight}`)}>
                                            <div className="flex items-start gap-4">
                                                <div className={cn("p-2 rounded-full", task.priority === 'High' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600")}>
                                                    <CheckSquare className="h-5 w-5"/>
                                                </div>
                                                <div>
                                                    <h4 className={cn("font-bold text-sm", theme.text.primary)}>{task.title}</h4>
                                                    <p className={cn("text-xs", theme.text.secondary)}>{task.caseId} • Due: {task.dueDate}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" icon={ArrowRight}>Start</Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                            
                            <Card title="Upcoming Meetings">
                                <div className="space-y-3">
                                    {myMeetings.slice(0,2).map((event, i) => (
                                         <div key={i} className={cn("flex items-center gap-3 p-3 rounded border-l-4 bg-slate-50", theme.border.default, event.priority === 'High' ? "border-l-red-500" : "border-l-blue-500")}>
                                            <div className="text-center w-12">
                                                <span className="block text-xs font-bold text-slate-500">{new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                                <span className="block text-lg font-bold text-slate-900">{new Date(event.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{event.title}</p>
                                                <p className="text-xs text-slate-500">{event.location || 'TBD'}</p>
                                            </div>
                                        </div>
                                    ))}
                                     {myMeetings.length === 0 && <p className="text-center text-sm text-slate-500 py-4">No upcoming meetings.</p>}
                                </div>
                            </Card>
                        </>
                    )}
                    
                    {activeTab === 'notifications' && (
                        <div className="lg:col-span-2">
                            <NotificationCenter />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
