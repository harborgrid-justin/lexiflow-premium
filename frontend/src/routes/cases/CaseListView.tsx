/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Case List View - Pure Presentation Layer
 *
 * ENTERPRISE ARCHITECTURE PATTERN:
 * - Pure render function (no side effects)
 * - Consumes context only (no direct data fetching)
 * - Props and stable selectors only
 * - Events flow up (callbacks)
 * - NO business logic
 * - NO navigation
 * - NO data fetching
 *
 * RESPONSIBILITY:
 * - Render UI based on context state
 * - Handle user interactions (pass events up)
 * - Accessibility
 * - Visual presentation
 *
 * @module routes/cases/CaseListView
 */

import { Button } from '@/components/atoms/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { Case, CaseStatus } from '@/types';
import {
  Activity,
  Archive,
  Briefcase,
  ClipboardList,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Lightbulb,
  Plus,
  Scale,
  Settings,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';
import { lazy, startTransition, Suspense, useMemo } from 'react';
import { useNavigate, useNavigation } from 'react-router';
import { useCaseList } from './CaseListProvider';

// Lazy load tab contents for performance
const CaseOverviewDashboard = lazy(() => import('./components/overview').then(m => ({ default: m.CaseOverviewDashboard })));
const CaseListActive = lazy(() => import('./components/list').then(m => ({ default: m.CaseListActive })));
const CaseListIntake = lazy(() => import('./components/list').then(m => ({ default: m.CaseListIntake })));
const CaseImporter = lazy(() => import('./components/import').then(m => ({ default: m.CaseImporter })));
const CaseOperationsCenter = lazy(() => import('./components/operations').then(m => ({ default: m.CaseOperationsCenter })));

// WORKFLOW COMPONENT IMPORTS
const MasterWorkflow = lazy(() => import('./components/workflow/MasterWorkflow').then(m => ({ default: m.MasterWorkflow })));
const CaseListDocket = lazy(() => import('./components/list').then(m => ({ default: m.CaseListDocket })));
const CaseListTasks = lazy(() => import('./components/list').then(m => ({ default: m.CaseListTasks })));
const CaseListConflicts = lazy(() => import('./components/list').then(m => ({ default: m.CaseListConflicts })));

// PLANNING COMPONENT IMPORTS
const CaseCalendar = lazy(() => import('./components/calendar/CaseCalendar').then(m => ({ default: m.CaseCalendar })));
const CaseFinancialsCenter = lazy(() => import('./components/financials/CaseFinancialsCenter').then(m => ({ default: m.CaseFinancialsCenter })));
const CaseInsightsDashboard = lazy(() => import('./components/insights/CaseInsightsDashboard').then(m => ({ default: m.CaseInsightsDashboard })));

// RESOURCES COMPONENT IMPORTS
const CaseListResources = lazy(() => import('./components/list').then(m => ({ default: m.CaseListResources })));
const CaseListExperts = lazy(() => import('./components/list').then(m => ({ default: m.CaseListExperts })));
const CaseListReporters = lazy(() => import('./components/list').then(m => ({ default: m.CaseListReporters })));
const CaseListTrust = lazy(() => import('./components/list').then(m => ({ default: m.CaseListTrust })));

// ADMIN COMPONENT IMPORTS
const CaseListClosing = lazy(() => import('./components/list').then(m => ({ default: m.CaseListClosing })));
const CaseListArchived = lazy(() => import('./components/list').then(m => ({ default: m.CaseListArchived })));
const CaseListMisc = lazy(() => import('./components/list').then(m => ({ default: m.CaseListMisc })));
const CaseAnalyticsDashboard = lazy(() => import('./components/analytics/CaseAnalyticsDashboard').then(m => ({ default: m.CaseAnalyticsDashboard })));

/**
 * Tab configuration (presentation concern)
 */
const CASE_TABS = [
  {
    id: 'cases_group',
    label: 'Cases',
    icon: Briefcase,
    subTabs: [
      { id: 'overview', label: 'Overview Dashboard', icon: Eye },
      { id: 'active', label: 'Active Cases', icon: Briefcase },
      { id: 'intake', label: 'Intake Pipeline', icon: ClipboardList },
      { id: 'import', label: 'Import Data', icon: FileText },
      { id: 'operations', label: 'Operations Center', icon: Activity },
    ],
  },
  {
    id: 'workflow_group',
    label: 'Workflow',
    icon: Settings,
    subTabs: [
      { id: 'workflows', label: 'Master Workflow', icon: Activity },
      { id: 'docket', label: 'Docket & Filings', icon: FileText },
      { id: 'tasks', label: 'Tasks & Deadlines', icon: Clock },
      { id: 'conflicts', label: 'Conflict Checks', icon: Shield },
    ],
  },
  {
    id: 'planning_group',
    label: 'Planning',
    icon: DollarSign,
    subTabs: [
      { id: 'calendar', label: 'Case Calendar', icon: Clock },
      { id: 'financials', label: 'Financials', icon: DollarSign },
      { id: 'insights', label: 'Insights & Risk', icon: Lightbulb },
    ],
  },
  {
    id: 'resources_group',
    label: 'Resources',
    icon: Users,
    subTabs: [
      { id: 'resources', label: 'Resource Allocation', icon: Users },
      { id: 'experts', label: 'Expert Witnesses', icon: Users },
      { id: 'reporters', label: 'Court Reporters', icon: Users },
      { id: 'trust', label: 'Trust Accounting', icon: Scale },
    ],
  },
  {
    id: 'admin_group',
    label: 'Admin',
    icon: Archive,
    subTabs: [
      { id: 'closing', label: 'Closing Queue', icon: Archive },
      { id: 'archived', label: 'Archived Cases', icon: Archive },
      { id: 'misc', label: 'Bulk Operations', icon: Settings },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    ],
  },
];

/**
 * Pure presentation component
 * All data comes from context
 * All events flow up via callbacks
 */
export function CaseListView() {
  const navigate = useNavigate();

  // CONTEXT CONSUMPTION (read-only)
  const {
    metrics,
    filteredCases,
    filters,
    setFilters,
    activeTab,
    setActiveTab,
    handleParentTabChange,
    isPending,
  } = useCaseList();

  // Adapter for CaseListActive props
  const activeCaseProps = useMemo(() => ({
    filteredCases,
    statusFilter: (filters.status as string) || 'All',
    setStatusFilter: (s: string) => setFilters({ status: s === 'All' ? undefined : (s as CaseStatus) }),
    typeFilter: filters.type || 'All',
    setTypeFilter: (t: string) => setFilters({ type: t === 'All' ? undefined : t }),
    searchTerm: filters.search || '',
    setSearchTerm: (s: string) => setFilters({ search: s }),
    dateFrom: filters.dateRange?.start?.toISOString() || '',
    setDateFrom: (d: string) => setFilters({
      dateRange: {
        start: d ? new Date(d) : (filters.dateRange?.start || new Date(0)),
        end: filters.dateRange?.end || new Date()
      }
    }),
    dateTo: filters.dateRange?.end?.toISOString() || '',
    setDateTo: (d: string) => setFilters({
      dateRange: {
        start: filters.dateRange?.start || new Date(0),
        end: d ? new Date(d) : (filters.dateRange?.end || new Date())
      }
    }),
    resetFilters: () => setFilters({ status: undefined, type: undefined, search: undefined, dateRange: undefined }),
    onSelectCase: (c: Case) => navigate(`/cases/${c.id}`),
  }), [filteredCases, filters, setFilters, navigate]);

  const handleSelectCaseId = (id: string) => navigate(`/cases/${id}`);

  // THEME (presentation concern - currently unused)
  // const { theme, isPendingThemeChange } = useTheme();

  // ROUTER HOOKS (navigation concern)
  // const submit = useSubmit(); // TODO: Use for form submissions
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // DERIVED STATE (presentation logic only)
  const activeParentData = useMemo(() => {
    return CASE_TABS.find(parent =>
      parent.subTabs.some(sub => sub.id === activeTab)
    ) || CASE_TABS[0];
  }, [activeTab]);

  /**
   * Handle new case creation
   * Uses React Router form submission (progressive enhancement)
   */
  const handleCreateCase = () => {
    const formData = new FormData();
    formData.append('intent', 'create');
    // TODO: Open modal for case details instead of direct submit
    // For now, this is a placeholder that needs proper form UI
    console.log('Create case clicked - TODO: Open modal');
  };

  /**
   * Handle tab change with transition for non-urgent update
   */
  const handleTabChange = (tabId: string) => {
    startTransition(() => {
      setActiveTab(tabId);
    });
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Case Management"
        icon={Briefcase}
        actions={
          <Button
            onClick={handleCreateCase}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        }
      />

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Cases"
          value={metrics.activeCases}
          icon={<Briefcase className="h-5 w-5" />}
          trend="neutral"
        />
        <MetricCard
          title="Intake Pipeline"
          value={metrics.intakePipeline}
          icon={<ClipboardList className="h-5 w-5" />}
          trend="neutral"
        />
        <MetricCard
          title="Upcoming Deadlines"
          value={metrics.upcomingDeadlines}
          icon={<Clock className="h-5 w-5" />}
          trend="warning"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend="positive"
        />
      </div>

      {/* PARENT TABS */}
      <div className="flex space-x-1 bg-secondary/20 p-1 rounded-lg">
        {CASE_TABS.map((parent) => {
          const Icon = parent.icon;
          const isActive = activeParentData?.id === parent.id;
          return (
            <button
              key={parent.id}
              onClick={() => handleParentTabChange(parent.id, parent.subTabs?.[0]?.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md transition-colors',
                'text-sm font-medium',
                isActive
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <Icon className="h-4 w-4" />
              {parent.label}
            </button>
          );
        })}
      </div>

      {/* SUB TABS */}
      {activeParentData && (
        <div className="flex flex-wrap gap-2">
          {activeParentData.subTabs.map((sub) => {
            const Icon = sub.icon;
            const isActive = activeTab === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleTabChange(sub.id)}
                disabled={isPending}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors',
                  'text-sm border',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground',
                  isPending && 'opacity-50 cursor-wait'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {sub.label}
              </button>
            );
          })}
        </div>
      )}

      {/* CONTENT AREA */}
      <div className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm p-6',
        isPending && 'opacity-70 transition-opacity'
      )}>
        <Suspense fallback={<AdaptiveLoader contentType="list" message="Loading tab content..." />}>
          {activeTab === 'overview' && <CaseOverviewDashboard />}
          {activeTab === 'active' && <CaseListActive {...activeCaseProps} />}
          {activeTab === 'intake' && <CaseListIntake />}
          {activeTab === 'import' && <CaseImporter />}
          {activeTab === 'operations' && <CaseOperationsCenter />}

          {/* WORKFLOW TABS */}
          {activeTab === 'workflows' && <MasterWorkflow onSelectCase={handleSelectCaseId} />}
          {activeTab === 'docket' && <CaseListDocket onSelectCase={activeCaseProps.onSelectCase} />}
          {activeTab === 'tasks' && <CaseListTasks onSelectCase={activeCaseProps.onSelectCase} />}
          {activeTab === 'conflicts' && <CaseListConflicts onSelectCase={activeCaseProps.onSelectCase} />}

          {/* PLANNING TABS */}
          {activeTab === 'calendar' && <CaseCalendar />}
          {activeTab === 'financials' && <CaseFinancialsCenter />}
          {activeTab === 'insights' && <CaseInsightsDashboard />}

          {/* RESOURCES TABS */}
          {activeTab === 'resources' && <CaseListResources />}
          {activeTab === 'experts' && <CaseListExperts />}
          {activeTab === 'reporters' && <CaseListReporters />}
          {activeTab === 'trust' && <CaseListTrust />}

          {/* ADMIN TABS */}
          {activeTab === 'closing' && <CaseListClosing />}
          {activeTab === 'archived' && <CaseListArchived onSelectCase={activeCaseProps.onSelectCase} />}
          {activeTab === 'misc' && <CaseListMisc />}
          {activeTab === 'analytics' && <CaseAnalyticsDashboard />}

          {/* Fallback for unimplemented tabs */}
          {![
            'overview',
            'active',
            'intake',
            'import',
            'operations',
            'workflows',
            'docket',
            'tasks',
            'conflicts',
            'calendar',
            'financials',
            'insights',
            'resources',
            'experts',
            'reporters',
            'trust',
            'closing',
            'archived',
            'misc',
            'analytics'
          ].includes(activeTab) && (
              <div className="text-center text-muted-foreground py-12">
                <p>Content for "{activeTab}" tab</p>
                <p className="text-sm mt-2">
                  This module is currently under development.
                </p>
              </div>
            )}
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Metric Card Component (pure presentation)
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral' | 'warning';
}

