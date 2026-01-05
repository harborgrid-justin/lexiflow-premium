
import React from 'react';
import { MetricCard } from '../common/Primitives.tsx';
import { CheckSquare, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card.tsx';

export const AssociateDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">My Workspace</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard label="Billable Today" value="5.2h" icon={Clock} trend="Target: 7.5h" className="border-l-4 border-l-blue-500"/>
                <MetricCard label="Open Tasks" value="8" icon={CheckSquare} trend="2 Due Today" className="border-l-4 border-l-amber-500"/>
                <MetricCard label="Upcoming Hearings" value="1" icon={Calendar} trend="Next: Friday" className="border-l-4 border-l-purple-500"/>
                <MetricCard label="Missing Time" value="0.5h" icon={AlertCircle} trend="Review Yesterday" className="border-l-4 border-l-red-500"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Today's Priorities" className="lg:col-span-2">
                    <div className="space-y-3">
                        {[
                            { task: 'Draft Motion to Compel', case: 'Martinez v. TechCorp', time: '2h est', priority: 'High' },
                            { task: 'Client Call Prep', case: 'State v. GreenEnergy', time: '1h est', priority: 'Medium' },
                            { task: 'Review Discovery Production', case: 'OmniGlobal Merger', time: '3h est', priority: 'Medium' },
                        ].map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${t.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{t.task}</p>
                                        <p className="text-xs text-slate-500">{t.case}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">{t.time}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Recent Activity">
                    <div className="space-y-4 relative pl-4 border-l-2 border-slate-100">
                        {[
                            { action: 'Uploaded Document', target: 'Exhibit A.pdf', time: '10 mins ago' },
                            { action: 'Logged Time', target: '0.8h - Research', time: '1 hour ago' },
                            { action: 'Completed Task', target: 'Conflict Check', time: '3 hours ago' },
                        ].map((a, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-slate-200 rounded-full border-2 border-white"></div>
                                <p className="text-sm font-medium text-slate-800">{a.action}</p>
                                <p className="text-xs text-slate-500">{a.target}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{a.time}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
