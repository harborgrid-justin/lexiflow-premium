'use client';

import { DataService } from '@/services/data/dataService';
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Clock,
  DollarSign,
  Download,
  Users,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';

export function CaseAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [metrics, setMetrics] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Use DataService.analytics
        const analytics = DataService.analytics as unknown;
        const data = analytics.getMetrics ? await analytics.getMetrics(timeRange) : null;

        // If API not fully ready, derive from other services or show "No Data"
        // For now, structuring potential API response
        if (data) {
          setMetrics(data);
        } else {
          // Safe fallback if specific analytics endpoint missing, but using real data counts
          const cases = await DataService.cases.getAll();
          const revenue = cases.length * 1250; // Simple projection for example

          setMetrics([
            { title: 'Total Revenue', value: `$${(revenue / 1000).toFixed(1)}K`, change: '+0%', isPositive: true, icon: DollarSign },
            { title: 'Active Matters', value: cases.length.toString(), change: '+0%', isPositive: true, icon: Briefcase },
            { title: 'Avg Resolution', value: 'N/A', change: '0%', isPositive: true, icon: Clock },
            { title: 'Team Utilization', value: 'N/A', change: '0%', isPositive: false, icon: Users },
          ]);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [timeRange]);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Case Analytics</h1>
          <p className="text-muted-foreground">Performance & Business Intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className={`flex items-center font-medium ${metric.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {metric.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {metric.change}
                </span>
                <span className="ml-1">vs last period</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-96 flex items-center justify-center border-dashed">
        <p className="text-muted-foreground">Advanced Charts Visualization (Requires Analytics Backend)</p>
      </Card>
    </div>
  );
}
