/**
 * @module components/matters/MatterManagement
 * @category Matter Management
 * @description Main matter management interface with tabbed navigation following Case Workflows pattern
 * 
 * ARCHITECTURE:
 * - Uses PageHeader + two-level tabs (parent/sub) like MasterWorkflow
 * - Stats cards between navigation and content
 * - Lazy loads tab content via MatterManagerContent
 * - Session storage for tab persistence
 * - Backend API integration via DataService
 */

import React, { Suspense, lazy, useTransition, useMemo, useState, useCallback } from 'react';
import { Plus, Clock, BarChart3, Briefcase, Settings, Eye, Activity, DollarSign, Lightbulb, TrendingUp, RefreshCw } from 'lucide-react';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { useTheme } from '../../../providers/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { api } from '@api';
import { PageHeader } from '../../components/organisms/PageHeader';
import { Button } from '../../components/atoms/Button';
import { LazyLoader } from '../../components/molecules/LazyLoader';
import { MatterManagerContent } from './MatterManagerContent';
import { cn } from '@/utils/cn';
import { MatterView } from '../../../config/tabs.config';

// Two-level tab configuration
const MATTER_TABS = [
  {
    id: 'matters_group',
    label: 'Matters',
    icon: Briefcase,
    subTabs: [
      { id: 'overview', label: 'Overview Dashboard', icon: Eye },
      { id: 'operations', label: 'Operations Center', icon: Activity },
      { id: 'intake', label: 'New Matter Intake', icon: Plus },
    ],
  },
  {
    id: 'planning_group',
    label: 'Planning',
    icon: Settings,
    subTabs: [
      { id: 'calendar', label: 'Matter Calendar', icon: Clock },
      { id: 'financials', label: 'Financials', icon: DollarSign },
      { id: 'insights', label: 'Insights & Risk', icon: Lightbulb },
    ],
  },
  {
    id: 'analytics_group',
    label: 'Analytics',
    icon: BarChart3,
    subTabs: [
      { id: 'analytics', label: 'Analytics Dashboard', icon: TrendingUp },
    ],
  },
];

export const MatterManagement: React.FC = () => {
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('matters_active_tab', 'overview');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      _setActiveTab(tab);
    });
  };

  // Find active parent tab based on active sub-tab
  const activeParentTab = useMemo(() => {
    return MATTER_TABS.find(parent =>
      parent.subTabs.some(sub => sub.id === activeTab)
    ) || MATTER_TABS[0];
  }, [activeTab]);

  const handleParentTabChange = (parentId: string) => {
    const parent = MATTER_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id);
    }
  };

  // Fetch KPIs for stats
  const { data: matters } = useQuery(['matters', 'all'], () => api.matters.getAll());
  const { data: timeEntries } = useQuery(['billing', 'time-entries'], () => api.billing.getTimeEntries());
  const { data: invoices } = useQuery(['billing', 'invoices'], () => api.billing.getInvoices());

  const metrics = useMemo(() => {
    const activeMatters = matters?.filter(m => m.status === 'ACTIVE').length || 0;
    const intakePipeline = matters?.filter(m => m.status === 'INTAKE').length || 0;
    const upcomingDeadlines = matters?.filter(m => {
      if (!m.nextDeadline) return false;
      const deadline = new Date(m.nextDeadline);
      const daysUntil = (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil >= 0 && daysUntil <= 7;
    }).length || 0;
    const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

    return { activeMatters, intakePipeline, upcomingDeadlines, totalRevenue };
  }, [matters, invoices]);

  const renderContent = () => {
    return <MatterManagerContent activeTab={activeTab as MatterView} />;
  };

  return (
    <div className={cn('h-full flex flex-col animate-fade-in', theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Matter Management"
          subtitle="Centralized case oversight, intake pipeline, and resource coordination"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setActiveTab('intake')}>
                New Matter
              </Button>
            </div>
          }
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={cn('p-4 rounded-lg shadow-sm border', theme.surface.default, theme.border.default)}>
            <p className={cn('text-xs font-bold uppercase', theme.text.secondary)}>Active Matters</p>
            <p className={cn('text-2xl font-bold', theme.primary.text)}>{metrics.activeMatters}</p>
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
          {MATTER_TABS.map(parent => (
            <button
              key={parent.id}
              onClick={() => handleParentTabChange(parent.id)}
              className={cn(
                'flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2',
                activeParentTab.id === parent.id
                  ? cn('border-current', theme.primary.text)
                  : cn('border-transparent', theme.text.secondary, `hover:${theme.text.primary}`)
              )}
            >
              <parent.icon className={cn('h-4 w-4 mr-2', activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)} />
              {parent.label}
            </button>
          ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        <div className={cn('flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4', theme.surface.highlight, theme.border.default)}>
          {activeParentTab.subTabs.map(tab => {
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
          <Suspense fallback={<LazyLoader message="Loading Matter Module..." />}>
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

