
import React from 'react';
import { Card } from '@/components/molecules';
import { RiskMeter } from '@/components/organisms';
import { Badge } from '@/components/atoms';
import { Star, TrendingUp, DollarSign, Scale } from 'lucide-react';
import { LegalEntity } from '@/types';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';

interface PerformanceScorecardsProps {
  entities: LegalEntity[];
}

export const PerformanceScorecards: React.FC<PerformanceScorecardsProps> = ({ entities }) => {
  const { theme } = useTheme();
  
  const lawFirms = entities.filter(e => e.type === 'Law Firm');

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lawFirms.map((firm, idx) => (
                <Card key={firm.id} title={firm.name} subtitle="Outside Counsel Evaluation">
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-center text-yellow-500 mb-1">
                                <Star className="h-5 w-5 fill-current"/>
                                <span className="text-xl font-bold ml-2 text-slate-900">4.8</span>
                            </div>
                            <p className="text-xs font-bold uppercase text-slate-500">Overall Rating</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-center text-green-600 mb-1">
                                <DollarSign className="h-5 w-5"/>
                                <span className="text-xl font-bold ml-1 text-slate-900">92%</span>
                            </div>
                            <p className="text-xs font-bold uppercase text-slate-500">Budget Adherence</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <RiskMeter value={85} label="Work Product Quality" type="strength" />
                        <RiskMeter value={70} label="Responsiveness" type="strength" />
                        <RiskMeter value={95} label="Diversity & Inclusion" type="strength" />
                    </div>

                    <div className="mt-6 pt-4 border-t flex justify-between items-center">
                        <div className="flex gap-2">
                            <Badge variant="success">Preferred Panel</Badge>
                            <Badge variant="neutral">Litigation</Badge>
                        </div>
                        <span className={cn("text-xs font-medium flex items-center", theme.text.secondary)}>
                            <Scale className="h-3 w-3 mr-1"/> 12 Active Matters
                        </span>
                    </div>
                </Card>
            ))}
            
            {lawFirms.length === 0 && (
                <div className={cn("col-span-2 text-center py-12 text-slate-400 italic")}>
                    No law firm entities found. Add 'Law Firm' type entities to view scorecards.
                </div>
            )}
        </div>
    </div>
  );
};
