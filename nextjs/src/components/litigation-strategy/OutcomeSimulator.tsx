import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/shadcn/card';
import { Slider } from '@/components/ui/shadcn/slider';
import { DataService } from '@/services/data/dataService';
import { BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/shadcn/progress';

interface SimulationResult {
  winProbability: number;
  settlementValue: number;
  riskScore: number;
  factors: string[];
}

export const OutcomeSimulator: React.FC<{ caseId?: string }> = ({ caseId }) => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [parameters, setParameters] = useState({
    judgeBias: 50,
    evidenceStrength: 70,
    precedentFavorability: 60
  });

  // Calculate generic probability based on sliders if no API result
  const derivedProbability = Math.round(
    (parameters.judgeBias * 0.2) +
    (parameters.evidenceStrength * 0.5) +
    (parameters.precedentFavorability * 0.3)
  );

  useEffect(() => {
    // If a caseId is provided, we could fetch initial analysis
    if (caseId) {
      const fetchAnalysis = async () => {
        try {
          // Attempt to get analytics for the case
          // This is hypothetical - mapping to an analytics endpoint
          const data = await DataService.analytics.getCaseMetrics(caseId);
          if (data && data.predictive) {
             setParameters({
               judgeBias: data.predictive.judgeScore || 50,
               evidenceStrength: data.predictive.evidenceScore || 50,
               precedentFavorability: data.predictive.precedentScore || 50
             });
          }
        } catch (e) {
          console.error("Failed to load case analytics", e);
        }
      };
      fetchAnalysis();
    }
  }, [caseId]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-purple-600" />
          Outcome Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Evidence Strength</span>
              <span className="font-medium">{parameters.evidenceStrength}%</span>
            </div>
            <Slider
              value={[parameters.evidenceStrength]}
              onValueChange={([v]) => setParameters(p => ({...p, evidenceStrength: v}))}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precedent Favorability</span>
              <span className="font-medium">{parameters.precedentFavorability}%</span>
            </div>
            <Slider
              value={[parameters.precedentFavorability]}
              onValueChange={([v]) => setParameters(p => ({...p, precedentFavorability: v}))}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Judge/Jury Disposition</span>
              <span className="font-medium">{parameters.judgeBias}%</span>
            </div>
            <Slider
              value={[parameters.judgeBias]}
              onValueChange={([v]) => setParameters(p => ({...p, judgeBias: v}))}
              max={100}
              step={1}
            />
          </div>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg space-y-4 border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Win Probability
              </span>
              <span className="text-2xl font-bold text-emerald-600">
                {derivedProbability}%
              </span>
            </div>
            <Progress value={derivedProbability} className="h-2" />
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground pt-2 border-t">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
            <p>
              Simulation based on current case parameters.
              {derivedProbability > 75 ? ' Favorable outcome likely.' : ' Significant risk factors detected.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
