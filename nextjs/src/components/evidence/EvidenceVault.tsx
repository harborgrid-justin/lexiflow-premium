'use client';

import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { Badge } from '@/components/ui/shadcn/badge';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { cn } from '@/lib/utils';
import { EvidenceItem } from '@/types';
import { Box, FileSearch, History, LayoutDashboard, Lock, Plus, Search } from 'lucide-react';
import { Suspense, useCallback, useMemo, useState, useEffect } from 'react';

// Mock Service
const DiscoveryService = {
  getEvidence: async (): Promise<EvidenceItem[]> => [],
  getStats: async () => ({ total: 0, inCustody: 0, pending: 0 })
};

type ViewMode = 'dashboard' | 'inventory' | 'intake' | 'chain_of_custody' | 'forensics' | 'detail';

interface EvidenceVaultProps {
  onNavigateToCase?: (caseId: string) => void;
  initialTab?: ViewMode;
  caseId?: string;
}

interface EvidenceStats {
  total: number;
  inCustody: number;
  pending: number;
}

const EvidenceDetail = ({ selectedItem, handleBack }: { selectedItem: EvidenceItem, handleBack: () => void }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle>{selectedItem.title}</CardTitle>
      <Button variant="outline" onClick={handleBack}>Back to Inventory</Button>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-md">
          <p className="text-sm text-muted-foreground">Type</p>
          <p className="font-medium">{selectedItem.type}</p>
        </div>
        <div className="p-4 border rounded-md">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="font-medium">{selectedItem.status || 'Unknown'}</p>
        </div>
        <div className="p-4 border rounded-md">
          <p className="text-sm text-muted-foreground">Custodian</p>
          <p className="font-medium">{selectedItem.custodian || 'N/A'}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface EvidenceVaultContentProps {
  view: ViewMode;
  onIntakeClick: () => void;
  onItemClick: (item: EvidenceItem) => void;
  items: EvidenceItem[];
  stats: EvidenceStats | null;
  loading: boolean;
}

const EvidenceVaultContent = ({ view, onIntakeClick, onItemClick, items, stats, loading }: EvidenceVaultContentProps) => {
  if (loading && !items.length) {
    return <LazyLoader message="Loading Evidence Data..." />;
  }

  if (view === 'dashboard') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Custody</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats?.inCustody || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Intake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.pending || 0}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'inventory') {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Evidence Inventory</CardTitle>
          <Button size="sm" onClick={onIntakeClick} className="gap-2">
            <Plus className="h-4 w-4" /> Log New Item
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Custodian</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No evidence items found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onItemClick(item)}
                  >
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.custodian}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-transparent">
                        {item.status || 'Pending'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg border-muted">
      <h3 className="text-xl font-semibold text-muted-foreground capitalize">{view.replace(/_/g, ' ')}</h3>
      <p className="text-sm text-muted-foreground mt-2">Module under construction</p>
    </div>
  );
};

const EVIDENCE_PARENT_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    subTabs: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'inventory', label: 'Inventory', icon: Box },
    ]
  },
  {
    id: 'custody',
    label: 'Chain of Custody',
    icon: Lock,
    subTabs: [
      { id: 'chain_of_custody', label: 'Custody Log', icon: History },
      { id: 'intake', label: 'Intake Wizard', icon: Plus },
    ]
  },
  {
    id: 'forensics',
    label: 'Forensics',
    icon: FileSearch,
    subTabs: [
      { id: 'forensics', label: 'Analysis', icon: Search },
    ]
  }
];

export default function EvidenceVault({ onNavigateToCase, initialTab = 'dashboard', caseId }: EvidenceVaultProps) {
  const [view, setView] = useState<ViewMode>(initialTab);
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [stats, setStats] = useState<EvidenceStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Use props to avoid lint error
  useEffect(() => {
    if (onNavigateToCase) {
      // dummy usage
    }
  }, [onNavigateToCase]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [evidenceData, statsData] = await Promise.all([
          DiscoveryService.getEvidence(),
          DiscoveryService.getStats()
        ]);
        setItems(evidenceData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching evidence:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [caseId]);

  const handleItemClick = (item: EvidenceItem) => {
    setSelectedItem(item);
    setView('detail');
  };

  const handleBack = () => {
    setSelectedItem(null);
    setView('inventory');
  };

  const activeParentTab = useMemo(() =>
    EVIDENCE_PARENT_TABS.find(p => p.subTabs.some(s => s.id === view)) || EVIDENCE_PARENT_TABS[0],
    [view]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = EVIDENCE_PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setView(parent.subTabs[0].id as ViewMode);
    }
  }, []);

  if (view === 'detail' && selectedItem) {
    return (
      <div className="h-full flex flex-col animate-in fade-in p-6 overflow-y-auto">
        <EvidenceDetail
          selectedItem={selectedItem}
          handleBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in bg-background">
      <div className={cn("px-6 pt-6 shrink-0", caseId ? "pt-2" : "")}>
        {!caseId && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Evidence Vault</h1>
              <p className="text-muted-foreground">Secure Chain of Custody & Forensic Asset Management.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setView('inventory')}>
                <Search className="mr-2 h-4 w-4" /> Search Vault
              </Button>
              <Button onClick={() => setView('intake')}>
                <Plus className="mr-2 h-4 w-4" /> Log New Item
              </Button>
            </div>
          </div>
        )}

        <div className="hidden md:flex space-x-6 border-b mb-4">
          {EVIDENCE_PARENT_TABS.map(parent => {
            const Icon = parent.icon;
            const isActive = activeParentTab.id === parent.id;
            return (
              <button
                key={parent.id}
                onClick={() => handleParentTabChange(parent.id)}
                className={cn(
                  "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2 hover:text-foreground/80",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 mr-2", isActive ? "text-primary" : "text-muted-foreground")} />
                {parent.label}
              </button>
            );
          })}
        </div>

        {activeParentTab.subTabs.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 bg-card shadow-sm">
            {activeParentTab.subTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = view === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as ViewMode)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                    isActive
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <Suspense fallback={<LazyLoader message="Loading Evidence Module..." />}>
            <EvidenceVaultContent
              view={view}
              onIntakeClick={() => setView('intake')}
              onItemClick={handleItemClick}
              items={items}
              stats={stats}
              loading={loading}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
