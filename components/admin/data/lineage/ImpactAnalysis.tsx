
import React from 'react';
import { ArrowRight, AlertTriangle, Database, FileText, Layers } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { Button } from '../../../common/Button';

interface DependencyNode {
    id: string;
    name: string;
    type: 'Table' | 'Pipeline' | 'Dashboard';
    impact: string;
}

export const ImpactAnalysis: React.FC = () => {
    const { theme } = useTheme();

    const dependencies: DependencyNode[] = [
        { id: '1', name: 'Raw Sales Data', type: 'Table', impact: 'None' },
        { id: '2', name: 'ETL: Clean Sales', type: 'Pipeline', impact: 'Re-run required' },
        { id: '3', name: 'Fact_Sales', type: 'Table', impact: 'Data stale' },
        { id: '4', name: 'Q1 Revenue Report', type: 'Dashboard', impact: 'Outdated Metrics' },
    ];

    return (
        <div className="p-8 flex flex-col items-center h-full overflow-y-auto">
            <h3 className={cn("text-lg font-bold mb-6", theme.text.primary)}>Downstream Impact: Fact_Sales Modification</h3>
            
            <div className="max-w-2xl w-full relative">
                <div className={cn("absolute left-8 top-0 bottom-0 w-0.5 z-0", theme.border.default)}></div>
                
                {dependencies.map((dep, idx) => (
                    <div key={dep.id} className="relative z-10 flex items-center mb-8 last:mb-0">
                        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border-4 bg-white dark:bg-slate-800 shadow-md", theme.border.default)}>
                            {dep.type === 'Table' ? <Database className="h-6 w-6 text-blue-500"/> : dep.type === 'Pipeline' ? <Layers className="h-6 w-6 text-purple-500"/> : <FileText className="h-6 w-6 text-green-500"/>}
                        </div>
                        <div className="ml-8 flex-1">
                            <div className={cn("p-4 rounded-lg border shadow-sm flex justify-between items-center", theme.surface, theme.border.default)}>
                                <div>
                                    <h4 className={cn("font-bold text-sm", theme.text.primary)}>{dep.name}</h4>
                                    <span className={cn("text-xs uppercase font-bold", theme.text.tertiary)}>{dep.type}</span>
                                </div>
                                {dep.impact !== 'None' && (
                                    <div className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                        <AlertTriangle className="h-3 w-3 mr-1"/> {dep.impact}
                                    </div>
                                )}
                            </div>
                        </div>
                        {idx < dependencies.length - 1 && (
                            <ArrowRight className="absolute left-[26px] -bottom-6 h-5 w-5 text-slate-300 z-10 rotate-90"/>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
