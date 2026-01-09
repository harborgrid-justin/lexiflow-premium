/**
 * Analytics Dashboard Page (Dynamic)
 * Adapts to show different analytics views based on 'type' parameter.
 * Uses real API data via API_ENDPOINTS.
 */

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnalyticsChart } from './analytics-chart';

interface AnalyticsPageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: AnalyticsPageProps): Promise<Metadata> {
  const { type } = await params;
  const title = type.charAt(0).toUpperCase() + type.slice(1);
  return {
    title: `${title} Analytics | LexiFlow`,
    description: `View ${type} analytics and metrics`,
  };
}

interface AnalyticsData {
  total: number;
  active: number;
  performance: {
    month: string;
    value: number;
    revenue: number;
  }[];
}

export default async function AnalyticsTypePage({ params }: AnalyticsPageProps) {
  const { type } = await params;
  const validTypes = ['cases', 'financial', 'productivity', 'clients', 'discovery', 'billing'];

  if (!validTypes.includes(type)) {
    notFound();
  }

  const title = type.charAt(0).toUpperCase() + type.slice(1);

  // Map type to endpoint
  let endpoint: string;
  switch (type) {
    case 'cases':
      endpoint = API_ENDPOINTS.ANALYTICS.CASES;
      break;
    case 'billing':
    case 'financial':
      endpoint = API_ENDPOINTS.ANALYTICS.BILLING;
      break;
    case 'discovery':
      endpoint = API_ENDPOINTS.ANALYTICS.DISCOVERY;
      break;
    default:
      endpoint = API_ENDPOINTS.ANALYTICS.DASHBOARD;
      break;
  }

  // Fetch real data
  let data: AnalyticsData;
  try {
    data = await apiFetch<AnalyticsData>(`${endpoint}?type=${type}&period=1y`);
  } catch {
    console.warn(`Failed to fetch analytics for ${type}, falling back to empty state.`);
    data = { total: 0, active: 0, performance: [] };
  }

  const chartConfig = {
    value: {
      label: title,
      color: "hsl(var(--primary))",
    },
    revenue: {
      label: "Revenue ($)",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title} Analytics</h1>
          <p className="text-muted-foreground">Detailed metrics for firm {type}.</p>
        </div>
        <Tabs defaultValue="1y">
          <TabsList>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
            <TabsTrigger value="1y">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.active.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Monthly trends for {type}</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={data.performance}
              config={chartConfig}
              title={title}
              showRevenue={type === 'billing'}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
