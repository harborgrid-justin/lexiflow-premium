/**
 * ParsedDocketPreview.tsx
 *
 * Preview component for parsed docket data showing case metadata and entry list
 * before final import.
 *
 * @module components/docket/ParsedDocketPreview
 * @category Case Management - Docket
 */

// External Dependencies
import { Briefcase, Calendar, CheckCircle, ExternalLink, FileText, Hash, Users } from 'lucide-react';
import React from 'react';

// Internal Dependencies - Components
import { Button } from '@/components/ui/atoms/Button/Button';
import { Card } from '@/components/ui/molecules/Card/Card';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Type Definitions for Parsed Docket Data
interface ParsedParty {
    name: string;
    role: string;
    counsel?: string;
}

interface ParsedDeadline {
    date: string;
    title: string;
}

interface ParsedDocketEntry {
    pacerSequenceNumber?: number;
    sequenceNumber?: number;
    entryNumber?: number;
    date: string;
    type?: string;
    description?: string;
    title?: string;
    docLink?: string;
    structuredData?: {
        actionType: string;
        actionVerb: string;
    };
}

interface ParsedCaseInfo {
    title?: string;
    id?: string;
    caseNumber?: string;
    court?: string;
    judge?: string;
    matterType?: string;
}

interface ParsedDocketData {
    caseInfo?: ParsedCaseInfo;
    parties?: ParsedParty[];
    deadlines?: ParsedDeadline[];
    docketEntries?: ParsedDocketEntry[];
}

interface ParsedDocketPreviewProps {
    parsedData: ParsedDocketData | unknown;
    setStep: (step: number) => void;
    handleFinish: () => void;
}

