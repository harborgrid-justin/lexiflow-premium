'use client';

import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { cn } from '@/lib/utils';
import {
  BarChart2,
  BookOpen,
  Calendar as CalendarIcon,
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
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Docket Sheet: {filterType}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900 dark:text-blue-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Document #{100 + i}</p>
              <p className="text-sm text-muted-foreground">Filed on Jan {i}, 2026</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 hover:bg-emerald-100">
            Filed
          </Badge>
        </div>
      ))}
    </CardContent>
  </Card>
);

const DocketCalendar = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Docket Calendar</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 31 }).map((_, i) => (
          <div key={i} className="aspect-square border rounded-md p-2 hover:bg-muted/50 transition-colors">
            <span className="text-sm text-muted-foreground">{i + 1}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const DocketAnalytics = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Filings', value: 45 },
          { label: 'Orders', value: 12 },
          { label: 'Motions', value: 8 }
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-muted/50 rounded-md border">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const DocketSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Settings & Sync</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4 max-w-md">
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div>
            <p className="font-medium">ECF/PACER Sync</p>
            <p className="text-sm text-muted-foreground">Last synced: 2 hours ago</p>
          </div>
          <Button size="sm">
            Sync Now
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

type DocketView = 'all' | 'filings' | 'orders' | 'calendar' | 'upcoming' | 'stats' | 'sync';

interface DocketManagerProps {
  initialTab?: DocketView;
}

const PARENT_TABS = [
  {
    id: 'docket', label: 'Docket', icon: BookOpen,
    subTabs: [
      { id: 'all', label: 'All Entries', icon: List },
      { id: 'filings', label: 'Filings', icon: FileText },
      { id: 'orders', label: 'Orders', icon: Gavel },
    ]
  },
  {
    id: 'deadlines', label: 'Deadlines', icon: CalendarIcon,
    subTabs: [
      { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
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
      { id: 'sync', label: 'Sync', icon: RefreshCw },
    ]
  }
];

export default function DocketManager({ initialTab }: DocketManagerProps) {
  const [activeTab, setActiveTab] = useState<DocketView>(initialTab || 'all');

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Card className="min-h-150 border-0 shadow-none bg-transparent">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Docket & Filings</h1>
            <p className="text-muted-foreground mt-1">Court docket management with ECF/PACER integration.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync ECF/PACER
            </Button>
            <Button size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Batch Export
            </Button>
          </div>
        </div>

        {/* Parent Tabs as a high level switcher */}
        <div className="flex items-center space-x-2 border-b">
          {PARENT_TABS.map(parent => {
            const isActive = activeParentTab.id === parent.id;
            return (
              <Button
                key={parent.id}
                variant="ghost"
                className={cn(
                  "rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground h-auto",
                  isActive && "border-primary text-primary hover:text-primary"
                )}
                onClick={() => handleParentTabChange(parent.id)}
              >
                <parent.icon className="mr-2 h-4 w-4" />
                {parent.label}
              </Button>
            )
          })}
        </div>

        {/* Sub Tabs */}
        <div className="flex space-x-2">
          {activeParentTab.subTabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              size="sm"
              className="gap-2 h-8"
              onClick={() => setActiveTab(tab.id as DocketView)}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>
    </Card>
  );
}
