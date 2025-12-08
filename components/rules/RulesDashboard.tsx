
import React from 'react';
import { MetricCard } from '../common/Primitives';
import { Card } from '../common/Card';
import { BookOpen, Gavel, AlertTriangle, Clock, ArrowRight, Scale, MapPin, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { useQuery } from '../../services/queryClient';
import { DataService } from '../../services/dataService';

interface RulesDashboardProps {
    onNavigate: (view: any) => void;
}

export const RulesDashboard: React.FC<RulesDashboardProps> = ({ onNavigate }) => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  // FIX: Property 'analytics' does not exist on type... Did you mean 'analysis'?
  const { data: judges = [], isLoading } = useQuery(
      ['analytics', 'judges'], 
      DataService.analysis.getJudgeProfiles
  );

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard label="Federal Rules" value="4 Sets" icon={Scale} className="border-l-4 border-l-blue-600"/>
            <MetricCard label="Local Jurisdictions" value="3" icon={MapPin} className="border-l-4 border-l-indigo-600"/>
            <MetricCard label="Recent Amendments" value="2" icon={Clock} trend="Dec 1, 2024" trendUp={true} className="border-l-4 border-l-amber-500"/>
            <MetricCard label="Standing Orders" value={judges.length * 4} icon={Gavel} className="border-l-4 border-l-purple-600"/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Quick Access Library" subtitle="Frequently accessed rule sets">
                <div className="space-y-3">
                    <div className={cn("flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md", theme.surface, theme.border.default)} onClick={() => onNavigate('federal_evidence')}>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-700"><BookOpen className="h-6 w-6"/></div>
                            <div>
                                <h4 className={cn("font-bold text-lg", theme.text.primary)}>Federal Rules of Evidence</h4>
                                <p className={cn("text-xs", theme.text.secondary)}>FRE • Last Updated Dec 2023</p>
                            </div>
                        </div>
                        <ArrowRight className={cn("h-5 w-5", theme.text.tertiary)}/>
                    </div>

                    <div className={cn("flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md", theme.surface, theme.border.default)} onClick={() => onNavigate('federal_civil')}>
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-700"><Scale className="h-6 w-6"/></div>
                            <div>
                                <h4 className={cn("font-bold text-lg", theme.text.primary)}>Federal Rules of Civil Procedure</h4>
                                <p className={cn("text-xs", theme.text.secondary)}>FRCP • Last Updated Dec 2023</p>
                            </div>
                        </div>
                        <ArrowRight className={cn("h-5 w-5", theme.text.tertiary)}/>
                    </div>

                    <div className={cn("flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md", theme.surface, theme.border.default)} onClick={() => onNavigate('local')}>
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700"><MapPin className="h-6 w-6"/></div>
                            <div>
                                <h4 className={cn("font-bold text-lg", theme.text.primary)}>N.D. Cal. Local Rules</h4>
                                <p className={cn("text-xs", theme.text.secondary)}>Civil & Admiralty • Effective Nov 2023</p>
                            </div>
                        </div>
                        <ArrowRight className={cn("h-5 w-5", theme.text.tertiary)}/>
                    </div>
                </div>
            </Card>

            <div className="space-y-6">
                <Card title="Compliance Alerts">
                    <div className="space-y-4">
                        <div className={cn("p-3 rounded-lg border flex items-start gap-3 bg-amber-50 border-amber-100", theme.text.primary)}>
                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"/>
                            <div>
                                <h4 className="font-bold text-sm text-amber-800">FRCP Amendment Pending</h4>
                                <p className="text-xs text-amber-700 mt-1">Proposed changes to Rule 16 and 26 regarding privilege logs take effect Dec 1, 2024.</p>
                                <button className="text-xs font-bold text-amber-900 mt-2 hover:underline">Review Impact</button>
                            </div>
                        </div>
                        <div className={cn("p-3 rounded-lg border flex items-start gap-3 bg-blue-50 border-blue-100", theme.text.primary)}>
                            <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"/>
                            <div>
                                <h4 className="font-bold text-sm text-blue-800">Judge Brinkema Standing Order</h4>
                                <p className="text-xs text-blue-700 mt-1">Updated procedure for remote witness testimony in civil trials.</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Rules Search">
                    <div className="flex gap-2">
                        <input 
                            className={cn("flex-1 p-2 rounded border text-sm outline-none focus:ring-2 focus:ring-blue-500", theme.surfaceHighlight, theme.border.default, theme.text.primary)}
                            placeholder="Search by rule number or keyword..."
                        />
                        <Button variant="primary">Search</Button>
                    </div>
                    <div className={cn("flex gap-2 mt-3 text-xs", theme.text.secondary)}>
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