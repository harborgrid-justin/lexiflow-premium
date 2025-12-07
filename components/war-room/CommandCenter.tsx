
import React from 'react';
import { Card } from '../common/Card';
import { MetricCard } from '../common/Primitives';
import { CheckSquare, FileText, Activity, AlertCircle, Users, ArrowRight, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { DataService } from '../../services/dataService';
import { WarRoomData, WorkflowTask, DocketEntry, Motion, SanctionMotion } from '../../types';

interface CommandCenterProps {
  caseId: string;
  warRoomData: WarRoomData;
  onNavigate: (view: string, context?: any) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ caseId, warRoomData, onNavigate }) => {
  const { theme, mode } = useTheme();
  
  // New Live Data
  const { data: sanctions = [] } = useQuery<SanctionMotion[]>([STORES.SANCTIONS, 'all'], DataService.discovery.getSanctions);
  
  // Derive stats from passed data
  const exhibitsTotal = warRoomData.evidence?.length || 0;
  const exhibitsAdmitted = warRoomData.evidence?.filter((e) => e.status === 'Admitted').length || 0;
  const witnessCount = warRoomData.witnesses?.length || 0;
  const tasksDue = warRoomData.tasks?.filter((t) => t.priority === 'High' && t.status !== 'Done').length || 0;
  const recentDocket = warRoomData.docket?.slice().reverse().slice(0, 5) || [];
  const sanctionsCount = sanctions.length;

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Countdown & Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={cn("rounded-lg p-5 border shadow-sm flex flex-col justify-between h-full bg-slate-900 text-white border-slate-800")}>
                <div className="flex justify-between items-start">
                    <p className="text-xs font-bold uppercase text-slate-400">Status Monitor</p>
                    <Activity className="h-5 w-5 text-green-400 animate-pulse"/>
                </div>
                <div className="mt-4">
                    <p className="text-xl font-mono font-bold truncate">{warRoomData.case.status}</p>
                    <p className="text-sm text-slate-400">{warRoomData.case.jurisdiction}</p>
                </div>
            </div>
            
            <div className="cursor-pointer" onClick={() => onNavigate('evidence')}>
                <MetricCard 
                    label="Exhibits / Evidence" 
                    value={`${exhibitsTotal}`} 
                    icon={FileText} 
                    trend={exhibitsAdmitted > 0 ? `${exhibitsAdmitted} Admitted` : 'Preparation Phase'}
                    className="border-l-4 border-l-blue-600 h-full hover:shadow-md transition-all"
                />
            </div>
            <div className="cursor-pointer" onClick={() => onNavigate('witnesses')}>
                <MetricCard 
                    label="Witnesses / Parties" 
                    value={witnessCount} 
                    icon={Users} 
                    trend="Active Roster"
                    className="border-l-4 border-l-purple-600 h-full hover:shadow-md transition-all"
                />
            </div>
            
            {sanctionsCount > 0 ? (
                 <MetricCard 
                    label="Active Sanctions" 
                    value={sanctionsCount} 
                    icon={AlertTriangle} 
                    trend="Discovery Dispute"
                    className="border-l-4 border-l-red-600 h-full"
                    trendUp={false}
                />
            ) : (
                <MetricCard 
                    label="Pending Tasks" 
                    value={tasksDue} 
                    icon={AlertCircle} 
                    trend="High Priority"
                    className="border-l-4 border-l-amber-500 h-full"
                />
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Briefing */}
            <div className="lg:col-span-2 space-y-6">
                <Card title="Case Briefing" subtitle={`Recent Activity for ${caseId}`}>
                    <div className="space-y-4">
                        <div className={cn("p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 border-blue-100 border text-sm text-blue-900", mode === 'dark' ? "bg-blue-900/20 border-blue-800 text-blue-200" : "")}>
                            <h4 className="font-bold mb-1">Strategy Focus</h4>
                            <p>{warRoomData.case.description || 'No strategy description available.'}</p>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className={cn("font-bold text-sm uppercase mb-2", theme.text.secondary)}>Recent Docket Activity</h4>
                            {recentDocket.length === 0 && <p className={cn("text-xs italic", theme.text.tertiary)}>No recent docket entries.</p>}
                            {recentDocket.map((item) => (
                                <div 
                                    key={item.id} 
                                    className={cn(
                                        "flex items-start p-3 rounded border transition-colors", 
                                        theme.surface, theme.border.default
                                    )}
                                >
                                    <div className={cn("w-24 font-mono text-xs font-bold shrink-0", theme.text.secondary)}>{item.date}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className={cn("font-medium text-sm truncate", theme.text.primary)} title={item.title}>{item.title}</div>
                                        <div className={cn("text-xs truncate", theme.text.tertiary)}>{item.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="Pending Motions">
                    <div className="space-y-3">
                        {warRoomData.motions && warRoomData.motions.length > 0 ? (
                            warRoomData.motions.filter((m) => m.status !== 'Decided').slice(0, 3).map((m) => (
                                <div 
                                    key={m.id}
                                    className={cn("flex justify-between items-center p-3 border rounded-lg cursor-pointer transition-colors", theme.surfaceHighlight, theme.border.default, `hover:${theme.surface}`)}
                                    onClick={() => onNavigate('binder')}
                                >
                                    <div>
                                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded border mb-1 inline-block", theme.primary.light, theme.primary.text, theme.primary.border)}>{m.type}</span>
                                        <p className={cn("text-sm font-bold mt-1", theme.text.primary)}>{m.title}</p>
                                    </div>
                                    <span className={cn("text-xs", theme.text.secondary)}>{m.status}</span>
                                </div>
                            ))
                        ) : (
                            <p className={cn("text-sm italic text-center py-4", theme.text.tertiary)}>No pending motions.</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Team Status & Tasks */}
            <div className="space-y-6">
                <Card title="Key Parties">
                    <div className="space-y-4">
                        {warRoomData.witnesses?.slice(0, 4).map((member, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={cn("w-2 h-2 rounded-full shrink-0", member.type === 'Corporation' ? 'bg-blue-500' : 'bg-green-500')}></div>
                                    <div className="min-w-0">
                                        <p className={cn("text-sm font-bold truncate", theme.text.primary)}>{member.name}</p>
                                        <p className={cn("text-xs truncate", theme.text.secondary)}>{member.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Active Tasks">
                    <div className="space-y-2">
                        {warRoomData.tasks?.slice(0, 5).map((task, i) => (
                            <div key={i} className={cn("flex items-start gap-3 p-2 rounded transition-colors cursor-pointer group", `hover:${theme.surfaceHighlight}`)}>
                                <CheckSquare className={cn("h-4 w-4 mt-0.5 shrink-0 group-hover:text-blue-600", theme.text.tertiary)}/>
                                <span className={cn("text-sm truncate", theme.text.secondary, "group-hover:text-slate-900 dark:group-hover:text-slate-100")}>{task.title}</span>
                            </div>
                        ))}
                        {(!warRoomData.tasks || warRoomData.tasks.length === 0) && (
                             <p className={cn("text-xs italic", theme.text.tertiary)}>No active tasks.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};
