
// components/research/ShepardizingTool.tsx
import React, { useState } from 'react';
import { Scale, Loader2, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { useTheme } from '../../../providers/ThemeContext';
import { cn } from '@/utils/cn';
import { GeminiService, ShepardizeResult, TreatmentType } from '@/services/features/research/geminiService';

export const ShepardizingTool: React.FC = () => {
  const { theme } = useTheme();
  const [citation, setCitation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ShepardizeResult | null>(null);

  const handleSearch = async () => {
    if (!citation) return;
    setIsLoading(true);
    setResult(null);
    const res = await GeminiService.shepardizeCitation(citation);
    setResult(res);
    setIsLoading(false);
  };

  const getTreatmentBadge = (treatment: TreatmentType) => {
    switch(treatment) {
      case 'Followed': return <Badge variant="success">{treatment}</Badge>;
      case 'Distinguished':
      case 'Questioned':
        return <Badge variant="warning">{treatment}</Badge>;
      case 'Criticized': return <Badge variant="error">{treatment}</Badge>;
      default: return <Badge variant="neutral">{treatment}</Badge>;
    }
  };

  const getHistoryIcon = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('affirm')) return <CheckCircle className="h-4 w-4 text-green-500"/>;
    if (lowerAction.includes('revers') || lowerAction.includes('vacat')) return <XCircle className="h-4 w-4 text-red-500"/>;
    if (lowerAction.includes('appeal')) return <AlertTriangle className="h-4 w-4 text-amber-500"/>;
    return <HelpCircle className="h-4 w-4 text-slate-400"/>;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className={cn("p-6 rounded-lg border flex flex-col md:flex-row gap-4 items-center", theme.surface.default, theme.border.default)}>
        <div className="flex-1 w-full">
            <h3 className={cn("font-bold text-lg flex items-center", theme.text.primary)}><Scale className="h-5 w-5 mr-2 text-blue-600"/> Citation Analysis</h3>
            <p className={cn("text-sm", theme.text.secondary)}>Check appellate history and treatment of a case citation.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <input 
                value={citation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCitation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., 410 U.S. 113"
                className={cn("flex-1 p-2 border rounded-md text-sm font-mono", theme.surface.highlight, theme.border.default)}
            />
            <Button onClick={handleSearch} isLoading={isLoading} disabled={!citation || isLoading}>
                {isLoading ? 'Analyzing...' : 'Shepardize'}
            </Button>
        </div>
      </div>

      {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600"/></div>}
      
      {result && (
        <div className="space-y-6">
            <Card title={<>Analysis for: <span className={theme.primary.text}>{result.caseName}</span></>} subtitle={result.citation}>
                <p className={cn("text-sm leading-relaxed", theme.text.secondary)}>{result.summary}</p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Appellate History">
                    <div className="space-y-3">
                        {result.history.map((h, i) => (
                            <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg border", theme.surface.highlight, theme.border.default)}>
                                {getHistoryIcon(h.action)}
                                <div>
                                    <p className={cn("text-sm font-medium", theme.text.primary)}>{h.action}</p>
                                    <p className={cn("text-xs", theme.text.secondary)}>{h.citingCase} {h.citingCitation && `(${h.citingCitation})`}</p>
                                </div>
                            </div>
                        ))}
                         {result.history.length === 0 && <p className={cn("text-xs text-center italic", theme.text.tertiary)}>No appellate history found.</p>}
                    </div>
                </Card>

                <Card title="Citing Treatment">
                     <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {result.treatment.map((t, i) => (
                            <div key={i} className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className={cn("font-bold text-sm", theme.text.primary)}>{t.citingCase}</h5>
                                    {getTreatmentBadge(t.treatment)}
                                </div>
                                <blockquote className={cn("border-l-4 pl-4 text-sm italic", theme.border.default, theme.text.secondary)}>
                                    "{t.quote}"
                                </blockquote>
                            </div>
                        ))}
                        {result.treatment.length === 0 && <p className={cn("text-xs text-center italic", theme.text.tertiary)}>No citing treatments found.</p>}
                    </div>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
};

export default ShepardizingTool;

