/**
 * Vendor Detail Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { ArrowLeft, Building2, Calendar, DollarSign, Edit, FileText, Mail, Phone, Trash2 } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface VendorDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: VendorDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const vendor = await apiFetch(`/procurement/vendors/${id}`);
    return {
      title: `${vendor.name} | Procurement | LexiFlow`,
      description: `Vendor details for ${vendor.name}`,
    };
  } catch {
    return { title: 'Vendor Not Found' };
  }
}

export default async function VendorDetailPage({ params }: VendorDetailPageProps) {
  const { id } = await params;

  let vendor;
  try {
    vendor = await apiFetch(`/procurement/vendors/${id}`);
  } catch {
    notFound();
  }

  const statusColors = {
    Active: 'success',
    Inactive: 'default',
    Pending: 'warning',
  } as const;

  // Fetch transactions from API
  let transactions = [];
  try {
    transactions = await apiFetch(`/procurement/vendors/${id}/transactions`) || [];
  } catch {
    transactions = vendor.transactions || [];
  }

  const transactionColumns = [
    {
      header: 'Date',
      accessor: (row: any) => new Date(row.date).toLocaleDateString(),
    },
    { header: 'Description', accessor: 'description' as const },
    { header: 'Invoice #', accessor: 'invoiceNumber' as const },
    {
      header: 'Amount',
      accessor: (row: any) => `$${row.amount.toLocaleString()}`,
    },
  ];

  return (
    <>
      <PageHeader
        title={vendor.name}
        description={vendor.category}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Procurement', href: '/procurement' },
          { label: vendor.name },
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Spend</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                ${vendor.totalSpend?.toLocaleString() || 0}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Invoices</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {transactions.length}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Contract End</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {vendor.contractEndDate ? new Date(vendor.contractEndDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Details */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Vendor Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Company Name</dt>
                  <dd className="text-slate-900 dark:text-slate-50 font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {vendor.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Category</dt>
                  <dd className="text-slate-900 dark:text-slate-50">{vendor.category}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Contact Name</dt>
                  <dd className="text-slate-900 dark:text-slate-50">{vendor.contactName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Status</dt>
                  <dd>
                    <Badge variant={statusColors[vendor.status as keyof typeof statusColors] || 'default'}>
                      {vendor.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Email</dt>
                  <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {vendor.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Phone</dt>
                  <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {vendor.phone}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Transactions */}
          <Card>
            <CardBody className="p-0">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Recent Transactions
                </h3>
              </div>
              <Table columns={transactionColumns} data={transactions} />
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
                <Button variant="outline" className="w-full justify-start">
                  Create Invoice
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  View Contract
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Schedule Review
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export Data
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Contract Info */}
          {vendor.contractEndDate && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Contract
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">End Date</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {new Date(vendor.contractEndDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Contract
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link href="/procurement">
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Procurement
          </Button>
        </Link>
      </div>
    </>
  );
}