function MetricCard({ title, value, icon, trend = 'neutral' }: MetricCardProps) {
  const { tokens } = useTheme();

  const trendColor = trend === 'positive' ? tokens.colors.success :
    trend === 'negative' ? tokens.colors.error :
      trend === 'warning' ? tokens.colors.warning :
        tokens.colors.info;

  return (
    <div
      style={{
        backgroundColor: tokens.colors.surface,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: tokens.borderRadius.lg,
        boxShadow: tokens.shadows.sm
      }}
      className="p-4"
    >
      <div className="flex items-center justify-between">
        <p style={{ color: tokens.colors.textMuted }} className="text-sm font-medium">{title}</p>
        <div
          style={{
            backgroundColor: tokens.colors.surfaceHover,
            color: trendColor,
            borderRadius: tokens.borderRadius.full
          }}
          className="p-2"
        >
          {icon}
        </div>
      </div>
      <p style={{ color: tokens.colors.text }} className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

// Adaptive Loader placeholder
function AdaptiveLoader({ contentType: _contentType, message }: { contentType: string; message: string }) {
  const { tokens } = useTheme();
  return (
    <div style={{ color: tokens.colors.textMuted }} className="text-center py-12">
      <div
        style={{
          borderColor: `${tokens.colors.border} ${tokens.colors.border} ${tokens.colors.primary} ${tokens.colors.border}`,
          borderRadius: '50%'
        }}
        className="h-8 w-8 animate-spin border-2 mx-auto mb-3"
      />
      <p>{message}</p>
    </div>
  );
}
