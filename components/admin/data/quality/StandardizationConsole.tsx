
import React, { useState, useEffect } from 'react';
import { Card } from '../../../common/Card';
import { Button } from '../../../common/Button';
import { Wand2, Play, CheckCircle, Hash, Phone, Calendar, Type, MoreHorizontal, Plus, Loader2 } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { CleansingRule } from '../../../../types';
import { useMutation, useQuery } from '../../../../services/queryClient';
import { DataService } from '../../../../services/dataService';
import { useNotify } from '../../../../hooks/useNotify';

export const StandardizationConsole: React.FC = () => {
    const { theme } = useTheme();
    const notify = useNotify();
    const [isRunning, setIsRunning] = useState(false);
    const [lastRunStats, setLastRunStats] = useState<{processed: number, fixed: number} | null>(null);

    const { data: fetchedRules = [], isLoading } = useQuery<CleansingRule[]>(
        ['quality', 'rules'],
        DataService.quality.getStandardizationRules
    );

    const [rules, setRules] = useState<CleansingRule[]>([]);

    useEffect(() => {
        if (fetchedRules.length > 0) setRules(fetchedRules);
    }, [fetchedRules]);

    const { mutate: runJob } = useMutation(
        DataService.quality.runCleansingJob,
        {
            onSuccess: (stats) => {
                setLastRunStats(stats);
                setIsRunning(false);
                notify.success(`Standardization Complete. Fixed ${stats.fixed} records.`);
            }
        }
    );

    const toggleRule = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    };

    const handleRun = () => {
        setIsRunning(true);
        runJob(rules.filter(r => r.isActive));
    };

    const getIcon = (op: string) => {
        if (op.includes('Phone')) return <Phone className="h-4 w-4 text-green-600"/>;
        if (op.includes('Date')) return <Calendar className="h-4 w-4 text-blue-600"/>;
        if (op.includes('Trim')) return <Wand2 className="h-4 w-4 text-purple-600"/>;
        return <Type className="h-4 w-4 text-slate-600"/>;
    };

    if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cn("p-6 rounded-lg border flex flex-col md:flex-row justify-between items-center gap-4", theme.surface, theme.border.default)}>
                <div>
                    <h3 className={cn("font-bold text-lg", theme.text.primary)}>Standardization Engine</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Define transformations to ensure data consistency across the platform.</p>
                </div>
                <div className="flex gap-3">
                    {lastRunStats && (
                        <div className="text-right mr-4 hidden md:block">
                            <p className={cn("text-xs uppercase font-bold", theme.text.tertiary)}>Last Run</p>
                            <p className={cn("text-sm font-medium", theme.text.primary)}>{lastRunStats.fixed} Corrections</p>
                        </div>
                    )}
                    <Button variant="primary" icon={isRunning ? undefined : Play} onClick={handleRun} disabled={isRunning}>
                        {isRunning ? 'Processing...' : 'Run Transformation Job'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rules.map(rule => (
                    <div 
                        key={rule.id} 
                        className={cn(
                            "p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group",
                            theme.surface,
                            rule.isActive ? cn("border-blue-500 ring-1 ring-blue-500") : theme.border.default
                        )}
                        onClick={() => toggleRule(rule.id)}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className={cn("p-2 rounded-lg", theme.surfaceHighlight)}>
                                {getIcon(rule.operation)}
                            </div>
                            <div className={cn("w-10 h-5 rounded-full p-1 transition-colors", rule.isActive ? "bg-blue-600" : theme.border.default)}>
                                <div className={cn("w-3 h-3 bg-white rounded-full shadow-sm transition-transform", rule.isActive ? "translate-x-5" : "")}></div>
                            </div>
                        </div>
                        
                        <h4 className={cn("font-bold text-sm mb-1", theme.text.primary)}>{rule.name}</h4>
                        <div className={cn("flex items-center gap-2 text-xs", theme.text.secondary)}>
                            <span className={cn("font-mono px-1.5 rounded", theme.surfaceHighlight)}>{rule.targetField}</span>
                            <span>•</span>
                            <span>{rule.operation}</span>
                        </div>
                        
                        {rule.isActive && (
                            <div className="absolute top-0 right-0 p-1.5 bg-blue-600 rounded-bl-xl text-white">
                                <CheckCircle className="h-3 w-3"/>
                            </div>
                        )}
                    </div>
                ))}

                <button className={cn("border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all text-slate-400 hover:text-blue-500 hover:border-blue-400", theme.border.default)}>
                    <Plus className="h-8 w-8 mb-2"/>
                    <span className="font-bold text-sm">Add New Transformer</span>
                </button>
            </div>
        </div>
    );
};
