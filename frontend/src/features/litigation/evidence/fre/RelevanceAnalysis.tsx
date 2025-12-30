/**
 * @module RelevanceAnalysis
 * @category Evidence
 * @description Analyzes probative value vs. unfair prejudice under FRE 401/403.
 * Provides a risk meter and argument builder for admissibility hearings.
 */

import React from 'react';
import { Filter, ThumbsUp, ThumbsDown, Scale, Wand2 } from 'lucide-react';

// Common Components
import { Card } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { Badge } from '@/components/atoms';
import { RiskMeter } from '@/components/organisms';

// Context & Utils
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';

// Services & Types
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { EvidenceItem } from '@/types';

export const RelevanceAnalysis: React.FC = () => {
    const { theme } = useTheme();
    const { data: evidence = [] } = useQuery<EvidenceItem[]>(
        ['evidence', 'all'],
        () => DataService.evidence.getAll()
    );
    
    // Mock state for selected item
    const selectedItem = evidence.length > 0 ? evidence[2] : null;

    return (
        <div className="space-y-6">
            <div className={cn("flex items-center gap-3 p-2 rounded-lg border", theme.surface.default, theme.border.default)}>
                <Filter className={cn("h-4 w-4", theme.text.secondary)}/>
                <select 
                    className={cn("flex-1 text-sm bg-transparent outline-none", theme.text.primary)}
                    aria-label="Select evidence to analyze"
                >
                    <option value="">Select Evidence to Analyze...</option>
                    {evidence.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
                <Button variant="outline">Analyze</Button>
            </div>

            {selectedItem && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Probative Value (FRE 401)" className="border-t-4 border-t-green-500">
                         <p className={cn("text-sm mb-4", theme.text.secondary)}>Arguments supporting that this evidence makes a fact of consequence more or less probable.</p>
                         <ul className="space-y-2 text-sm">
                             <li className="flex items-start gap-2"><ThumbsUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0"/> Establishes timeline of events.</li>
                             <li className="flex items-start gap-2"><ThumbsUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0"/> Contradicts witness testimony.</li>
                         </ul>
                    </Card>
                    <Card title="Unfair Prejudice (FRE 403)" className="border-t-4 border-t-red-500">
                        <p className={cn("text-sm mb-4", theme.text.secondary)}>Arguments that the evidence could confuse issues, mislead the jury, or waste time.</p>
                        <ul className="space-y-2 text-sm">
                             <li className="flex items-start gap-2"><ThumbsDown className="h-4 w-4 text-red-500 mt-0.5 shrink-0"/> May confuse the jury on a side issue.</li>
                         </ul>
                    </Card>
                </div>
            )}
             
            <Card title="FRE 403 Balancing Test">
                 <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full">
                        <RiskMeter value={80} label="Probative Value" type="strength"/>
                    </div>
                    <Scale className="h-8 w-8 text-slate-400 shrink-0"/>
                    <div className="flex-1 w-full">
                        <RiskMeter value={30} label="Prejudicial Effect" type="risk"/>
                    </div>
                 </div>
                 <div className={cn("mt-6 pt-6 border-t flex justify-between items-center", theme.border.default)}>
                    <Badge variant="success">Likely Admissible</Badge>
                    <Button variant="ghost" icon={Wand2}>AI Suggest Argument</Button>
                 </div>
            </Card>
        </div>
    );
};
