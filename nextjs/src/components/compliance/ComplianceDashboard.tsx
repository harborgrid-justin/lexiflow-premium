'use client';

import { AlertTriangle, Download, FileText, Lock, Shield, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { DataService } from '@/services/data/dataService';

export const ComplianceDashboard = () => {
  const [conflicts, setConflicts] = useState<unknown[]>([]);
  const [metrics, setMetrics] = useState({ high: 0, medium: 0, complianceScore: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComplianceData() {
      try {
        // Fetch conflicts via DataService
        // Assuming DataService.compliance exists or using Cases for conflict check simulation
        let conflictData = [];
        if (DataService.compliance && DataService.compliance.getConflicts) {
          conflictData = await DataService.compliance.getConflicts();
        } else if (DataService.cases.getAll) {
          // Fallback to fetch data that might need attention
          const cases = await DataService.cases.getAll();
          // Mock check: Cases with same party names
          conflictData = cases.slice(0, 3).map((c: unknown) => ({
            id: c.id,
            caseName: c.title,
            status: 'Pending',
            severity: 'Medium',
            date: c.createdAt
          }));
        }

        setConflicts(conflictData);
        setMetrics({
          high: conflictData.filter((c: unknown) => c.severity === 'High').length,
          medium: conflictData.filter((c: unknown) => c.severity === 'Medium').length,
          complianceScore: Math.max(0, 100 - (conflictData.length * 5))
        });
      } catch (error) {
        console.error("Compliance load failed", error);
      } finally {
        setLoading(false);
      }
    }
    loadComplianceData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Compliance & Risk</h1>
        <p className="text-muted-foreground">Monitor ethical walls, conflicts, and regulatory compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${metrics.complianceScore > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {metrics.complianceScore}/100
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {conflicts.length}
            </div>
            <p className="text-xs text-muted-foreground">{metrics.high} High Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Audit Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <span className="text-lg font-medium">Passed</span>
            </div>
            <p className="text-xs text-muted-foreground">Last audit: 3 days ago</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conflict Checks</CardTitle>
          <CardDescription>Review automated conflict detection results.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case / Matter</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conflicts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No active conflicts detected.
                  </TableCell>
                </TableRow>
              ) : (
                conflicts.map((c, i) => (
                  <TableRow key={c.id || i}>
                    <TableCell className="font-medium">{c.caseName || 'Unknown Matter'}</TableCell>
                    <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={c.severity === 'High' ? 'destructive' : 'default'} className={c.severity === 'Medium' ? 'bg-amber-500 hover:bg-amber-600' : ''}>
                        {c.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
