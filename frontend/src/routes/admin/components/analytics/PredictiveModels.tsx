/**
 * PredictiveModels.tsx
 *
 * Predictive analytics and machine learning models for case outcomes,
 * settlement predictions, and litigation strategy recommendations.
 *
 * @module components/analytics/PredictiveModels
 * @category Analytics - Predictive Models
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertCircle, BrainCircuit, Target, TrendingUp } from 'lucide-react';
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { EmptyState } from '@/components/molecules/EmptyState/EmptyState';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import type { OutcomePrediction } from '@/lib/frontend-api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface PredictiveModelsProps {
  subTab: 'outcomes';
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================
const PredictiveModelsSkeleton = function PredictiveModelsSkeleton() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i: number) => (
          <div key={`predictive-model-skeleton-${i}`} className={cn("h-96 rounded-lg animate-pulse", theme.surface.raised)} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function PredictiveModels({ subTab }: PredictiveModelsProps) {
  const { theme } = useTheme();

  // ==========================================================================
  // HOOKS - Data Fetching
  // ==========================================================================
  const { data: predictions, isLoading } = useQuery<OutcomePrediction[]>(
    ['analytics', 'outcome-predictions'],
    () => api.outcomePredictions.getPredictions(),
    { staleTime: 5 * 60 * 1000 }
  );

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================
  if (isLoading) {
    return <PredictiveModelsSkeleton />;
  }

  // ==========================================================================
  // EMPTY STATE
  // ==========================================================================
  if (!predictions || predictions.length === 0) {
    return (
      <EmptyState
        icon={BrainCircuit}
        title="No Prediction Models Available"
        description="Predictive analytics require historical case data. Models will be available once sufficient data is collected."
      />
    );
  }

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================
  return (
    <div className="space-y-6 p-6">
      {subTab === 'outcomes' && (
        <>
          {/* Header */}
          <div className={cn("p-6 rounded-lg border", theme.surface.raised, theme.border.default)}>
            <div className="flex items-start gap-3">
              <BrainCircuit className={cn("w-6 h-6 mt-1", theme.text.primary)} />
              <div>
                <h3 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>
                  Case Outcome Predictions
                </h3>
                <p className={theme.text.secondary}>
                  AI-powered predictions based on historical case data, judge rulings, opposing counsel patterns, and case characteristics.
                </p>
              </div>
            </div>
          </div>

          {/* Prediction Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settlement Probability */}
            <div className={cn("p-6 rounded-lg border", theme.surface.raised, theme.border.default)}>
              <div className="flex items-center gap-2 mb-4">
                <Target className={cn("w-5 h-5", theme.text.primary)} />
                <h4 className={cn("font-semibold", theme.text.primary)}>Settlement Probability</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={theme.text.secondary}>Confidence Score</span>
                  <span className={cn("text-2xl font-bold", theme.text.primary)}>--</span>
                </div>
                <p className={cn("text-sm", theme.text.tertiary)}>
                  Model will calculate settlement likelihood based on case factors, opposing party profiles, and historical outcomes.
                </p>
              </div>
            </div>

            {/* Win Probability */}
            <div className={cn("p-6 rounded-lg border", theme.surface.raised, theme.border.default)}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className={cn("w-5 h-5", theme.text.primary)} />
                <h4 className={cn("font-semibold", theme.text.primary)}>Win Probability</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={theme.text.secondary}>Success Rate</span>
                  <span className={cn("text-2xl font-bold", theme.text.primary)}>--</span>
                </div>
                <p className={cn("text-sm", theme.text.tertiary)}>
                  Analysis of similar cases, judge tendencies, and case strength indicators.
                </p>
              </div>
            </div>
          </div>

          {/* Model Information */}
          <div className={cn("p-4 rounded-lg border", theme.surface.overlay, theme.border.default)}>
            <div className="flex items-start gap-2">
              <AlertCircle className={cn("w-5 h-5 mt-0.5", theme.text.primary)} />
              <div>
                <p className={cn("text-sm font-medium mb-1", theme.text.primary)}>
                  Machine Learning Models
                </p>
                <p className={cn("text-xs", theme.text.secondary)}>
                  Predictions are generated using historical case data and continuously improve with more data points.
                  Always use professional judgment in conjunction with these predictions.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictiveModels;
