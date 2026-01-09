'use client';

import { DataService } from '@/services/data/dataService';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn/table';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';
import { Loader2 } from 'lucide-react';

interface ClientPortalData {
  id: string;
  clientName: string;
  portalAccessStatus: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  documentsSharedCount: number;
}

export function ClientPortalList() {
  const [clients, setClients] = useState<ClientPortalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Use DataService.crm
        const crm = DataService.crm as unknown;
        const clientData = crm.getClients ? await crm.getClients() : [];

        // Transform to ClientPortalData
        const mapped = clientData.map((c: unknown) => ({
          id: c.id,
          clientName: c.name,
          portalAccessStatus: c.status === 'Active' ? 'active' : 'inactive',
          lastLogin: c.lastLogin || new Date().toISOString(),
          documentsSharedCount: c.docCount || 0
        }));

        setClients(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-100">Active</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Client Portal</h1>
      </div>
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Portal Access</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Documents Shared</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No client portal data available
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium text-foreground">
                      {client.clientName}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(client.portalAccessStatus)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.lastLogin ? new Date(client.lastLogin).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.documentsSharedCount}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
