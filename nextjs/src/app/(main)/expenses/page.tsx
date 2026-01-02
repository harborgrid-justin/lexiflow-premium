/**
 * Expenses Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Reimbursed';
}

async function ExpensesListContent() {
  let expenses: Expense[] = [];
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.EXPENSES?.LIST || '/api/expenses');
    expenses = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load expenses';
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

  const columns = [
    { header: 'Date', accessor: 'date' as const },
    { header: 'Description', accessor: 'description' as const },
    { header: 'Category', accessor: 'category' as const },
    {
      header: 'Amount',
      accessor: (row: Expense) => `$${row.amount.toFixed(2)}`,
    },
    {
      header: 'Status',
      accessor: (row: Expense) => (
        <Badge
          variant={
            row.status === 'Reimbursed'
              ? 'success'
              : row.status === 'Approved'
                ? 'primary'
                : 'warning'
          }
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {expenses.length > 0 ? (
          <Table columns={columns} data={expenses} />
        ) : (
          <EmptyState
            title="No expenses found"
            description="Log your first expense"
            action={<Button size="sm">New Expense</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function ExpensesPage() {
  return (
    <>
      <PageHeader
        title="Expenses"
        description="Track and manage case expenses"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Expenses' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>New Expense</Button>}
      />

      <Card className="mb-6">
        <CardBody>
          <input
            placeholder="Search expenses..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
          />
        </CardBody>
      </Card>

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
        <ExpensesListContent />
      </Suspense>
    </>
  );
}
