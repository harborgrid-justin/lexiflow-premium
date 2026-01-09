/**
 * Procurement & Vendor Management Page
 * Manages vendor spending, contracts, and procurement analytics
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { Building2, DollarSign, FileText, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Procurement | LexiFlow',
  description: 'Vendor management and procurement analytics',
};

interface VendorSpend {
  vendorId: string;
  vendorName: string;
  category: string;
  amount: number;
  month: string;
  year: number;
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Pending';
  totalSpend: number;
  contractEndDate?: string;
}

async function ProcurementStats() {
  const stats = {
    totalSpend: 0,
    vendors: 0,
    contracts: 0,
    savings: 0,
  };

  try {
    const [vendors, spend] = await Promise.all([
      apiFetch('/procurement/vendors'),
      apiFetch('/procurement/vendor-spend?year=2025'),
    ]);

    const vendorList = Array.isArray(vendors) ? vendors : [];
    const spendList = Array.isArray(spend) ? spend : [];

    stats.vendors = vendorList.length;
    stats.totalSpend = spendList.reduce((sum: number, s: VendorSpend) => sum + s.amount, 0);
    stats.contracts = vendorList.filter((v: Vendor) => v.contractEndDate).length;
    // Fetch savings from API
    try {
      const savingsData = await apiFetch('/procurement/savings-summary');
      stats.savings = savingsData?.totalSavings || 0;
    } catch {
      stats.savings = 0;
    }
  } catch {
    // Use default stats
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">YTD Spend</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              ${(stats.totalSpend / 1000).toFixed(0)}K
            </p>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Vendors</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.vendors}</p>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Contracts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.contracts}</p>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <TrendingDown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Est. Savings</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              ${(stats.savings / 1000).toFixed(0)}K
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

async function VendorsList() {
  let vendors: Vendor[] = [];
  let error = null;

  try {
    const response = await apiFetch('/procurement/vendors');
    vendors = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load vendors';
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
    Inactive: 'default',
    Pending: 'warning',
  } as const;

  const columns = [
    {
      header: 'Vendor',
      accessor: (row: Vendor) => (
        <Link href={`/procurement/${row.id}`} className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
          {row.name}
        </Link>
      ),
    },
    { header: 'Category', accessor: 'category' as const },
    { header: 'Contact', accessor: 'contactName' as const },
    { header: 'Email', accessor: 'email' as const },
    {
      header: 'Status',
      accessor: (row: Vendor) => (
        <Badge variant={statusColors[row.status]}>{row.status}</Badge>
      ),
    },
    {
      header: 'Total Spend',
      accessor: (row: Vendor) => `$${row.totalSpend.toLocaleString()}`,
    },
    {
      header: 'Contract End',
      accessor: (row: Vendor) => row.contractEndDate ? new Date(row.contractEndDate).toLocaleDateString() : '-',
    },
    {
      header: 'Actions',
      accessor: (row: Vendor) => (
        <Link href={`/procurement/${row.id}`}>
          <Button variant="ghost" size="sm">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {vendors.length > 0 ? (
          <Table columns={columns} data={vendors} />
        ) : (
          <EmptyState
            title="No vendors found"
            description="Add your first vendor"
            action={
              <Link href="/procurement/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                  Add Vendor
                </Button>
              </Link>
            }
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function ProcurementPage() {
  return (
    <>
      <PageHeader
        title="Procurement"
        description="Vendor management and spend analytics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Procurement' },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/procurement/analytics">
              <Button variant="outline" icon={<TrendingUp className="h-4 w-4" />}>
                Analytics
              </Button>
            </Link>
            <Link href="/procurement/new">
              <Button icon={<Plus className="h-4 w-4" />}>Add Vendor</Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
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
        <ProcurementStats />
      </Suspense>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              placeholder="Search vendors..."
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            />
            <div className="flex gap-2">
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Categories</option>
                <option value="Legal Services">Legal Services</option>
                <option value="Technology">Technology</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Professional Services">Professional Services</option>
              </select>
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Vendors Table */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Vendors
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
          <VendorsList />
        </Suspense>
      </div>
    </>
  );
}
