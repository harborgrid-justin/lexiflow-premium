
import React from 'react';
import { Card } from '../common/Card';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { NotificationCenter } from '../workflow/NotificationCenter';
import { CheckSquare, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

interface PersonalWorkspaceProps {
    activeTab: 'tasks' | 'notifications';
}

export const PersonalWorkspace: React.FC<PersonalWorkspaceProps> = ({ activeTab }) => {
    const { theme } = useTheme();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {activeTab === 'tasks' && (
                <>
                    <Card title="My Priority Tasks" className="lg:col-span-2">
                        <div className="space-y-4">
                            {[
                                { title: 'Review Deposition Transcript', case: 'Martinez v. TechCorp', due: 'Today', priority: 'High' },
                                { title: 'Approve Billing Invoice #4022', case: 'OmniGlobal', due: 'Tomorrow', priority: 'Medium' },
                                { title: 'Draft Engagement Letter', case: 'New Client: Acme', due: 'Apr 12', priority: 'Medium' }
                            ].map((task, i) => (
                                <div key={i} className={cn("p-4 border rounded-lg flex items-center justify-between transition-colors", theme.surface, theme.border.default, `hover:${theme.surfaceHighlight}`)}>
                                    <div className="flex items-start gap-4">
                                        <div className={cn("p-2 rounded-full", task.priority === 'High' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600")}>
                                            <CheckSquare className="h-5 w-5"/>
                                        </div>
                                        <div>
                                            <h4 className={cn("font-bold text-sm", theme.text.primary)}>{task.title}</h4>
                                            <p className={cn("text-xs", theme.text.secondary)}>{task.case} • Due: {task.due}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" icon={ArrowRight}>Start</Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                    
                    <Card title="Upcoming Meetings">
                        <div className="space-y-3">
                            <div className={cn("flex items-center gap-3 p-3 rounded border-l-4 border-l-blue-500 bg-slate-50", theme.border.default)}>
                                <div className="text-center w-12">
                                    <span className="block text-xs font-bold text-slate-500">MAR</span>
                                    <span className="block text-lg font-bold text-slate-900">15</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Partner Meeting</p>
                                    <p className="text-xs text-slate-500">10:00 AM - Conf Room A</p>
                                </div>
                            </div>
                            <div className={cn("flex items-center gap-3 p-3 rounded border-l-4 border-l-green-500 bg-slate-50", theme.border.default)}>
                                <div className="text-center w-12">
                                    <span className="block text-xs font-bold text-slate-500">MAR</span>
                                    <span className="block text-lg font-bold text-slate-900">16</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Client Lunch: TechCorp</p>
                                    <p className="text-xs text-slate-500">12:30 PM - The Capital Grille</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </>
            )}
            
            {activeTab === 'notifications' && (
                <div className="lg:col-span-2">
                    <NotificationCenter />
                </div>
            )}
        </div>
    );
};
