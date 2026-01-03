import React, { useMemo } from 'react';
import { FormattingRule, PleadingSection } from '@/types';
import { AlertOctagon, Info, Zap, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';

interface ComplianceHUDProps {
    rules: FormattingRule;
    sections: PleadingSection[];
    score: number;
}

const ComplianceHUD: React.FC<ComplianceHUDProps> = ({ sections, score: propScore }) => {
    const { theme } = useTheme();

    const issues = useMemo(() => [
        { id: 2, type: 'warning', msg: 'Heading capitalization inconsistent', blockId: 'b2' },
        { id: 3, type: 'info', msg: 'Exhibit A referenced but not attached', blockId: 'b3' }
    ], [sections]);

    const dynamicScore = useMemo(() => {
        if (issues.length === 0) return 100;
        const errorWeight = 10;
        const warningWeight = 5;
        const penalty = issues.reduce((acc: unknown, issue: unknown) => (acc as number) + ((issue as {type: string}).type === 'error' ? errorWeight : (issue as {type: string}).type === 'warning' ? warningWeight : 0), 0);
        return Math.max(0, 100 - (penalty as number));
    }, [issues]);

    const displayScore = propScore !== 100 ? propScore : dynamicScore;

    return (
        <div className={cn("absolute top-8 right-8 w-64 h-auto bg-white/80 backdrop-blur-md rounded-lg shadow-2xl border flex-col z-30 hidden lg:flex", theme.border.default)}>
            <div className={cn("p-3 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
                <h3 className={cn("font-bold text-xs uppercase tracking-wider flex items-center gap-2", theme.text.tertiary)}>
                    <Zap className="h-4 w-4 text-amber-500"/> Genius Linter
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Score Card */}
                <div className={cn("p-3 rounded-xl border flex flex-col items-center", displayScore === 100 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800")}>
                    <div className={cn("text-2xl font-bold mb-0.5", theme.text.primary)}>{displayScore}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wide opacity-70">Compliance Score</div>
                </div>

                {/* Issues List */}
                <div>
                    <div className="space-y-2">
                        {issues.map(issue => (
                            <div key={issue.id} className={cn("p-2 rounded border text-xs flex gap-2 transition-colors cursor-pointer", theme.surface.default, theme.border.default, `hover:${theme.surface.highlight}`)}>
                                <div className="mt-0.5">
                                    {issue.type === 'error' && <AlertOctagon className="h-4 w-4 text-red-500"/>}
                                    {issue.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500"/>}
                                    {issue.type === 'info' && <Info className="h-4 w-4 text-blue-500"/>}
                                </div>
                                <div>
                                    <p className={cn("font-medium", theme.text.primary)}>{issue.msg}</p>
                                </div>
                            </div>
                        ))}
                        {issues.length === 0 && <div className={cn("text-center italic text-xs text-green-600 p-2", theme.text.tertiary)}>No issues found.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplianceHUD;
