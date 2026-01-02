'use client';

import { cn } from '@/lib/utils';
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
import { useCallback, useEffect, useMemo, useState } from 'react';

// Mock Components
const DocketSheet = ({ filterType }: { filterType: string }) => (
  <div className="p-6 border rounded-lg bg-white shadow-sm">
    <h3 className="text-lg font-medium mb-4">Docket Sheet: {filterType}</h3>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded hover:bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Document #{100 + i}</p>
              <p className="text-sm text-slate-500">Filed on Jan {i}, 2026</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Filed
          </span>
        </div>
      ))}
    </div>
  </div>
);

const DocketCalendar = () => (
  <div className="p-6 border rounded-lg bg-white shadow-sm">
    <h3 className="text-lg font-medium mb-4">Docket Calendar</h3>
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 31 }).map((_, i) => (
        <div key={i} className="aspect-square border rounded p-2 hover:bg-slate-50">
          <span className="text-sm text-slate-500">{i + 1}</span>
        </div>
      ))}
    </div>
  </div>
);

const DocketAnalytics = () => (
  <div className="p-6 border rounded-lg bg-white shadow-sm">
    <h3 className="text-lg font-medium mb-4">Analytics</h3>
    <div className="grid grid-cols-3 gap-4">
      {['Filings', 'Orders', 'Motions'].map((stat) => (
        <div key={stat} className="p-4 bg-slate-50 rounded border">
          <p className="text-sm text-slate-500">{stat}</p>
          <p className="text-2xl font-bold text-slate-900">{Math.floor(Math.random() * 100)}</p>
        </div>
      ))}
    </div>
  </div>
);

const DocketSettings = () => (
  <div className="p-6 border rounded-lg bg-white shadow-sm">
    <h3 className="text-lg font-medium mb-4">Settings & Sync</h3>
    <div className="space-y-4 max-w-md">
      <div className="flex items-center justify-between p-4 border rounded">
        <div>
          <p className="font-medium">ECF/PACER Sync</p>
          <p className="text-sm text-slate-500">Last synced: 2 hours ago</p>
        </div>
        <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
          Sync Now
        </button>
      </div>
    </div>
  </div>
);

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

export default function DocketManager({ initialTab }: DocketManagerProps) {
  const [activeTab, setActiveTab] = useState<DocketView>('all');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() =>
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
    [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as DocketView);
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
    <div className="h-full flex flex-col bg-slate-50/50">
      <div className="px-6 pt-6 shrink-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Docket & Filings</h1>
            <p className="text-slate-500 mt-1">Court docket management with ECF/PACER integration, deadline tracking, and comprehensive analytics.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
              <RefreshCw className="h-4 w-4" />
              Sync ECF/PACER
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm">
              <Download className="h-4 w-4" />
              Batch Export
            </button>
          </div>
        </div>

        {/* Desktop Parent Navigation */}
        <div className="hidden md:flex space-x-6 border-b border-slate-200 mb-4">
          {PARENT_TABS.map(parent => (
            <button
              key={parent.id}
              onClick={() => handleParentTabChange(parent.id)}
              className={cn(
                "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                activeParentTab.id === parent.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? "text-blue-600" : "text-slate-400")} />
              {parent.label}
            </button>
          ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border border-slate-200 bg-white mb-4">
          {activeParentTab.subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DocketView)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                activeTab === tab.id
                  ? "bg-slate-100 text-blue-700 border-blue-200 shadow-sm"
                  : "bg-transparent text-slate-600 border-transparent hover:bg-slate-50"
              )}
            >
              <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? "text-blue-600" : "text-slate-400")} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
