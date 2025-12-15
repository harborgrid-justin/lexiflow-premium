
import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity, Play, FileText, Database, Cloud, Server, Settings, Plus, ArrowLeft, Loader2, GitMerge } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Tabs } from '../../common/Tabs';
import { Button } from '../../common/Button';
import { DataService } from '../../../services/dataService';
import { useQuery } from '../../../services/queryClient';
import { PipelineJob, Connector } from '../../../types';
import { PipelineList } from './pipeline/PipelineList';
import { PipelineDAG } from './pipeline/PipelineDAG';

interface PipelineMonitorProps {
    initialTab?: string;
}

export const PipelineMonitor: React.FC<PipelineMonitorProps> = ({ initialTab = 'monitor' }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'monitor' | 'visual' | 'connectors'>('monitor');
  const [selectedJob, setSelectedJob] = useState<PipelineJob | null>(null);
  
  useEffect(() => {
      if (initialTab === 'connectors') setActiveTab('connectors');
      else if (initialTab === 'visual') setActiveTab('visual');
      else setActiveTab('monitor');
  }, [initialTab]);
  
  // Integrated Data Queries
  const { data: pipelines = [], isLoading: isLoadingPipelines, refetch } = useQuery<PipelineJob[]>(
      ['admin', 'pipelines'],
      DataService.admin.getPipelines
  );

  const { data: connectors = [], isLoading: isLoadingConnectors } = useQuery<Connector[]>(
      ['admin', 'connectors'],
      DataService.admin.getConnectors
  );

  const handleRun = (id: string) => {
      alert(`Triggered run for pipeline ${id}`);
  };
  
  const getIcon = (type: string) => {
      switch(type) {
          case 'Database': return Database;
          case 'Warehouse': return Cloud;
          case 'SaaS': return Cloud;
          case 'Storage': return Server;
          default: return Database;
      }
  };

  if (isLoadingPipelines || isLoadingConnectors) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

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
                    { id: 'monitor', label: 'Jobs', icon: Activity },
                    { id: 'visual', label: 'Topology', icon: GitMerge },
                    { id: 'connectors', label: 'Connectors', icon: Database }
                ]}
                activeTab={activeTab}
                onChange={(t) => setActiveTab(t as any)}
            />
        </div>

        {activeTab === 'monitor' && (
            <div className="flex flex-1 overflow-hidden relative">
                <PipelineList 
                    pipelines={pipelines} 
                    selectedJob={selectedJob} 
                    onSelectJob={setSelectedJob} 
                />

                {/* Details Panel - Full width on mobile when active */}
                <div className={cn(
                    "flex-1 flex flex-col h-full lg:w-1/2 absolute lg:static inset-0 z-10 transition-transform duration-300",
                    theme.surface.default,
                    selectedJob ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:hidden"
                )}>
                    {selectedJob ? (
                        <>
                            <div className={cn("p-6 border-b flex justify-between items-start", theme.border.default, theme.surface.highlight)}>
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
                                        <span className={cn("text-xs font-mono px-1.5 py-0.5 rounded", theme.surface.default, theme.border.default, theme.text.secondary)}>{selectedJob.id}</span>
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
                                <div className={cn("p-2 text-xs font-bold uppercase tracking-wider flex items-center border-b", theme.surface.highlight, theme.text.secondary, theme.border.default)}>
                                    <FileText className="h-3 w-3 mr-2"/> Live Logs
                                </div>
                                <div className={cn("flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed", theme.surface.default, theme.text.primary)}>
                                    {selectedJob.logs.map((log, i) => (
                                        <div key={i} className={cn("mb-1 border-l-2 border-transparent hover:border-slate-600 pl-2")}>
                                            <span className={cn("mr-2", theme.text.tertiary)}>{new Date().toLocaleTimeString()}</span>
                                            <span className={log.includes('[ERROR]') ? theme.status.error.text : log.includes('[WARN]') ? theme.status.warning.text : theme.status.success.text}>
                                                {log}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="animate-pulse">_</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={cn("flex items-center justify-center h-full", theme.text.tertiary)}>
                             <p>Select a pipeline to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
        
        {activeTab === 'visual' && (
            <PipelineDAG />
        )}

        {activeTab === 'connectors' && (
            <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {connectors.map(conn => {
                        const Icon = getIcon(conn.type);
                        return (
                        <div key={conn.id} className={cn("p-5 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer group", theme.surface.default, theme.border.default)}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-3 rounded-lg border", theme.surface.highlight, theme.border.default)}>
                                    <Icon className={cn("h-6 w-6", conn.color)}/>
                                </div>
                                <div className="flex gap-1">
                                    <button className={cn("p-1.5 rounded transition-colors", theme.text.tertiary, `hover:${theme.text.primary}`, `hover:${theme.surface.highlight}`)}><Settings className="h-4 w-4"/></button>
                                </div>
                            </div>
                            <h4 className={cn("font-bold text-lg mb-1", theme.text.primary)}>{conn.name}</h4>
                            <p className={cn("text-sm mb-4", theme.text.secondary)}>{conn.type}</p>
                            
                            <div className={cn("flex items-center justify-between pt-4 border-t", theme.border.default)}>
                                <span className={cn(
                                    "text-xs font-bold px-2 py-0.5 rounded-full border",
                                    conn.status === 'Healthy' ? cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border) : 
                                    conn.status === 'Syncing' ? cn(theme.status.info.bg, theme.status.info.text, theme.status.info.border) :
                                    cn(theme.status.error.bg, theme.status.error.text, theme.status.error.border)
                                )}>{conn.status}</span>
                                <span className={cn("text-xs", theme.text.tertiary)}>Last sync: 5m ago</span>
                            </div>
                        </div>
                    )})}
                    
                    <button className={cn("border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all", theme.border.default, theme.text.tertiary, `hover:${theme.primary.border}`, `hover:${theme.primary.text}`, `hover:${theme.surface.highlight}`)}>
                        <Plus className="h-10 w-10 mb-2"/>
                        <span className="font-medium">Add New Source</span>
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
