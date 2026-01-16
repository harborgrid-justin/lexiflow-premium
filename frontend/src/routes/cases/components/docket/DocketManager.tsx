/**
 * @module components/docket/DocketManager
 * @category Docket Management
 * @description Comprehensive docket management with import, filtering, and analytics.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import {
  BarChart2,
  BookOpen,
  Calendar,
  Clock,
  Download,
  FileText,
  Gavel,
  List,
  RefreshCw,
  Settings
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';
import { Button } from '@/components/atoms/Button';
import { DocketAnalytics } from './DocketAnalytics';
import { DocketCalendar } from './DocketCalendar';
import { DocketSettings } from './DocketSettings';
import { DocketSheet } from './DocketSheet';

// Internal Dependencies - Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Internal Dependencies - Services & Utils
import { cn } from '@/lib/cn';

type DocketView = 'all' | 'filings' | 'orders' | 'calendar' | 'upcoming' | 'stats' | 'sync';

interface DocketManagerProps {
  initialTab?: DocketView;
}

const PARENT_TABS = [
  {
    id: 'docket', label: 'Docket Sheet', icon: BookOpen,
    subTabs: [
      { id: 'all', label: 'All Entries', icon: List },
      { id: 'filings', label: 'Filings', icon: FileText },
      { id: 'orders', label: 'Orders', icon: Gavel },
    ]
  },
  {
    id: 'deadlines', label: 'Deadlines', icon: Calendar,
    subTabs: [
      { id: 'calendar', label: 'Calendar View', icon: Calendar },
      { id: 'upcoming', label: 'Upcoming', icon: Clock },
    ]
  },
  {
    id: 'analytics', label: 'Analytics', icon: BarChart2,
    subTabs: [
      { id: 'stats', label: 'Statistics', icon: BarChart2 },
    ]
  },
  {
    id: 'settings', label: 'Settings', icon: Settings,
    subTabs: [
      { id: 'sync', label: 'ECF/PACER', icon: RefreshCw },
    ]
  }
];

export const DocketManager: React.FC<DocketManagerProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<DocketView>('all');

  // Holographic Routing Effect
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() =>
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
    [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs![0]!.id as DocketView);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'all':
      case 'filings':
      case 'orders':
        return <DocketSheet filterType={activeTab} />;
      case 'calendar':
      case 'upcoming':
        return <DocketCalendar />;
      case 'stats':
        return <DocketAnalytics />;
      case 'sync':
        return <DocketSettings />;
      default:
        return <DocketSheet filterType="all" />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Docket & Filings"
          subtitle="Court docket management with ECF/PACER integration, deadline tracking, and comprehensive analytics."
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" icon={RefreshCw}>Sync ECF/PACER</Button>
              <Button variant="primary" icon={Download}>Batch Export</Button>
            </div>
          }
        />

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
          {PARENT_TABS.map(parent => (
            <button
              key={parent.id}
              onClick={() => handleParentTabChange(parent.id)}
              className={cn(
                "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                activeParentTab?.id === parent.id
                  ? cn("border-current", theme.primary.text)
                  : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
              )}
            >
              <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab?.id === parent.id ? theme.primary.text : theme.text.tertiary)} />
              {parent.label}
            </button>
          ))}
        </div>

        {/* Sub-Navigation (Pills) - Touch Scroll */}
        <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 touch-pan-x", theme.surface.highlight, theme.border.default)}>
          {activeParentTab?.subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DocketView)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                activeTab === tab.id
                  ? cn(theme.surface.default, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border)
                  : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface.default}`)
              )}
            >
              <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar touch-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DocketManager;
