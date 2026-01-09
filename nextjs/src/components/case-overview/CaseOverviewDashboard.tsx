'use client';

import { DataService } from '@/services/data/dataService';
import {
  Briefcase,
  Clock,
  Plus,
  Search,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Loader2 } from 'lucide-react';

interface KpiData {
  activeCases: number;
  pendingIntake: number;
  upcomingDeadlines: number;
}

interface Activity {
  id: string;
  description: string;
  timestamp: string;
  user: string;
}

export function CaseOverviewDashboard() {
  const [kpis, setKpis] = useState<KpiData>({ activeCases: 0, pendingIntake: 0, upcomingDeadlines: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch all required data in parallel using DataService
        const [cases, crmData] = await Promise.all([
          DataService.cases.getAll(),
          (DataService.crm as unknown).getPipelineSummary ? (DataService.crm as unknown).getPipelineSummary() : []
        ]);

        // Calculate KPIs from real data
        setKpis({
          activeCases: cases.length,
          pendingIntake: Array.isArray(crmData) ? crmData.reduce((acc: number, curr: unknown) => acc + (curr.count || 0), 0) : 0,
          upcomingDeadlines: 0 // Implement finding deadlines from cases if necessary
        });

        // Set activities (placeholder for now, or fetch from cases)
        const recentActivities = cases.slice(0, 5).map((c: unknown) => ({
          id: c.id,
          description: `Case updated: ${c.title}`,
          timestamp: c.updatedAt,
          user: 'System'
        }));
        setActivities(recentActivities);

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8 flex justify-center h-screen items-center"><Loader2 className="animate-spin text-muted-foreground mr-2" /> Loading Overview...</div>;

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Case Overview</h1>
          <p className="text-muted-foreground">Enterprise Matter Management Command Center</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search matters..." className="pl-8" />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Matter
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Matters</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.activeCases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Intake</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pendingIntake}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.upcomingDeadlines}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map(act => (
                <div key={act.id} className="flex justify-between border-b pb-2 last:border-0">
                  <div>{act.description}</div>
                  <div className="text-sm text-muted-foreground">{new Date(act.timestamp).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
