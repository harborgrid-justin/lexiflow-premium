/**
 * BusinessIntelligence.tsx
 *
 * Main container for Business Intelligence analytics with firm metrics,
 * practice group analytics, attorney performance, and financial KPIs.
 *
 * @module components/analytics/BusinessIntelligence
 * @category Analytics - Business Intelligence
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { BarChart3, Building2, TrendingUp, Users } from 'lucide-react';
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { api } from '@/api';
import { useTheme } from '@/features/theme';
import { useQuery } from '@/hooks/useQueryHooks';
import { cn } from '@/shared/lib/cn';
import { EmptyState } from '@/shared/ui/molecules/EmptyState/EmptyState';
import { MetricCard } from '@/shared/ui/molecules/MetricCard/MetricCard';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface BusinessIntelligenceProps {
  subTab: 'firm' | 'practice' | 'attorney' | 'financial';
}

interface KPIData {
  activeCases: number;
  revenue: number;
  billableHours: number;
  winRate: number;
}

interface TeamPerformanceData {
  billableHours: number;
  utilizationRate: number;
}

interface FinancialMetricsData {
  totalRevenue: number;
  outstandingAR: number;
  collectionRate: number;
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================
const BusinessIntelligenceSkeleton = function BusinessIntelligenceSkeleton() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i: number) => (
          <div key={i} className={cn("h-32 rounded-lg animate-pulse", theme.surface.raised)} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i: number) => (
          <div key={i} className={cn("h-64 rounded-lg animate-pulse", theme.surface.raised)} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function BusinessIntelligence({ subTab }: BusinessIntelligenceProps) {
  const { theme } = useTheme();

  // ==========================================================================
  // HOOKS - Data Fetching
  // ==========================================================================
  const { data: kpis, isLoading: kpisLoading } = useQuery<KPIData>(
    ['analytics', 'kpis'],
    () => api.analyticsDashboard.getKPIs({ period: '30d' }) as Promise<KPIData>,
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: teamPerformance, isLoading: teamLoading } = useQuery<TeamPerformanceData>(
    ['analytics', 'team-performance'],
    () => api.analyticsDashboard.getTeamPerformance({}) as Promise<TeamPerformanceData>,
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: financialMetrics, isLoading: financialLoading } = useQuery<FinancialMetricsData>(
    ['analytics', 'financial-metrics'],
    () => api.analyticsDashboard.getFinancialMetrics({}) as Promise<FinancialMetricsData>,
    { staleTime: 5 * 60 * 1000 }
  );

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================
  if (kpisLoading || teamLoading || financialLoading) {
    return <BusinessIntelligenceSkeleton />;
  }

  // ==========================================================================
  // EMPTY STATE
  // ==========================================================================
  const hasData = kpis || teamPerformance || financialMetrics;
  if (!hasData) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No Analytics Data Available"
        description="Business intelligence data will appear here once you have cases, billing, and team activity."
      />
    );
  }

  // ==========================================================================
  // RENDER BY SUB-TAB
  // ==========================================================================
  return (
    <div className="space-y-6 p-6">
      {/* Firm Metrics */}
      {subTab === 'firm' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Active Cases"
              value={kpis?.activeCases || 0}
              icon={Building2}
              trend="0%"
            />
            <MetricCard
              label="Revenue"
              value={`$${(kpis?.revenue || 0).toLocaleString()}`}
              icon={TrendingUp}
              trend="0%"
            />
            <MetricCard
              label="Billable Hours"
              value={kpis?.billableHours || 0}
              icon={BarChart3}
              trend="0%"
            />
            <MetricCard
              label="Win Rate"
              value={`${kpis?.winRate || 0}%`}
              icon={TrendingUp}
              trend="0%"
            />
          </div>
          <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
            <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
              Firm Performance Overview
            </h3>
            <p className={theme.text.secondary}>
              Detailed metrics and charts will be displayed here.
            </p>
          </div>
        </>
      )}

      {/* Practice Group */}
      {subTab === 'practice' && (
        <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
          <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
            Practice Group Analytics
          </h3>
          <p className={theme.text.secondary}>
            Practice area performance, specialization metrics, and revenue by practice group.
          </p>
        </div>
      )}

      {/* Attorney Performance */}
      {subTab === 'attorney' && (
        <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
          <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
            Attorney Performance
          </h3>
          <div className="space-y-4">
            <MetricCard
              label="Billable Hours"
              value={teamPerformance?.billableHours || 0}
              icon={BarChart3}
              trend="0%"
            />
            <MetricCard
              label="Utilization Rate"
              value={`${teamPerformance?.utilizationRate || 0}%`}
              icon={Users}
              trend="0%"
            />
            <p className={theme.text.secondary}>
              Individual attorney metrics, utilization rates, and performance comparisons.
            </p>
          </div>
        </div>
      )}

      {/* Financial KPIs */}
      {subTab === 'financial' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              label="Total Revenue"
              value={`$${(financialMetrics?.totalRevenue || 0).toLocaleString()}`}
              icon={TrendingUp}
              trend="0%"
            />
            <MetricCard
              label="Outstanding A/R"
              value={`$${(financialMetrics?.outstandingAR || 0).toLocaleString()}`}
              icon={BarChart3}
              trend="0%"
            />
            <MetricCard
              label="Collection Rate"
              value={`${financialMetrics?.collectionRate || 0}%`}
              icon={TrendingUp}
              trend="0%"
            />
          </div>
          <div className={cn("p-6 rounded-lg", theme.surface.raised)}>
            <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
              Financial Performance
            </h3>
            <p className={theme.text.secondary}>
              Revenue trends, billing efficiency, realization rates, and financial forecasting.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default BusinessIntelligence;
