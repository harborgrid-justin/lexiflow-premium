'use client';

import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { DataService } from "@/services/data/dataService";
import {
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Simplified Interfaces
interface DocketEntry {
  id: string;
  caseId: string;
  title: string;
  filingDate: string;
  status: string;
  type?: string;
}

interface DocketStats {
  filings: number;
  orders: number;
  motions: number;
}

export function DocketManager() {
  const [entries, setEntries] = useState<DocketEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DocketStats>({ filings: 0, orders: 0, motions: 0 });

  useEffect(() => {
    async function loadDocket() {
      setLoading(true);
      try {
        // Use DataService.docket via repository access
        // Since getIntegratedDocketRepository is internal, usually exposed via DataService.docket if configured
        // Or we can use generic Documents if docket specific service is missing

        // Try to find docket items from documents tagged as 'docket'
        // This assumes a shared model, but aligns with replacing mocks
        const docs = (await DataService.documents.getAll() as unknown) as Array<{
          id: string;
          type: string;
          title: string;
          createdAt: string;
          metadata?: { caseId?: string; isDocket?: boolean };
        }>;

        const docketItems = docs.filter((d) => d.type === 'Pleading' || d.type === 'Order' || d.metadata?.isDocket);

        const mappedEntries = docketItems.map(d => ({
          id: d.id,
          caseId: d.metadata?.caseId || 'Unknown',
          title: d.title,
          filingDate: d.createdAt,
          status: 'Filed',
          type: d.type
        }));

        setEntries(mappedEntries);

        // Calculate stats based on real data
        setStats({
          filings: mappedEntries.length,
          orders: mappedEntries.filter(e => e.type === 'Order').length,
          motions: mappedEntries.filter(e => e.type === 'Motion' || e.title.includes('Motion')).length
        });

      } catch (error) {
        console.error("Failed to load docket", error);
      } finally {
        setLoading(false);
      }
    }
    loadDocket();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Docket Management</h2>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Filings</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.filings}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Court Orders</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{stats.orders}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending Motions</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{stats.motions}</div></CardContent>
        </Card>
      </div>

      {/* Docket List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Docket Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No docket entries found.</div>
            ) : (
              entries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{entry.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Case: {entry.caseId} • Filed: {new Date(entry.filingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                    {entry.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
