import React from 'react';
import { Database, Server, Layers, Box, Settings } from 'lucide-react';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';

/**
 * PipelineDAG - React 18 optimized with React.memo
 */
export const PipelineDAG = React.memo(function PipelineDAG() {
    const { theme, mode } = useTheme();
    
    // Mock DAG structure for Enterprise Demo
    const steps = [
        { id: 'src', label: 'Source: CRM', icon: Database, color: 'text-blue-500', status: 'Active' },
        { id: 'ingest', label: 'Ingestion', icon: Server, color: 'text-purple-500', status: 'Running' },
        { id: 'clean', label: 'Cleaning', icon: Settings, color: 'text-amber-500', status: 'Waiting' },
        { id: 'model', label: 'Data Model', icon: Box, color: 'text-indigo-500', status: 'Ready' },
        { id: 'mart', label: 'Data Mart', icon: Layers, color: 'text-green-500', status: 'Published' },
    ];

    return (
        <div className={cn("flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative", theme.surface.default)}>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: `radial-gradient(${mode === 'dark' ? '#334155' : '#cbd5e1'} 1px, transparent 1px)`, backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 flex flex-1 items-center justify-center p-10 overflow-auto">
                <div className="flex items-center gap-4 min-w-max">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div className={cn(
                                "relative w-48 p-4 rounded-xl border shadow-lg flex flex-col items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-xl bg-white dark:bg-slate-800",
                                theme.border.default
                            )}>
                                <div className={cn("absolute top-3 right-3 w-2 h-2 rounded-full", step.status === 'Running' ? "bg-green-500 animate-pulse" : "bg-slate-300")}></div>
                                
                                <div className={cn("p-3 rounded-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600", step.color)}>
                                    <step.icon className="h-6 w-6"/>
                                </div>
                                <div className="text-center">
                                    <h4 className={cn("font-bold text-sm", theme.text.primary)}>{step.label}</h4>
                                    <p className={cn("text-xs mt-1", theme.text.secondary)}>{step.status}</p>
                                </div>
                                <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                     <div className={cn("h-full bg-blue-500 transition-all duration-1000")} style={{ width: step.status === 'Active' || step.status === 'Running' ? '100%' : '0%' }}></div>
                                </div>
                            </div>
                            
                            {idx < steps.length - 1 && (
                                <div className="relative w-16 h-1 bg-slate-300 dark:bg-slate-700 rounded overflow-hidden">
                                    {/* Flow Animation */}
                                    <div className="absolute inset-0 bg-blue-500/50 w-full animate-progress-fast"></div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className={cn("p-4 border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur flex justify-between items-center", theme.border.default)}>
                <div className="flex gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Running</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Idle</span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                    DAG Execution ID: job-8829-ax
                </div>
            </div>
        </div>
    );
});
