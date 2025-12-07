
import React, { useState, useEffect } from 'react';
import { GitMerge, RefreshCw, Clock, Activity, CheckCircle, XCircle, Play, FileText, ChevronRight, Database, Cloud, Server, Settings, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Tabs } from '../../common/Tabs';
import { Button } from '../../common/Button';
import { DataService } from '../../../services/dataService';
import { useQuery } from '../../../services/queryClient';
import { PipelineJob } from '../../../types';

interface PipelineMonitorProps {
    initialTab?: string;
}

export const PipelineMonitor: React.FC<PipelineMonitorProps> = ({ initialTab = 'monitor' }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'monitor' | 'connectors'>('monitor');
  const [selectedJob, setSelectedJob] = useState<PipelineJob | null>(null);
  
  useEffect(() => {
      if (initialTab === 'connectors') setActiveTab('connectors');
      else setActiveTab('monitor');
  }, [initialTab]);
  
  // Integrated Data Query
  const { data: pipelines = [], isLoading, refetch } = useQuery<PipelineJob[]>(
      ['admin', 'pipelines'],
      DataService.admin.getPipelines
  );

  const connectors = [
      { id: 'c1', name: 'PostgreSQL Production', type: 'Database', status: 'Healthy', icon: Database, color: 'text-blue-600' },
      { id: 'c2', name: 'Snowflake Warehouse', type: 'Warehouse', status: 'Healthy', icon: Cloud, color: 'text-sky-500' },
      { id: 'c3', name: 'Salesforce CRM', type: 'SaaS', status: 'Syncing', icon: Cloud, color: 'text-indigo-600' },
      { id: 'c4', name: 'AWS S3 Data Lake', type: 'Storage', status: 'Healthy', icon: Server, color: 'text-amber-600' },
      { id: 'c5', name: 'Redis Cache', type: 'Cache', status: 'Degraded', icon: Database, color: 'text-red-600' },
  ];

  const handleRun = (id: string) => {
      alert(`Triggered run for pipeline ${id}`);
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className={cn("flex flex-col h-full", theme.background)}>
        <div className={cn("px-6 pt-4 border-b shrink-0", theme.border.default)}>
             <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className={cn("text-xl font-bold", theme.text.primary)}>ETL Pipelines</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Data Orchestration & Connectivity</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={RefreshCw} onClick={() => refetch()}>Refresh</Button>
                    {activeTab === 'connectors' && <Button variant="primary" icon={Plus}>Add Connection</Button>}
                </div>
            </div>
            <Tabs 
                tabs={[
                    { id: 'monitor', label: 'DAG Monitor', icon: Activity },
                    { id: 'connectors', label: 'Connectors', icon: Database }
                ]}
                activeTab={activeTab}
                onChange={(t) => setActiveTab(t as any)}
            />
        </div>

        {activeTab === 'monitor' && (
            <div className="flex flex-1 overflow-hidden relative">
                {/* List - Hidden on mobile when detailed is selected */}
                <div className={cn(
                    "flex-1 p-6 overflow-y-auto space-y-4 w-full lg:w-1/2 lg:border-r transition-all duration-300", 
                    theme.border.default,
                    selectedJob ? "hidden lg:block" : "block"
                )}>
                    {pipelines.map((p) => (
                        <div 
                            key={p.id} 
                            onClick={() => setSelectedJob(p)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md",
                                selectedJob?.id === p.id 
                                    ? cn(theme.primary.light, theme.primary.border, "ring-1 ring-blue-300") 
                                    : cn(theme.surface, theme.border.default)
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-full", 
                                    p.status === 'Running' ? "bg-blue-100 text-blue-600 animate-pulse" : 
                                    p.status === 'Failed' ? "bg-red-100 text-red-600" : 
                                    p.status === 'Success' ? "bg-green-100 text-green-600" :
                                    cn(theme.surfaceHighlight, theme.text.secondary)
                                )}>
                                    {p.status === 'Running' ? <Activity className="h-5 w-5"/> : p.status === 'Failed' ? <XCircle className="h-5 w-5"/> : <GitMerge className="h-5 w-5"/>}
                                </div>
                                <div>
                                    <h4 className={cn("font-bold text-sm", theme.text.primary)}>{p.name}</h4>
                                    <div className={cn("flex items-center gap-3 text-xs mt-1", theme.text.secondary)}>
                                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1"/> {p.lastRun}</span>
                                        <span>{p.schedule}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", 
                                    p.status === 'Running' ? "bg-blue-50 border-blue-200 text-blue-700" :
                                    p.status === 'Failed' ? "bg-red-50 border-red-200 text-red-700" :
                                    p.status === 'Success' ? "bg-green-50 border-green-200 text-green-700" :
                                    cn(theme.surfaceHighlight, theme.border.default, theme.text.secondary)
                                )}>{p.status}</span>
                                <ChevronRight className={cn("h-4 w-4", theme.text.tertiary)}/>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Details Panel - Full width on mobile when active */}
                <div className={cn(
                    "flex-1 flex flex-col h-full lg:w-1/2 absolute lg:static inset-0 z-10 transition-transform duration-300",
                    theme.surface,
                    selectedJob ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:hidden"
                )}>
                    {selectedJob ? (
                        <>
                            <div className={cn("p-6 border-b flex justify-between items-start", theme.border.default, theme.surfaceHighlight)}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {/* Mobile Back Button */}
                                        <button 
                                            onClick={() => setSelectedJob(null)} 
                                            className={cn("lg:hidden p-1 rounded hover:bg-slate-200 mr-2", theme.text.secondary)}
                                        >
                                            <ArrowLeft className="h-5 w-5"/>
                                        </button>
                                        <h2 className={cn("text-xl font-bold", theme.text.primary)}>{selectedJob.name}</h2>
                                        <span className={cn("text-xs font-mono px-1.5 py-0.5 rounded", theme.surface, theme.border.default, theme.text.secondary)}>{selectedJob.id}</span>
                                    </div>
                                    <p className={cn("text-sm", theme.text.secondary)}>Pipeline Configuration & Logs</p>
                                </div>
                                <Button variant="primary" icon={Play} onClick={() => handleRun(selectedJob.id)}>Trigger Run</Button>
                            </div>
                            
                            <div className={cn("p-6 border-b grid grid-cols-3 gap-4", theme.border.default)}>
                                <div>
                                    <p className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Avg Duration</p>
                                    <p className={cn("font-mono font-medium", theme.text.primary)}>{selectedJob.duration}</p>
                                </div>
                                <div>
                                    <p className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Data Volume</p>
                                    <p className={cn("font-mono font-medium", theme.text.primary)}>{selectedJob.volume}</p>
                                </div>
                                <div>
                                    <p className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Success Rate</p>
                                    <p className="font-mono font-medium text-green-600">98.5%</p>
                                </div>
                            </div>

                            <div className="flex-1 p-0 flex flex-col min-h-0">
                                <div className={cn("p-2 text-xs font-bold uppercase tracking-wider flex items-center border-b", theme.surfaceHighlight, theme.text.secondary, theme.border.default)}>
                                    <FileText className="h-3 w-3 mr-2"/> Live Logs
                                </div>
                                <div className="flex-1 bg-[#1e1e1e] p-4 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
                                    {selectedJob.logs.map((log, i) => (
                                        <div key={i} className="mb-1 border-l-2 border-transparent hover:border-slate-600 pl-2">
                                            <span className="text-slate-500 mr-2">{new Date().toLocaleTimeString()}</span>
                                            <span className={log.includes('[ERROR]') ? 'text-red-400' : log.includes('[WARN]') ? 'text-amber-400' : 'text-green-400'}>
                                                {log}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="animate-pulse">_</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                             <p>Select a pipeline to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'connectors' && (
            <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {connectors.map(conn => (
                        <div key={conn.id} className={cn("p-5 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer group", theme.surface, theme.border.default)}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-3 rounded-lg border", theme.surfaceHighlight, theme.border.default)}>
                                    <conn.icon className={cn("h-6 w-6", conn.color)}/>
                                </div>
                                <div className="flex gap-1">
                                    <button className={cn("p-1.5 rounded transition-colors", theme.text.tertiary, `hover:${theme.text.primary}`, `hover:${theme.surfaceHighlight}`)}><Settings className="h-4 w-4"/></button>
                                </div>
                            </div>
                            <h4 className={cn("font-bold text-lg mb-1", theme.text.primary)}>{conn.name}</h4>
                            <p className={cn("text-sm mb-4", theme.text.secondary)}>{conn.type}</p>
                            
                            <div className={cn("flex items-center justify-between pt-4 border-t", theme.border.light)}>
                                <span className={cn(
                                    "text-xs font-bold px-2 py-0.5 rounded-full",
                                    conn.status === 'Healthy' ? "bg-green-100 text-green-700" : 
                                    conn.status === 'Syncing' ? "bg-blue-100 text-blue-700" :
                                    "bg-red-100 text-red-700"
                                )}>{conn.status}</span>
                                <span className={cn("text-xs", theme.text.tertiary)}>Last sync: 5m ago</span>
                            </div>
                        </div>
                    ))}
                    
                    <button className={cn("border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all", theme.border.default, theme.text.tertiary, `hover:${theme.primary.border}`, `hover:${theme.primary.text}`, `hover:${theme.surfaceHighlight}`)}>
                        <Plus className="h-10 w-10 mb-2"/>
                        <span className="font-medium">Add New Source</span>
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
