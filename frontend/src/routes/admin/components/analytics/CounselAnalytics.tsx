/**
 * CounselAnalytics.tsx
 *
 * Analyzes opposing counsel behavioral patterns, settlement tendencies,
 * and strategic insights for negotiation planning.
 *
 * @module components/analytics/CounselAnalytics
 * @category Analytics - Counsel Intelligence
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertTriangle, Scale, TrendingUp, Users } from 'lucide-react';
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Card } from '@/components/molecules/Card/Card';

// Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Utils
import { cn } from '@/lib/cn';

// Types
import type { OpposingCounselProfile } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface CounselAnalyticsProps {
  /** Opposing counsel profile with historical data */
  counsel: OpposingCounselProfile;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CounselAnalytics - Opposing counsel behavioral analysis
 *
 * Provides strategic insights including:
 * - Settlement vs. trial rates
 * - Negotiation patterns and leverage points
 * - Behavioral tendencies in different case phases
 */
export function CounselAnalytics({ counsel }: CounselAnalyticsProps) {
  // ==========================================================================
  // HOOKS - Context
  // ==========================================================================
  const { theme } = useTheme();

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {/* Counsel Profile & Statistics */}
      <Card className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className={cn("font-bold text-lg", theme.text.primary)}>{counsel.name}</h3>
            <p className={cn("text-sm", theme.text.secondary)}>{counsel.firm}</p>
          </div>
          <div className={cn("p-2 rounded-lg", theme.surface.highlight)}>
            <Users className={cn("h-6 w-6", theme.primary.text)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className={cn("text-center p-4 rounded-lg border flex flex-col justify-center", theme.surface.highlight, theme.border.default)}>
            <Scale className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
            <p className="text-3xl font-bold text-indigo-600">{counsel.settlementRate}%</p>
            <p className={cn("text-xs font-bold uppercase mt-1", theme.text.secondary)}>Settlement Rate</p>
          </div>
          <div className={cn("text-center p-4 rounded-lg border flex flex-col justify-center", theme.surface.highlight, theme.border.default)}>
            <AlertTriangle className={cn("h-6 w-6 mx-auto mb-2", theme.status.warning.text)} />
            <p className={cn("text-3xl font-bold", theme.status.warning.text)}>{counsel.trialRate}%</p>
            <p className={cn("text-xs font-bold uppercase mt-1", theme.text.secondary)}>Trial Rate</p>
          </div>
        </div>
      </Card>

      {/* Strategic Insights */}
      <Card title="Negotiation Strategy">
        <div className="space-y-6">
          <p className={cn("text-sm leading-relaxed", theme.text.secondary)}>
            Historical data indicates firm tends to settle <strong>{counsel.avgSettlementVariance}% above</strong> calculated case value when pressed on discovery disputes.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className={theme.text.secondary}>Fair Market Value</span>
              <span className={theme.text.secondary}>Settlement Target</span>
            </div>
            <div className={cn("w-full h-8 rounded-full relative", theme.surface.highlight)}>
              {/* Baseline */}
              <div className={cn("absolute left-[50%] top-0 bottom-0 w-0.5 z-10", theme.border.default)}></div>

              {/* Range */}
              <div className="absolute top-2 bottom-2 left-[50%] w-[12%] bg-green-500/20 border-l border-r border-green-500"></div>

              {/* Markers */}
              <div className={cn("absolute top-[-20px] left-[50%] -translate-x-1/2 text-[10px] font-bold", theme.text.secondary)}>
                1.0x
              </div>
              <div className="absolute top-[-20px] left-[62%] -translate-x-1/2 text-[10px] font-bold text-green-600">
                1.12x
              </div>
            </div>
            <p className={cn("text-xs text-center mt-2 italic", theme.text.tertiary)}>
              Likely Settlement Zone
            </p>
          </div>

          <div className={cn("p-4 rounded-lg border text-sm", theme.border.default, theme.surface.highlight)}>
            <h4 className={cn("font-bold mb-2 flex items-center", theme.text.primary)}>
              <TrendingUp className={cn("h-4 w-4 mr-2", theme.primary.text)} /> Behavioral Insight
            </h4>
            <p className={theme.text.secondary}>
              Often files early Motions to Dismiss to test plaintiff resolve. If defeated, willingness to settle increases significantly (+40%).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CounselAnalytics;
