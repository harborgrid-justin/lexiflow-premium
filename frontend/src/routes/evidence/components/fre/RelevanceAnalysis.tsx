/**
 * @module RelevanceAnalysis
 * @category Evidence
 * @description Analyzes probative value vs. unfair prejudice under FRE 401/403.
 * Provides a risk meter and argument builder for admissibility hearings.
 */

import { Filter, Scale, Wand2 } from 'lucide-react';
// Common Components
import { RiskMeter } from '@/routes/cases/ui/components/RiskMeter/RiskMeter';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/molecules/Card';

// Context & Utils
import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';

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

    const [selectedId, setSelectedId] = React.useState<string>('');
    const selectedItem = evidence.find(e => e.id === selectedId) || null;

    return (
        <div className="space-y-6">
            <div className={cn("flex items-center gap-3 p-2 rounded-lg border", theme.surface.default, theme.border.default)}>
                <Filter className={cn("h-4 w-4", theme.text.secondary)} />
                <select
                    className={cn("flex-1 text-sm bg-transparent outline-none", theme.text.primary)}
                    aria-label="Select evidence to analyze"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                >
                    <option value="">Select Evidence to Analyze...</option>
                    {evidence.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
                <Button variant="outline">Analyze</Button>
            </div>

            {selectedItem ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Probative Value (FRE 401)" className="border-t-4 border-t-green-500">
                        <p className={cn("text-sm mb-4", theme.text.secondary)}>Arguments supporting that this evidence makes a fact of consequence more or less probable.</p>
                        <ul className="space-y-2 text-sm text-slate-500 italic">
                            <li>No probative arguments available. Click "Analyze" to generate.</li>
                        </ul>
                    </Card>
                    <Card title="Unfair Prejudice (FRE 403)" className="border-t-4 border-t-red-500">
                        <p className={cn("text-sm mb-4", theme.text.secondary)}>Arguments that the evidence could confuse issues, mislead the jury, or waste time.</p>
                        <ul className="space-y-2 text-sm text-slate-500 italic">
                            <li>No prejudicial arguments available. Click "Analyze" to generate.</li>
                        </ul>
                    </Card>
                </div>
            ) : (
                <div className={cn("text-center p-12 opacity-50", theme.text.tertiary)}>
                    Please select an evidence item to view analysis.
                </div>
            )}

            {selectedItem && (
                <Card title="FRE 403 Balancing Test">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 w-full">
                            <RiskMeter value={selectedItem.relevanceScore || 0} label="Probative Value" type="strength" />
                        </div>
                        <Scale className="h-8 w-8 text-slate-400 shrink-0" />
                        <div className="flex-1 w-full">
                            {/* Assuming prejudice score isn't available, defaulting to 0 or derived if possible */}
                            <RiskMeter value={0} label="Prejudicial Effect" type="risk" />
                        </div>
                    </div>
                    <div className={cn("mt-6 pt-6 border-t flex justify-between items-center", theme.border.default)}>
                        <Badge variant={selectedItem.admissibility === 'Admissible' ? "success" : "neutral"}>
                            {selectedItem.admissibility || "Analysis Pending"}
                        </Badge>
                        <Button variant="ghost" icon={Wand2}>AI Suggest Argument</Button>
                    </div>
                </Card>
            )}
        </div>
    );
};
