/**
 * @module components/matters/CaseManagement
 * @category Case Management
 * @description Main case management interface with tabbed navigation following Case Workflows pattern
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with useTransition for tab switching
 * - Guideline 28: Theme usage is pure function for management UI
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for smooth transitions
 * - Guideline 38: startTransition for non-urgent tab updates
 *
 * ARCHITECTURE:
 * - Uses PageHeader + two-level tabs (parent/sub) like MasterWorkflow
 * - Stats cards between navigation and content
 * - Lazy loads tab content via MatterManagerContent
 * - Session storage for tab persistence
 * - Backend API integration via DataService
 */

import { PATHS } from '@/config/paths.config';
import { MatterView } from '@/config/tabs.config';
import { useQuery } from '@/hooks/useQueryHooks';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { api } from '@/lib/frontend-api';
import { QUERY_KEYS } from '@/services/data/queryKeys';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader';
import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { useTheme } from '@/theme';
import { CaseStatus, type Case, type Invoice } from '@/types';
import { Activity, Archive, Briefcase, ClipboardList, Clock, DollarSign, Eye, FileText, Lightbulb, Plus, RefreshCw, Scale, Settings, Shield, TrendingUp, Users } from 'lucide-react';
import React, { Suspense, useMemo, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaseManagerContent } from './CaseManagerContent';

// Two-level tab configuration
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

interface CaseManagementProps {
  initialCases?: Case[];
  initialInvoices?: Invoice[];
  onSelectCase?: (id: string) => void;
}

export const CaseManagement: React.FC<CaseManagementProps> = ({ initialCases, initialInvoices, onSelectCase }) => {
  // Guideline 34: Side-effect free context read
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('cases_active_tab', 'overview');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      _setActiveTab(tab);
    });
  };

  // Find active parent tab based on active sub-tab
  const activeParentTab = useMemo(() => {
    return CASE_TABS.find(parent =>
      parent.subTabs.some(sub => sub.id === activeTab)
    ) || CASE_TABS[0];
  }, [activeTab]);

  const handleParentTabChange = (parentId: string) => {
    const parent = CASE_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs![0]?.id || '');
    }
  };

  // Fetch KPIs for stats
  const { data: cases } = useQuery(QUERY_KEYS.CASES.ALL, () => api.cases.getAll(), {
    initialData: initialCases,
    onError: (error) => console.error('[CaseManagement] Failed to fetch cases:', error)
  });
  const { data: invoices } = useQuery(QUERY_KEYS.BILLING.INVOICES, () => api.billing.getInvoices(), {
    initialData: initialInvoices,
    onError: (error) => console.warn('[CaseManagement] Failed to fetch invoices:', error)
  });

  const metrics = useMemo(() => {
    const activeCases = cases?.filter(m => m.status === CaseStatus.Active).length || 0;
    const intakePipeline = cases?.filter(m => m.status === CaseStatus.Open || m.status === CaseStatus.PreFiling).length || 0;
    const upcomingDeadlines = cases?.filter(m => {
      if (!m.closeDate) return false;
      const deadline = new Date(m.closeDate);
      const daysUntil = (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil >= 0 && daysUntil <= 7;
    }).length || 0;
    const totalRevenue = Array.isArray(invoices)
      ? invoices.reduce((sum: number, inv) => sum + ((inv as { totalAmount?: number }).totalAmount || 0), 0)
      : 0;

    return { activeCases, intakePipeline, upcomingDeadlines, totalRevenue };
  }, [cases, invoices]);

  const renderContent = () => {
    return <CaseManagerContent activeTab={activeTab as MatterView} onSelectCase={onSelectCase} />;
  };

  return (
    <div className={cn('h-full flex flex-col animate-fade-in', theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Case Management"
          subtitle="Centralized case oversight, intake pipeline, and resource coordination"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate(PATHS.CASES_INTAKE)}>
                New Case
              </Button>
            </div>
          }
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={cn('p-4 rounded-lg shadow-sm border', theme.surface.default, theme.border.default)}>
            <p className={cn('text-xs font-bold uppercase', theme.text.secondary)}>Active Cases</p>
            <p className={cn('text-2xl font-bold', theme.primary.text)}>{metrics.activeCases}</p>
          </div>
          <div className={cn('p-4 rounded-lg shadow-sm border', theme.surface.default, theme.border.default)}>
            <p className={cn('text-xs font-bold uppercase', theme.text.secondary)}>Intake Pipeline</p>
            <p className={cn('text-2xl font-bold', theme.status.warning.text)}>{metrics.intakePipeline}</p>
          </div>
          <div className={cn('p-4 rounded-lg shadow-sm border', theme.surface.default, theme.border.default)}>
            <p className={cn('text-xs font-bold uppercase', theme.text.secondary)}>Upcoming Deadlines</p>
            <p className="text-2xl font-bold text-amber-600">{metrics.upcomingDeadlines}</p>
          </div>
          <div className={cn('p-4 rounded-lg shadow-sm border', theme.surface.default, theme.border.default)}>
            <p className={cn('text-xs font-bold uppercase', theme.text.secondary)}>Total Revenue</p>
            <p className={cn('text-2xl font-bold', theme.status.success.text)}>
              ${(metrics.totalRevenue / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        {/* Desktop Parent Navigation */}
        <div className={cn('hidden md:flex space-x-6 border-b mb-4', theme.border.default)}>
          {CASE_TABS.map(parent => (
            <button
              key={parent.id}
              onClick={() => handleParentTabChange(parent.id)}
              className={cn(
                'flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2',
                activeParentTab?.id === parent.id
                  ? cn('border-current', theme.primary.text)
                  : cn('border-transparent', theme.text.secondary, `hover:${theme.text.primary}`)
              )}
            >
              <parent.icon className={cn('h-4 w-4 mr-2', activeParentTab?.id === parent.id ? theme.primary.text : theme.text.tertiary)} />
              {parent.label}
            </button>
          ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        <div className={cn('flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4', theme.surface.highlight, theme.border.default)}>
          {activeParentTab?.subTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? cn('shadow-sm', theme.action.primary.bg, theme.action.primary.text)
                    : cn(theme.text.secondary, `hover:${theme.surface.default}`, `hover:${theme.text.primary}`)
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 custom-scrollbar">
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
          <Suspense fallback={<LazyLoader message="Loading Case Module..." />}>
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
};
