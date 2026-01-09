'use client';

import { DashboardKPIs, dashboardMetricsService, RecentActivity } from '@/services/api/dashboard-metrics.service';
import { CRMService } from '@/services/domain/CRMDomain';
import {
  Activity,
  AlertCircle,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  Plus,
  Search,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Progress } from '@/components/ui/shadcn/progress';
import { Badge } from '@/components/ui/shadcn/badge';

export function CaseOverviewDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [kpiData, pipelineData, activitiesData] = await Promise.all([
          dashboardMetricsService.getKPIs(),
          CRMService.getPipelineSummary(),
          dashboardMetricsService.getRecentActivity()
        ]);
        setKpis(kpiData);
        setPipeline(pipelineData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [timeRange]);

  const activeMatters = kpis?.activeCases?.value || 0;
  const activeMattersChange = kpis?.activeCases?.change || 0;

  // Calculate pending intake from pipeline
  const pendingIntake = pipeline.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const pendingIntakeChange = 0; // Not available in API currently

  const upcomingDeadlines = kpis?.upcomingDeadlines?.value || 0;
  const upcomingDeadlinesChange = 0; // Not available in API currently

  const revenueYTD = kpis?.revenue?.value || 0;
  const revenueChange = kpis?.revenue?.change || 0;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Matters"
          value={activeMatters}
          change={activeMattersChange}
          icon={Briefcase}
          variant="default" // Use variant to map to our new color logic or keep custom
        />
        <KpiCard
          title="Pending Intake"
          value={pendingIntake}
          change={pendingIntakeChange}
          icon={Users}
          variant="secondary"
        />
        <KpiCard
          title="Upcoming Deadlines"
          value={upcomingDeadlines}
          change={upcomingDeadlinesChange}
          icon={Clock}
          variant="warning"
          inverse={true}
        />
        <KpiCard
          title="Revenue YTD"
          value={`$${(revenueYTD / 1000000).toFixed(2)}M`}
          change={revenueChange}
          icon={DollarSign}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Intake Pipeline</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            {pipeline.map((stage) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{stage.stage}</span>
                  <span className="text-muted-foreground">{stage.count} matters • {stage.value}</span>
                </div>
                <Progress value={(stage.count / 20) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className={`mt-1 p-2 rounded-full h-fit flex items-center justify-center
                  ${activity.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    activity.priority === 'medium' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-muted text-muted-foreground'
                  }`}>
                  {activity.type === 'deadline' ? <AlertCircle className="h-4 w-4" /> :
                    activity.type === 'matter_created' ? <Plus className="h-4 w-4" /> :
                      activity.type === 'status_change' ? <Activity className="h-4 w-4" /> :
                        <CheckCircle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mb-1">{activity.description}</p>
                  <p className="text-xs text-muted-foreground/60">{activity.time}</p>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs" size="sm">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, icon: Icon, variant, inverse = false }: any) {
  const isPositive = change > 0;
  const isGood = inverse ? !isPositive : isPositive;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  // simplified variant mapping to standard colors for icon background
  const variants: Record<string, string> = {
    default: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    secondary: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
          </div>
          <div className={`p-2 rounded-lg ${variants[variant] || variants.default}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className={`flex items-center font-medium ${isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            <TrendIcon className={`h-4 w-4 mr-1 ${!isPositive && !inverse ? '' : ''}`} />
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground ml-2">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
