import { AlertTriangle, ArrowRight, BookOpen, Clock, Gavel, MapPin, Scale } from 'lucide-react';

import { Button } from '@/components/atoms/Button/Button';
import { AdaptiveLoader } from '@/components/molecules/AdaptiveLoader/AdaptiveLoader';
import { Card } from '@/components/molecules/Card/Card';
import { MetricCard } from '@/components/molecules/MetricCard/MetricCard';
import { type RulesView } from '@/config/tabs.config';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { DataService } from '@/services/data/data-service.service';

import type { JudgeProfile } from '@/types';

interface RulesDashboardProps {
    onNavigate: (view: RulesView) => void;
}

export function RulesDashboard({ onNavigate }: RulesDashboardProps) {
    const { theme } = useTheme();

    // Performance Engine: useQuery
    const { data: judges = [], isLoading } = useQuery<JudgeProfile[]>(
        ['analytics', 'judges'],
        DataService.analysis.getJudgeProfiles
    );

    if (isLoading) return <AdaptiveLoader contentType="dashboard" shimmer />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard label="Federal Rules" value="4 Sets" icon={Scale} className="border-l-4 border-l-blue-600" />
                <MetricCard label="Local Jurisdictions" value="3" icon={MapPin} className="border-l-4 border-l-indigo-600" />
                <MetricCard label="Recent Amendments" value="2" icon={Clock} trend="Dec 1, 2024" trendUp={true} className="border-l-4 border-l-amber-500" />
                <MetricCard label="Standing Orders" value={judges.length * 4} icon={Gavel} className="border-l-4 border-l-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Quick Access Library" subtitle="Frequently accessed rule sets">
                    <div className="space-y-3">
                        <div className={cn("flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md", theme.surface.default, theme.border.default)} onClick={() => onNavigate('federal_evidence')}>
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", theme.surface.highlight, theme.text.link)}><BookOpen className="h-6 w-6" /></div>
                                <div>
                                    <h4 className={cn("font-bold text-lg", theme.text.primary)}>Federal Rules of Evidence</h4>
                                    <p className={cn("text-xs", theme.text.secondary)}>FRE • Last Updated Dec 2023</p>
                                </div>
                            </div>
                            <ArrowRight className={cn("h-5 w-5", theme.text.tertiary)} />
                        </div>

                        <div className={cn("flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md", theme.surface.default, theme.border.default)} onClick={() => onNavigate('federal_civil')}>
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20", "text-purple-700")}><Scale className="h-6 w-6" /></div>
                                <div>
                                    <h4 className={cn("font-bold text-lg", theme.text.primary)}>Federal Rules of Civil Procedure</h4>
                                    <p className={cn("text-xs", theme.text.secondary)}>FRCP • Last Updated Dec 2023</p>
                                </div>
                            </div>
                            <ArrowRight className={cn("h-5 w-5", theme.text.tertiary)} />
                        </div>

                        <div className={cn("flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md", theme.surface.default, theme.border.default)} onClick={() => onNavigate('local')}>
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20", "text-emerald-700")}><MapPin className="h-6 w-6" /></div>
                                <div>
                                    <h4 className={cn("font-bold text-lg", theme.text.primary)}>N.D. Cal. Local Rules</h4>
                                    <p className={cn("text-xs", theme.text.secondary)}>Civil & Admiralty • Effective Nov 2023</p>
                                </div>
                            </div>
                            <ArrowRight className={cn("h-5 w-5", theme.text.tertiary)} />
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card title="Compliance Alerts">
                        <div className="space-y-4">
                            <div className={cn("p-3 rounded-lg border flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20", theme.border.default, theme.text.primary)}>
                                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <h4 className="font-bold text-sm text-amber-700 dark:text-amber-400">FRCP Amendment Pending</h4>
                                    <p className={cn("text-xs mt-1", theme.text.secondary)}>Proposed changes to Rule 16 and 26 regarding privilege logs take effect Dec 1, 2024.</p>
                                    <button className="text-xs font-bold mt-2 hover:underline text-amber-700 dark:text-amber-400">Review Impact</button>
                                </div>
                            </div>
                            <div className={cn("p-3 rounded-lg border flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20", theme.border.default, theme.text.primary)}>
                                <Clock className={cn("h-5 w-5 shrink-0 mt-0.5", theme.text.link)} />
                                <div>
                                    <h4 className={cn("font-bold text-sm", theme.text.link)}>Judge Brinkema Standing Order</h4>
                                    <p className={cn("text-xs mt-1", theme.text.secondary)}>Updated procedure for remote witness testimony in civil trials.</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Rules Search">
                        <div className="flex gap-2">
                            <input
                                className={cn("flex-1 p-2 rounded border text-sm outline-none focus:ring-2 focus:ring-blue-500", theme.surface.highlight, theme.border.default, theme.text.primary)}
                                placeholder="Search by rule number or keyword..."
                            />
                            <Button variant="primary">Search</Button>
                        </div>
                        <div className={cn("flex gap-4 mt-3 text-xs", theme.text.secondary)}>
                            <span>Popular:</span>
                            <span className="hover:text-blue-600 cursor-pointer underline">Rule 12(b)(6)</span>
                            <span className="hover:text-blue-600 cursor-pointer underline">Rule 26(f)</span>
                            <span className="hover:text-blue-600 cursor-pointer underline">Hearsay</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
