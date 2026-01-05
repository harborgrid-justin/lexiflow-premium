
import React, { useTransition, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PageHeader } from './common/PageHeader.tsx';
import { Card } from './common/Card.tsx';
import { Button } from './common/Button.tsx';
import { Badge } from './common/Badge.tsx';
import { DASHBOARD_CHART_DATA, RECENT_ALERTS } from '../data/mockDashboard.ts';
import { Briefcase, Clock, TrendingUp, AlertCircle, ChevronRight, FileText } from 'lucide-react';
import { DateText, MetricCard, Skeleton } from './common/Primitives.tsx';
import { useData, useActions } from '../hooks/useData.ts';

interface DashboardProps {
  onSelectCase: (caseId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectCase }) => {
  const cases = useData(s => s.cases);
  const isLoading = useData(s => s.isLoading);
  const actions = useActions();

  const CHART_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];
  const [isPending, startTransition] = useTransition();

  const handleCaseClick = (id: string) => {
    startTransition(() => {
        onSelectCase(id);
    });
  };

  const activeProjects = useMemo(() => {
    if (isLoading || !cases) return [];
    return cases.slice(0, 3).map(c => ({
        id: `p-${c.id}`, 
        title: `Discovery Review: ${c.client}`, 
        caseId: c.id, 
        case: c.title, 
        progress: c.status === 'Discovery' ? 45 : c.status === 'Trial' ? 85 : 20, 
        status: c.status, 
        due: '3 days'
    }));
  }, [cases, isLoading]);

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in relative">
      {/* Component ID Badge */}
      <div className="absolute top-2 right-6 z-50">
        <span className="bg-slate-900 text-blue-400 font-mono text-[10px] font-black px-2 py-1 rounded border border-slate-700 shadow-xl opacity-0 hover:opacity-100 transition-opacity">
          DS-01
        </span>
      </div>

      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title="Executive Dashboard" 
            subtitle="Overview of firm performance, active matters, and critical deadlines."
            actions={
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 mr-2">Last updated: Just now</span>
                    <Button variant="outline" size="sm" onClick={() => actions.syncData()} disabled={isLoading}>Refresh Data</Button>
                </div>
            }
        />
      </div>

      <div className={`flex-1 overflow-y-auto min-h-0 p-6 pt-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="max-w-[1920px] mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Active Cases" value={cases?.length || 0} icon={Briefcase} trend="+12% YTD" trendUp={true} className="border-l-4 border-l-blue-600" isLoading={isLoading} />
                <MetricCard label="Pending Motions" value="28" icon={FileText} trend="Needs Review" trendUp={false} className="border-l-4 border-l-indigo-500" isLoading={isLoading} />
                <MetricCard label="Billable Hours" value="1,240" icon={Clock} trend="+5% MoM" trendUp={true} className="border-l-4 border-l-emerald-600" isLoading={isLoading} />
                <MetricCard label="High Risk Items" value="12" icon={AlertCircle} trend="Requires Action" trendUp={false} className="border-l-4 border-l-red-600" isLoading={isLoading} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <Card title={<div className="flex items-center justify-between">Case Phases <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border">VZ-01</span></div>}>
                        <div className="h-80 w-full">
                            {isLoading ? (
                                <div className="w-full h-full flex items-end justify-between px-4 pb-4 gap-4">
                                    {[40, 60, 30, 80, 50].map((h, i) => (
                                        <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={DASHBOARD_CHART_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                    {DASHBOARD_CHART_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                    </Bar>
                                </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>

                    <Card title={<div className="flex items-center justify-between">Workstreams <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border">PM-07</span></div>}>
                        <div className="divide-y divide-slate-100">
                            {isLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="py-4 px-2 flex items-center gap-4">
                                        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
                                        <Skeleton className="w-24 h-2 rounded-full" />
                                    </div>
                                ))
                            ) : (
                                activeProjects.map(proj => (
                                    <div key={proj.id} className="flex flex-col sm:flex-row sm:items-center py-4 px-2 hover:bg-slate-50 transition-colors rounded-lg group cursor-pointer" onClick={() => handleCaseClick(proj.caseId)}>
                                        <div className="flex items-center flex-1 min-w-0 mb-2 sm:mb-0">
                                            <div className="p-2 bg-blue-50 rounded-lg mr-4 shrink-0 text-blue-600"><Briefcase className="h-5 w-5"/></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-slate-900 truncate text-sm">{proj.title}</h4>
                                                    <Badge variant={proj.status === 'Finalizing' ? 'success' : 'info'}>{proj.status}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{proj.case} • Due: {proj.due}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 sm:ml-4 w-full sm:w-auto">
                                            <div className="flex-1 sm:w-32">
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${proj.progress}%` }}></div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card title={<div className="flex items-center justify-between">Notifications <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border">FB-24</span></div>}>
                        <div className="space-y-4">
                            {isLoading ? (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex gap-3 items-start p-2">
                                        <Skeleton className="w-5 h-5 rounded shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-3 w-3/4" />
                                            <Skeleton className="h-3 w-full" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                RECENT_ALERTS.map((alert) => (
                                <div key={alert.id} className="relative flex items-start p-4 rounded-lg border transition-all cursor-pointer bg-white border-slate-200 hover:border-blue-300" onClick={() => alert.caseId && handleCaseClick(alert.caseId)}>
                                    <div className={`mt-0.5 mr-3 shrink-0 ${alert.caseId ? 'text-blue-500' : 'text-slate-400'}`}>
                                        {alert.caseId ? <AlertCircle className="h-5 w-5"/> : <TrendingUp className="h-5 w-5"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{alert.message}</p>
                                        <p className="text-xs text-slate-500 line-clamp-2">{alert.detail}</p>
                                        <DateText date={alert.time} className="text-[10px] mt-2" />
                                    </div>
                                </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
