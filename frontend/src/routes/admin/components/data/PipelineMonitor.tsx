import { useEffect, useState } from 'react';

import { Activity, ArrowLeft, Cloud, Database, FileText, GitMerge, Loader2, Play, Plus, RefreshCw, Server, Settings } from 'lucide-react';

import { useMutation, useQuery } from '@/hooks/backend';
import type { Pipeline } from '@/lib/frontend-api';
import { dataPlatformApi } from '@/lib/frontend-api/data-platform';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { Tabs } from '@/shared/ui/molecules/Tabs/Tabs';
import { useTheme } from '@/theme';

import { PipelineDAG } from './pipeline/PipelineDAG';
import { PipelineList } from './pipeline/PipelineList';


interface PipelineMonitorProps {
    initialTab?: string;
}

export function PipelineMonitor({ initialTab = 'monitor' }: PipelineMonitorProps): React.ReactElement {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'monitor' | 'visual' | 'connectors'>('monitor');
    const [selectedJob, setSelectedJob] = useState<Pipeline | null>(null);

    useEffect(() => {
        if (initialTab === 'connectors') {
            setActiveTab('connectors');
        } else if (initialTab === 'visual') {
            setActiveTab('visual');
        } else {
            setActiveTab('monitor');
        }
    }, [initialTab]);

    // Real Backend Integration - Fetch pipelines from backend API
    const { data: pipelinesResponse, isLoading: isLoadingPipelines, refetch } = useQuery(
        ['pipelines', 'all'],
        () => dataPlatformApi.pipelines.getAll(),
    );

    const pipelines = Array.isArray(pipelinesResponse) ? pipelinesResponse : (pipelinesResponse?.data || []);

    // Fetch connectors from backend API
    const { data: connectorsResponse = [], isLoading: isLoadingConnectors } = useQuery(
        ['connectors', 'all'],
        () => dataPlatformApi.connectors.getAll()
    );

    const connectors = Array.isArray(connectorsResponse) ? connectorsResponse : ((connectorsResponse as { data?: unknown[] })?.data || []);

    const { mutate: executePipeline } = useMutation(
        (id: string) => dataPlatformApi.pipelines.execute(id),
        { invalidateKeys: [['pipelines', 'all'], ['pipelines', 'stats']] },
    );

    const handleRun = (id: string): void => {
        executePipeline(id);
    };

    const getIcon = (type: string): React.ComponentType<{ className?: string }> => {
        switch (type) {
            case 'Database': return Database;
            case 'Warehouse': return Cloud;
            case 'SaaS': return Cloud;
            case 'Storage': return Server;
            default: return Database;
        }
    };

    if (isLoadingPipelines || isLoadingConnectors) { return <div className="flex h-full items-center justify-center"><Loader2 className={cn("animate-spin", theme.primary.text)} /></div>; }

    return (
        <div className={cn("flex flex-col h-full", theme.background)}>
            <div className={cn("px-6 pt-4 border-b shrink-0", theme.border.default)}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className={cn("text-xl font-bold", theme.text.primary)}>ETL Pipelines</h3>
                        <p className={cn("text-sm", theme.text.secondary)}>Data Orchestration & Connectivity</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" icon={RefreshCw} onClick={() => { void refetch(); }}>Refresh</Button>
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
                    onChange={(t) => {
                        if (t === 'monitor' || t === 'visual' || t === 'connectors') {
                            setActiveTab(t);
                        }
                    }}
                />
            </div>

            {activeTab === 'monitor' && (
                <div className="flex flex-1 overflow-hidden relative">
                    {pipelines.length === 0 && !isLoadingPipelines ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8">
                            <div className={cn("p-6 rounded-full mb-4", theme.surface.highlight)}>
                                <Activity className={cn("h-12 w-12", theme.text.tertiary)} />
                            </div>
                            <h3 className={cn("text-xl font-semibold mb-2", theme.text.primary)}>No ETL Pipelines</h3>
                            <p className={cn("text-sm text-center max-w-md mb-4", theme.text.secondary)}>
                                Connect to the backend to view and manage your data pipelines
                            </p>
                            <Button variant="outline" icon={RefreshCw} onClick={() => { void refetch(); }}>Refresh</Button>
                        </div>
                    ) : (
                        <>
                            <PipelineList
                                pipelines={pipelines}
                                selectedJob={selectedJob}
                                onSelectJob={setSelectedJob}
                            />

                            {/* Details Panel - Full width on mobile when active */}
                            <div className={cn(
                                "flex-1 flex flex-col h-full lg:w-1/2 absolute lg:static inset-0 z-10 transition-transform duration-300",
                                theme.surface.default,
                                selectedJob !== null ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:hidden"
                            )}>
                                {selectedJob !== null ? (
                                    <>
                                        <div className={cn("p-6 border-b flex justify-between items-start", theme.border.default, theme.surface.highlight)}>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {/* Mobile Back Button */}
                                                    <button
                                                        onClick={() => setSelectedJob(null)}
                                                        className={cn("lg:hidden p-1 rounded mr-2 transition-colors", theme.text.secondary, `hover:${theme.surface.highlight}`)}
                                                    >
                                                        <ArrowLeft className="h-5 w-5" />
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
                                                <p className={cn("font-mono font-medium", theme.status.success.text)}>98.5%</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 p-0 flex flex-col min-h-0">
                                            <div className={cn("p-2 text-xs font-bold uppercase tracking-wider flex items-center border-b", theme.surface.highlight, theme.text.secondary, theme.border.default)}>
                                                <FileText className="h-3 w-3 mr-2" /> Live Logs
                                            </div>
                                            <div className={cn("flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed", theme.surface.default, theme.text.primary)}>
                                                {(selectedJob.logs || []).map((log, idx) => {
                                                    let logClass = theme.status.success.text;
                                                    const logMessage = typeof log === 'string' ? log : log.message;
                                                    const logLevel = typeof log === 'string' ? 'INFO' : log.level;
                                                    const logTimestamp = typeof log === 'string' ? new Date().toLocaleTimeString() : new Date(log.timestamp).toLocaleTimeString();

                                                    if (logLevel === 'ERROR' || logMessage.includes('[ERROR]')) {
                                                        logClass = theme.status.error.text;
                                                    } else if (logLevel === 'WARN' || logMessage.includes('[WARN]')) {
                                                        logClass = theme.status.warning.text;
                                                    }

                                                    return (
                                                        <div key={`log-${idx}-${logTimestamp}`} className="mb-1 border-l-2 border-transparent hover:border-slate-600 pl-2">
                                                            <span className={cn("mr-2", theme.text.tertiary)}>{logTimestamp}</span>
                                                            <span className={cn(logClass)}>
                                                                {logMessage}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
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
                        </>
                    )}
                </div>
            )}

            {activeTab === 'visual' && (
                <PipelineDAG />
            )}

            {activeTab === 'connectors' && (
                <div className="p-6 overflow-y-auto">
                    {connectors.length === 0 && !isLoadingConnectors ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className={cn("p-6 rounded-full mb-4", theme.surface.highlight)}>
                                <Database className={cn("h-12 w-12", theme.text.tertiary)} />
                            </div>
                            <h3 className={cn("text-xl font-semibold mb-2", theme.text.primary)}>No Connectors Available</h3>
                            <p className={cn("text-sm text-center max-w-md mb-4", theme.text.secondary)}>
                                Connect to the backend to view your data source connectors
                            </p>
                            <Button variant="outline" icon={RefreshCw} onClick={() => { void refetch(); }}>Refresh</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {connectors.map((conn: { id: string; type: string; name: string; color?: string; status?: string }) => {
                                const Icon = getIcon(conn.type);
                                return (
                                    <div key={conn.id} className={cn("p-5 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer group", theme.surface.default, theme.border.default)}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={cn("p-3 rounded-lg border", theme.surface.highlight, theme.border.default)}>
                                                <Icon className={cn("h-6 w-6", conn.color || 'text-slate-500')} />
                                            </div>
                                            <div className="flex gap-1">
                                                <button aria-label="Connector settings" className={cn("p-1.5 rounded transition-colors hover:bg-slate-100 dark:hover:bg-slate-700", theme.text.tertiary)}><Settings className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                        <h4 className={cn("font-bold text-lg mb-1", theme.text.primary)}>{conn.name}</h4>
                                        <p className={cn("text-sm mb-4", theme.text.secondary)}>{conn.type}</p>

                                        <div className={cn("flex items-center justify-between pt-4 border-t", theme.border.default)}>
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-0.5 rounded-full border",
                                                (() => {
                                                    if (conn.status === 'Healthy') {
                                                        return cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border);
                                                    }
                                                    if (conn.status === 'Syncing') {
                                                        return cn(theme.status.info.bg, theme.status.info.text, theme.status.info.border);
                                                    }
                                                    return cn(theme.status.error.bg, theme.status.error.text, theme.status.error.border);
                                                })()
                                            )}>{conn.status}</span>
                                            <span className={cn("text-xs", theme.text.tertiary)}>Last sync: 5m ago</span>
                                        </div>
                                    </div>
                                );
                            })}

                            <button className={cn("border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800", theme.border.default, theme.text.tertiary)}>
                                <Plus className="h-10 w-10 mb-2" />
                                <span className="font-medium">Add New Source</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default PipelineMonitor;
