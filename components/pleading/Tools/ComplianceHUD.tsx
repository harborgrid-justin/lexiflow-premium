
import React from 'react';
import { FormattingRule, PleadingSection } from '../../../types/pleadingTypes';
import { CheckCircle, AlertOctagon, Info, Zap, Settings, BookOpen, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface ComplianceHUDProps {
    rules: FormattingRule;
    sections: PleadingSection[];
    score: number;
}

export const ComplianceHUD: React.FC<ComplianceHUDProps> = ({ rules, sections, score }) => {
    const { theme } = useTheme();

    const issues = [
        { id: 1, type: 'error', msg: 'Signature block missing date', blockId: 'b3' },
        { id: 2, type: 'warning', msg: 'Heading III capitalization inconsistent', blockId: 'b2' },
        { id: 3, type: 'info', msg: 'Exhibit A referenced but not attached', blockId: 'b3' }
    ];

    return (
        <div className="flex flex-col h-full">
            <div className={cn("p-4 border-b bg-slate-50 dark:bg-slate-900", theme.border.default)}>
                <h3 className={cn("font-bold text-xs uppercase tracking-wider flex items-center gap-2", theme.text.tertiary)}>
                    <Zap className="h-4 w-4 text-amber-500"/> Genius Linter
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Score Card */}
                <div className={cn("p-4 rounded-xl border flex flex-col items-center", score === 100 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200")}>
                    <div className="text-3xl font-bold mb-1">{score}</div>
                    <div className="text-xs font-bold uppercase tracking-wide opacity-70">Compliance Score</div>
                </div>

                {/* Active Jurisdiction */}
                <div className={cn("p-3 rounded-lg border flex items-center justify-between", theme.surface, theme.border.default)}>
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500"/>
                        <div className="text-xs">
                            <span className="block font-bold text-slate-700 dark:text-slate-200">FRCP Rules</span>
                            <span className="text-slate-500">Active Check</span>
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-blue-600"><Settings className="h-4 w-4"/></button>
                </div>

                {/* Issues List */}
                <div>
                    <h4 className={cn("text-xs font-bold uppercase mb-3", theme.text.tertiary)}>Detected Issues</h4>
                    <div className="space-y-2">
                        {issues.map(issue => (
                            <div key={issue.id} className={cn("p-3 rounded-lg border text-xs flex gap-3 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800", theme.surface, theme.border.default)}>
                                <div className="mt-0.5">
                                    {issue.type === 'error' && <AlertOctagon className="h-4 w-4 text-red-500"/>}
                                    {issue.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500"/>}
                                    {issue.type === 'info' && <Info className="h-4 w-4 text-blue-500"/>}
                                </div>
                                <div>
                                    <p className={cn("font-medium", theme.text.primary)}>{issue.msg}</p>
                                    <p className={cn("mt-1 text-[10px]", theme.text.tertiary)}>Rule 11(a) Compliance</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Auto-Fix */}
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                    <Zap className="h-3 w-3"/> Auto-Fix All Formatting
                </button>
            </div>
        </div>
    );
};
