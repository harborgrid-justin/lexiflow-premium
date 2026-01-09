/**
 * Marketing Campaign Detail Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { ArrowLeft, BarChart3, Calendar, DollarSign, Edit, Target, Trash2, TrendingUp, Users } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CampaignDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const campaign = await apiFetch(`/marketing/campaigns/${id}`);
    return {
      title: `${campaign.name} | Marketing | LexiFlow`,
      description: `Campaign details for ${campaign.name}`,
    };
  } catch {
    return { title: 'Campaign Not Found' };
  }
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;

  let campaign;
  try {
    campaign = await apiFetch(`/marketing/campaigns/${id}`);
  } catch {
    notFound();
  }

  const statusColors = {
    Active: 'success',
    Completed: 'default',
    Planned: 'info',
    Paused: 'warning',
  } as const;

  const typeColors = {
    Email: 'info',
    Event: 'success',
    Content: 'warning',
    Referral: 'purple',
    Advertising: 'default',
  } as const;

  const budgetUsed = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0;
  const conversionRate = campaign.leads > 0 ? (campaign.conversions / campaign.leads) * 100 : 0;

  // Fetch leads from API
  let leads = [];
  try {
    leads = await apiFetch(`/marketing/campaigns/${id}/leads`) || [];
  } catch {
    leads = campaign.leadsList || [];
  }

  const leadColumns = [
    { header: 'Name', accessor: 'name' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Source', accessor: 'source' as const },
    {
      header: 'Status',
      accessor: (row: any) => (
        <Badge variant={row.status === 'Qualified' ? 'success' : row.status === 'New' ? 'info' : 'default'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Date',
      accessor: (row: any) => new Date(row.date).toLocaleDateString(),
    },
  ];

  return (
    <>
      <PageHeader
        title={campaign.name}
        description={`${campaign.type} Campaign`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Marketing', href: '/marketing' },
          { label: campaign.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
            <Button variant="danger" icon={<Trash2 className="h-4 w-4" />}>
              Delete
            </Button>
          </div>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{campaign.leads}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Conversions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{campaign.conversions}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{conversionRate.toFixed(1)}%</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Cost per Lead</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                ${campaign.leads > 0 ? (campaign.spent / campaign.leads).toFixed(0) : 0}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Details */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Campaign Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Campaign Name</dt>
                  <dd className="text-slate-900 dark:text-slate-50 font-medium">{campaign.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Type</dt>
                  <dd>
                    <Badge variant={typeColors[campaign.type as keyof typeof typeColors] || 'default'}>
                      {campaign.type}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Status</dt>
                  <dd>
                    <Badge variant={statusColors[campaign.status as keyof typeof statusColors] || 'default'}>
                      {campaign.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Duration</dt>
                  <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {new Date(campaign.startDate).toLocaleDateString()} - {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing'}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Budget */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Budget
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <span>Spent: ${campaign.spent.toLocaleString()}</span>
                  <span>Budget: ${campaign.budget.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${budgetUsed >= 90 ? 'bg-red-500' : budgetUsed >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-2">{budgetUsed.toFixed(1)}% of budget used</p>
              </div>
            </CardBody>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardBody className="p-0">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Campaign Leads
                </h3>
              </div>
              <Table columns={leadColumns} data={leads} />
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {campaign.status === 'Active' && (
                  <Button variant="outline" className="w-full justify-start">
                    Pause Campaign
                  </Button>
                )}
                {campaign.status === 'Paused' && (
                  <Button variant="outline" className="w-full justify-start">
                    Resume Campaign
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start">
                  Export Leads
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Duplicate Campaign
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Performance
              </h3>
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Performance chart</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/marketing">
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Marketing
          </Button>
        </Link>
      </div>
    </>
  );
}
