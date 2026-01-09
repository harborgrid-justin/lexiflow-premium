'use client';

import { DataService } from '@/services/data/dataService';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { Badge } from '@/components/ui/shadcn/badge';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { cn } from '@/lib/utils';
import { EvidenceItem } from '@/types';
import { Box, FileSearch, LayoutDashboard, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

const EvidenceDashboard = ({ stats }: { stats: EvidenceStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">In Custody</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.inCustody}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Intake</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
      </CardContent>
    </Card>
  </div>
);

export default function EvidenceVault({ onNavigateToCase, initialTab = 'dashboard', caseId }: EvidenceVaultProps) {
  const [view, setView] = useState<ViewMode>(initialTab);
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [stats, setStats] = useState<EvidenceStats>({ total: 0, inCustody: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Use DataService to fetch evidence
        const query = caseId ? { caseId } : {};
        const data = await DataService.evidence.getAll(query);
        const evidenceData = data as unknown as EvidenceItem[];
        setItems(evidenceData);

        // Compute stats from data
        setStats({
          total: evidenceData.length,
          inCustody: evidenceData.filter(i => i.status === 'In Custody').length,
          pending: evidenceData.filter(i => i.status === 'Pending').length
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [caseId]);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (view === 'detail' && selectedItem) {
    return <EvidenceDetail selectedItem={selectedItem} handleBack={() => setView('inventory')} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Evidence Vault</h1>
        <div className="flex gap-2">
          <Button variant={view === 'dashboard' ? 'default' : 'outline'} onClick={() => setView('dashboard')}>
            <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
          </Button>
          <Button variant={view === 'inventory' ? 'default' : 'outline'} onClick={() => setView('inventory')}>
            <FileSearch className="h-4 w-4 mr-2" /> Inventory
          </Button>
          <Button variant={view === 'intake' ? 'default' : 'outline'} onClick={() => setView('intake')}>
            <Box className="h-4 w-4 mr-2" /> Intake
          </Button>
        </div>
      </div>

      {view === 'dashboard' && <EvidenceDashboard stats={stats} />}

      <Card>
        <CardHeader><CardTitle>Evidence Inventory</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Custodian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center">No evidence found.</TableCell></TableRow> : null}
              {items.map(item => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted" onClick={() => { setSelectedItem(item); setView('detail'); }}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      item.status === 'In Custody' && "bg-emerald-50 text-emerald-700",
                      item.status === 'Pending' && "bg-amber-50 text-amber-700"
                    )}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>{item.custodian}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
