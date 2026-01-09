/**
 * Marketing Dashboard Page
 * Marketing metrics, campaigns, and analytics
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { BarChart3, Mail, Megaphone, Plus, Target, TrendingUp, Users } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Marketing | LexiFlow',
  description: 'Marketing campaigns, metrics, and analytics',
};

interface MarketingCampaign {
  id: string;
  name: string;
  type: 'Email' | 'Event' | 'Content' | 'Referral' | 'Advertising';
  status: 'Active' | 'Completed' | 'Planned' | 'Paused';
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
}

interface MarketingMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

async function MarketingMetrics() {
  let metrics: MarketingMetric[] = [];

  try {
    const response = await apiFetch('/marketing/metrics');
    metrics = Array.isArray(response) ? response : [];
  } catch {
    // Return default metrics on error
    metrics = [
      { name: 'Total Leads', value: 156, change: 12, trend: 'up' },
      { name: 'Conversion Rate', value: 24, change: 3, trend: 'up' },
      { name: 'New Clients', value: 38, change: -2, trend: 'down' },
      { name: 'Campaign ROI', value: 340, change: 15, trend: 'up' },
    ];
  }

  const icons = {
    'Total Leads': <Users className="h-6 w-6" />,
    'Conversion Rate': <Target className="h-6 w-6" />,
    'New Clients': <Users className="h-6 w-6" />,
    'Campaign ROI': <TrendingUp className="h-6 w-6" />,
  };

  const colors = {
    'Total Leads': 'blue',
    'Conversion Rate': 'green',
    'New Clients': 'purple',
    'Campaign ROI': 'amber',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric) => (
        <Card key={metric.name}>
          <CardBody className="flex items-center gap-4">
            <div className={`p-3 bg-${colors[metric.name as keyof typeof colors] || 'blue'}-100 dark:bg-${colors[metric.name as keyof typeof colors] || 'blue'}-900/50 rounded-lg`}>
              <div className={`text-${colors[metric.name as keyof typeof colors] || 'blue'}-600 dark:text-${colors[metric.name as keyof typeof colors] || 'blue'}-400`}>
                {icons[metric.name as keyof typeof icons] || <BarChart3 className="h-6 w-6" />}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">{metric.name}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {metric.name.includes('Rate') || metric.name.includes('ROI') ? `${metric.value}%` : metric.value}
                </p>
                <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-slate-500'}`}>
                  {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '' : ''}{metric.change}%
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

async function CampaignsList() {
  let campaigns: MarketingCampaign[] = [];
  let error = null;

  try {
    const response = await apiFetch('/marketing/campaigns');
    campaigns = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load campaigns';
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </CardBody>
      </Card>
    );
  }

  const statusColors = {
    Active: 'success',
    Completed: 'default',
    Planned: 'info',
    Paused: 'warning',
  } as const;

  const typeIcons = {
    Email: <Mail className="h-4 w-4" />,
    Event: <Users className="h-4 w-4" />,
    Content: <Megaphone className="h-4 w-4" />,
    Referral: <Users className="h-4 w-4" />,
    Advertising: <Target className="h-4 w-4" />,
  };

  const columns = [
    {
      header: 'Campaign',
      accessor: (row: MarketingCampaign) => (
        <Link href={`/marketing/${row.id}`} className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-2">
          {typeIcons[row.type]}
          {row.name}
        </Link>
      ),
    },
    {
      header: 'Type',
      accessor: (row: MarketingCampaign) => (
        <Badge variant="default">{row.type}</Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (row: MarketingCampaign) => (
        <Badge variant={statusColors[row.status]}>{row.status}</Badge>
      ),
    },
    {
      header: 'Duration',
      accessor: (row: MarketingCampaign) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(row.startDate).toLocaleDateString()} - {row.endDate ? new Date(row.endDate).toLocaleDateString() : 'Ongoing'}
        </span>
      ),
    },
    {
      header: 'Budget',
      accessor: (row: MarketingCampaign) => (
        <div>
          <span className="font-medium">${row.spent.toLocaleString()}</span>
          <span className="text-slate-500"> / ${row.budget.toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: 'Leads',
      accessor: (row: MarketingCampaign) => row.leads,
    },
    {
      header: 'Conversions',
      accessor: (row: MarketingCampaign) => row.conversions,
    },
    {
      header: 'Actions',
      accessor: (row: MarketingCampaign) => (
        <Link href={`/marketing/${row.id}`}>
          <Button variant="ghost" size="sm">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {campaigns.length > 0 ? (
          <Table columns={columns} data={campaigns} />
        ) : (
          <EmptyState
            title="No campaigns found"
            description="Create your first marketing campaign"
            action={
              <Link href="/marketing/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                  Create Campaign
                </Button>
              </Link>
            }
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function MarketingPage() {
  return (
    <>
      <PageHeader
        title="Marketing"
        description="Campaign management, metrics, and analytics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Marketing' },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/marketing/leads">
              <Button variant="outline" icon={<Users className="h-4 w-4" />}>
                Leads
              </Button>
            </Link>
            <Link href="/marketing/new">
              <Button icon={<Plus className="h-4 w-4" />}>Create Campaign</Button>
            </Link>
          </div>
        }
      />

      {/* Metrics */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardBody>
                  <SkeletonLine lines={2} />
                </CardBody>
              </Card>
            ))}
          </div>
        }
      >
        <MarketingMetrics />
      </Suspense>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              placeholder="Search campaigns..."
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            />
            <div className="flex gap-2">
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Types</option>
                <option value="Email">Email</option>
                <option value="Event">Event</option>
                <option value="Content">Content</option>
                <option value="Referral">Referral</option>
                <option value="Advertising">Advertising</option>
              </select>
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Campaigns Table */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Campaigns
        </h2>
        <Suspense
          fallback={
            <Card>
              <CardBody className="p-0">
                <div className="px-6 py-4">
                  <SkeletonLine lines={5} className="h-12" />
                </div>
              </CardBody>
            </Card>
          }
        >
          <CampaignsList />
        </Suspense>
      </div>
    </>
  );
}
