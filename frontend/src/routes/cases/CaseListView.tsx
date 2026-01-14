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

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button';
import { PageHeader } from '@/shared/ui/organisms/PageHeader';
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
import { startTransition, useMemo } from 'react';
import { useNavigation } from 'react-router';
import { useCaseList } from './CaseListProvider';

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
  // CONTEXT CONSUMPTION (read-only)
  const {
    metrics,
    activeTab,
    setActiveTab,
    handleParentTabChange,
    isPending,
  } = useCaseList();

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
              onClick={() => handleParentTabChange(parent.id)}
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
        {/* TODO: Lazy load tab content based on activeTab */}
        <div className="text-center text-muted-foreground py-12">
          <p>Content for "{activeTab}" tab</p>
          <p className="text-sm mt-2">
            Tab content will be lazy-loaded here
          </p>
        </div>
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
  const trendColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-blue-600 dark:text-blue-400',
    warning: 'text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('rounded-full p-2 bg-secondary', trendColors[trend])}>
          {icon}
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