export const ParsedDocketPreview: React.FC<ParsedDocketPreviewProps> = ({ parsedData, setStep, handleFinish }) => {
    const { theme } = useTheme();

    // Defensive check for empty or null data to prevent crashes
    if (!parsedData) {
        return (
            <div className={cn("p-8 text-center", theme.text.secondary)}>
                <p>No data available to preview.</p>
                <Button variant="secondary" onClick={() => setStep(1)} className="mt-4">Try Again</Button>
            </div>
        );
    }

    // Type assertion for parsedData
    const data = parsedData as ParsedDocketData;

    return (
        <div className="space-y-6">
            <Card noPadding className={cn("border", theme.surface.highlight, theme.border.default)}>
                <div className="p-4 flex items-start gap-4">
                    <div className={cn("p-2 rounded-full", theme.surface.highlight)}><Briefcase className={cn("h-6 w-6", theme.text.link)} /></div>
                    <div>
                        <h4 className={cn("font-bold text-lg", theme.text.link)}>{data.caseInfo?.title || 'Unknown Case'}</h4>
                        <div className={cn("flex flex-wrap gap-4 text-xs mt-1", theme.text.link)}>
                            <span className={cn("font-mono px-1 rounded", theme.surface.highlight)}>{data.caseInfo?.id || data.caseInfo?.caseNumber || 'No ID'}</span>
                            <span>{data.caseInfo?.court || 'Court N/A'}</span>
                            {data.caseInfo?.judge && <span>Judge: {data.caseInfo?.judge}</span>}
                            <span className="bg-white border px-1 rounded">{data.caseInfo?.matterType || 'General'}</span>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cn("border rounded-lg overflow-hidden", theme.border.default)}>
                    <div className={cn("p-3 border-b flex items-center", theme.surface.highlight, theme.border.default)}>
                        <Users className={cn("h-4 w-4 mr-2", theme.text.secondary)} />
                        <span className={cn("font-bold text-xs uppercase", theme.text.secondary)}>Parties Found ({data.parties?.length || 0})</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-2 space-y-2">
                        {data.parties?.map((p: ParsedParty, i: number) => (
                            <div key={i} className={cn("flex flex-col text-sm p-2 rounded border", theme.surface.default, theme.border.default)}>
                                <div className="flex justify-between">
                                    <span className={cn("font-medium", theme.text.primary)}>{p.name || 'Unknown Party'}</span>
                                    <span className={cn("text-xs px-2 py-0.5 rounded", theme.surface.highlight, theme.text.secondary)}>{p.role || 'Party'}</span>
                                </div>
                                {p.counsel && <span className={cn("text-xs mt-1", theme.text.tertiary)}>Counsel: {p.counsel}</span>}
                            </div>
                        ))}
                        {(!data.parties || data.parties.length === 0) && (
                            <div className={cn("p-4 text-center text-xs", theme.text.tertiary)}>No parties extracted.</div>
                        )}
                    </div>
                </div>

                <div className={cn("border rounded-lg overflow-hidden", theme.border.default)}>
                    <div className={cn("p-3 border-b flex items-center", theme.surface.highlight, theme.border.default)}>
                        <Calendar className={cn("h-4 w-4 mr-2", theme.text.secondary)} />
                        <span className={cn("font-bold text-xs uppercase", theme.text.secondary)}>Events / Deadlines ({data.deadlines?.length ?? 0})</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-2 space-y-2">
                        {(data.deadlines?.length ?? 0) > 0 ? data.deadlines!.map((d: ParsedDeadline, i: number) => (
                            <div key={i} className={cn("flex justify-between items-center text-sm p-2 rounded border", theme.surface.default, theme.border.default)}>
                                <span className="text-red-600 font-medium">{d.date}</span>
                                <span className={cn("text-xs", theme.text.secondary)}>{d.title}</span>
                            </div>
                        )) : <div className={cn("p-4 text-center text-xs", theme.text.tertiary)}>No deadlines extracted.</div>}
                    </div>
                </div>
            </div>

            <div className={cn("border rounded-lg overflow-hidden", theme.border.default)}>
                <div className={cn("p-3 border-b flex items-center", theme.surface.highlight, theme.border.default)}>
                    <FileText className={cn("h-4 w-4 mr-2", theme.text.secondary)} />
                    <span className={cn("font-bold text-xs uppercase", theme.text.secondary)}>Recent Docket Entries ({data.docketEntries?.length || 0})</span>
                </div>
                <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                    {(data.docketEntries && data.docketEntries.length > 0) ? data.docketEntries.slice().reverse().slice(0, 8).map((e: ParsedDocketEntry, i: number) => (
                        <div key={i} className={cn("text-sm p-2 rounded border group", theme.surface.default, theme.border.default)}>
                            <div className="flex gap-2 mb-1 justify-between">
                                <div className="flex gap-2">
                                    <span className={cn("font-mono text-xs px-1 rounded flex items-center", theme.surface.highlight, theme.text.secondary)}>
                                        <Hash className="h-2 w-2 mr-0.5" /> {e.pacerSequenceNumber || e.sequenceNumber || e.entryNumber || '?'}
                                    </span>
                                    <span className={cn("text-xs font-medium", theme.text.primary)}>{e.date}</span>
                                    <span className={`text-[10px] px-1 rounded border ${e.type === 'Order' ? 'bg-red-50 text-red-600 border-red-100' : `${theme.surface.highlight} ${theme.text.secondary}`}`}>{e.type}</span>
                                </div>
                                {e.docLink && <ExternalLink className={cn("h-3 w-3 opacity-50 group-hover:opacity-100", theme.text.link)} />}
                            </div>
                            <div className="flex gap-2">
                                {e.structuredData && (
                                    <span className={cn("text-[9px] px-1 rounded font-mono uppercase border", theme.surface.highlight, theme.text.link, theme.border.default)}>
                                        {e.structuredData.actionType} {e.structuredData.actionVerb}
                                    </span>
                                )}
                                <p className={cn("text-xs leading-relaxed truncate", theme.text.secondary)}>{e.description || e.title}</p>
                            </div>
                        </div>
                    )) : null}
                    {(data.docketEntries?.length ?? 0) > 8 && (
                        <p className={cn("text-xs text-center italic pt-2", theme.text.tertiary)}>...and {data.docketEntries!.length - 8} earlier entries</p>
                    )}
                    {(!data.docketEntries || data.docketEntries.length === 0) && (
                        <div className={cn("p-4 text-center text-xs", theme.text.tertiary)}>No docket entries found.</div>
                    )}
                </div>
            </div>

            <div className={cn("flex justify-end gap-3 border-t pt-4", theme.border.default)}>
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button variant="primary" icon={CheckCircle} onClick={handleFinish}>Create Case & Import All</Button>
            </div>
        </div>
    );
};
