'use client';

import { AlertTriangle, Download, FileText, Lock, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';

interface ConflictCheck {
  id: string;
  caseId: string;
  status: 'cleared' | 'flagged' | 'pending';
  createdAt: string;
}

interface EthicalWall {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  restrictedUserIds: string[];
}

// Sub-components
const ComplianceOverview = () => {
  // Mock metrics
  const metrics = {
    high: 3,
    activeWalls: 5,
    score: 98
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Pending Conflicts</h3>
            <p className="text-3xl font-bold text-amber-600">{metrics.high}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Active Walls</h3>
            <p className="text-3xl font-bold text-emerald-600">{metrics.activeWalls}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Compliance Score</h3>
            <p className="text-3xl font-bold text-blue-600">{metrics.score}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Conflict Check Completed</p>
                    <p className="text-xs text-muted-foreground">Case #2024-{100 + i}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ComplianceConflicts = ({ conflicts }: { conflicts: ConflictCheck[] }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Conflict Checks</CardTitle>
      <Button size="sm">New Check</Button>
    </CardHeader>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conflicts.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No conflict checks found.</TableCell></TableRow>
          ) : (
            conflicts.map((conflict) => (
              <TableRow key={conflict.id}>
                <TableCell className="font-medium">{conflict.caseId}</TableCell>
                <TableCell>
                  <Badge variant={conflict.status === 'cleared' ? 'secondary' : 'destructive'}
                    className={conflict.status === 'cleared'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-100'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100'}>
                    {conflict.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(conflict.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="link" className="h-auto p-0 text-blue-600">View</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const ComplianceWalls = ({ walls }: { walls: EthicalWall[] }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Ethical Walls</CardTitle>
      <Button size="sm">Create Wall</Button>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4">
        {walls.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">No active ethical walls.</div>
        ) : (
          walls.map((wall) => (
            <div key={wall.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="font-medium">{wall.name}</h4>
                  <p className="text-sm text-muted-foreground">{wall.restrictedUserIds?.length || 0} restricted users</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                {wall.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>
);

const CompliancePolicies = () => (
  <Card>
    <CardHeader>
      <CardTitle>Firm Policies</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {['Data Retention Policy', 'Anti-Money Laundering', 'Client Confidentiality'].map((policy, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="text-muted-foreground" size={20} />
              <span className="font-medium">{policy}</span>
            </div>
            <Button variant="link" size="sm">Download PDF</Button>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function ComplianceDashboard() {
  const [conflicts, setConflicts] = useState<ConflictCheck[]>([]);
  const [walls, setWalls] = useState<EthicalWall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComplianceData = async () => {
      setLoading(true);
      try {
        setWalls([]);
        setConflicts([]);
      } catch (e) {
        console.error("Compliance data load failed", e);
      } finally {
        setLoading(false);
      }
    };
    loadComplianceData();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading compliance data...</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Risk & Compliance Center</h1>
          <p className="text-muted-foreground">Conflicts, Ethical Walls, and Regulatory Monitoring.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download size={16} />
          Audit Report
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2"><Shield size={16} /> Overview</TabsTrigger>
          <TabsTrigger value="conflicts" className="gap-2"><AlertTriangle size={16} /> Conflicts</TabsTrigger>
          <TabsTrigger value="walls" className="gap-2"><Lock size={16} /> Ethical Walls</TabsTrigger>
          <TabsTrigger value="policies" className="gap-2"><FileText size={16} /> Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ComplianceOverview />
        </TabsContent>
        <TabsContent value="conflicts">
          <ComplianceConflicts conflicts={conflicts} />
        </TabsContent>
        <TabsContent value="walls">
          <ComplianceWalls walls={walls} />
        </TabsContent>
        <TabsContent value="policies">
          <CompliancePolicies />
        </TabsContent>
      </Tabs>
    </div>
  );
}
