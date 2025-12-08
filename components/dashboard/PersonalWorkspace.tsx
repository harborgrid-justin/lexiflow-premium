
import React from 'react';
import { Card } from '../common/Card';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { NotificationCenter } from '../workflow/NotificationCenter';
import { CheckSquare, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { User, WorkflowTask, CalendarEventItem } from '../../types';
import { useQuery } from '../../services/queryClient';
import { DataService } from '../../services/dataService';
import { STORES } from '../../services/db';

interface PersonalWorkspaceProps {
    activeTab: 'tasks' | 'notifications';
    currentUser: User;
}

export const PersonalWorkspace: React.FC<PersonalWorkspaceProps> = ({ activeTab, currentUser }) => {
    const { theme } = useTheme();

    const { data: allTasks = [], isLoading: tasksLoading } = useQuery<WorkflowTask[]>(
        [STORES.TASKS, 'all'],
        DataService.tasks.getAll
    );
    
    const { data: allEvents = [], isLoading: eventsLoading } = useQuery<CalendarEventItem[]>(
        ['calendar', 'all'],
        DataService.calendar.getEvents
    );
    
    const myTasks = allTasks.filter(t => t.assignee === currentUser.name && t.status !== 'Done');
    const myMeetings = allEvents.filter(e => e.type === 'hearing' || e.type === 'task'); // Simple filter for demo

    const isLoading = tasksLoading || eventsLoading;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {isLoading ? <div className="lg:col-span-2 flex justify-center items-center p-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600"/></div> : (
                <>
                    {activeTab === 'tasks' && (
                        <>
                            <Card title="My Priority Tasks" className="lg:col-span-2">
                                <div className="space-y-4">
                                    {myTasks.length === 0 && <p className="text-center text-sm text-slate-500 py-8">No pending tasks assigned to you.</p>}
                                    {myTasks.map((task, i) => (
                                        <div key={i} className={cn("p-4 border rounded-lg flex items-center justify-between transition-colors", theme.surface, theme.border.default, `hover:${theme.surfaceHighlight}`)}>
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
