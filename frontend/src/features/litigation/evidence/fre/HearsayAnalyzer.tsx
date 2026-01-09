/**
 * @module HearsayAnalyzer
 * @category Evidence
 * @description AI-powered tool for identifying potential hearsay in evidence documents.
 * Suggests applicable exceptions under FRE 803/804.
 */

import { AlertTriangle, CheckCircle, FileText, Wand2 } from 'lucide-react';
import React from 'react';

// Common Components
import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';

// Context & Utils
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';

// Services & Types
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { EvidenceItem } from '@/types';

export const HearsayAnalyzer: React.FC = () => {
    const { theme } = useTheme();
    const { data: evidence = [] } = useQuery<EvidenceItem[]>(
        ['evidence', 'all'],
        () => DataService.evidence.getAll()
    );

    // Real analysis would come from AI processing of selected document
    const statements: Array<{ id: string | number, text: string, exception: string, status: string }> = [];

    return (
        <div className="space-y-6">
            <div className={cn("p-4 rounded-lg border flex items-center gap-3", theme.surface.default, theme.border.default)}>
                <FileText className={cn("h-5 w-5", theme.text.secondary)} />
                <select title="Select document to analyze" className={cn("flex-1 text-sm bg-transparent outline-none", theme.text.primary)}>
                    <option value="">Select Document to Analyze...</option>
                    {evidence.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
                <Button icon={Wand2}>AI Scan Document</Button>
            </div>

            <Card title="Hearsay Statements Identified">
                {statements.length === 0 ? (
                    <div className={cn("p-8 flex flex-col items-center justify-center text-center opacity-50", theme.text.tertiary)}>
                        <span className="mb-2">No statements extracted</span>
                        <span className="text-xs">Run AI analysis to identify potential hearsay</span>
                    </div>
                ) : (
                    statements.map(stmt => (
                        <div key={stmt.id} className={cn("p-3 border-b last:border-0", theme.border.default)}>
                            <p className={cn("italic text-sm", theme.text.primary)}>"{stmt.text}"</p>
                            <div className="flex justify-between items-center mt-2">
                                <select title="Select hearsay exception" className={cn("text-xs p-1 border rounded", theme.surface.highlight, theme.border.default)}>
                                    <option>{stmt.exception}</option>
                                    <option>FRE 803(1) Present Sense Impression</option>
                                    <option>FRE 803(3) Then-Existing Condition</option>
                                </select>
                                <span className={cn(
                                    "flex items-center text-xs font-bold",
                                    stmt.status === 'Analyzed' ? theme.status.success.text : theme.status.error.text
                                )}>
                                    {stmt.status === 'Analyzed' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                                    {stmt.status}
                                </span>
                            </div>
                        </div>
                    )))}
            </Card>
        </div>
    );
};
