/**
 * CLE (Continuing Legal Education) Tracking Page
 * Monitors CLE credits, courses, requirements, and compliance tracking
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { Award, BookOpen, Calendar, GraduationCap, Plus, Target } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'CLE Tracking | LexiFlow',
  description: 'Track continuing legal education credits and requirements',
};

interface CLECredit {
  id: string;
  courseName: string;
  provider: string;
  date: string;
  credits: number;
  category: 'Ethics' | 'General' | 'Specialty';
  jurisdiction: string;
  status: 'Completed' | 'Pending' | 'Verified';
}

interface CLEProgress {
  jurisdiction: string;
  totalCompleted: number;
  totalRequired: number;
  ethicsCompleted: number;
  ethicsRequired: number;
  percentComplete: number;
  deadline: string;
  daysRemaining: number;
  isCompliant: boolean;
}

async function CLEProgressCards() {
  let progress: CLEProgress[] = [];
  let error = null;

  try {
    const response = await apiFetch('/cle/progress');
    progress = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load CLE progress';
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

  if (progress.length === 0) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            title="No CLE requirements set up"
            description="Configure your bar admission jurisdictions to track CLE requirements"
            action={
              <Link href="/bar-requirements">
                <Button size="sm" icon={<Target className="h-4 w-4" />}>
                  Configure Requirements
                </Button>
              </Link>
            }
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {progress.map((item) => (
        <Card key={item.jurisdiction}>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                {item.jurisdiction}
              </h3>
              <Badge variant={item.isCompliant ? 'success' : item.daysRemaining < 90 ? 'danger' : 'warning'}>
                {item.isCompliant ? 'Compliant' : `${item.daysRemaining} days left`}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                <span>Total Progress</span>
                <span>{item.totalCompleted}/{item.totalRequired} credits</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.percentComplete >= 100 ? 'bg-green-500' : item.percentComplete >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                  style={{ width: `${Math.min(item.percentComplete, 100)}%` }}
                />
              </div>
            </div>

            {/* Ethics Progress */}
            <div className="text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span>Ethics</span>
                <span>{item.ethicsCompleted}/{item.ethicsRequired} credits</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min((item.ethicsCompleted / item.ethicsRequired) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4 inline mr-1" />
              Deadline: {new Date(item.deadline).toLocaleDateString()}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

async function CLECreditsTable() {
  let credits: CLECredit[] = [];
  let error = null;

  try {
    const response = await apiFetch('/cle/credits');
    credits = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load CLE credits';
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
    { header: 'Course', accessor: 'courseName' as const },
    { header: 'Provider', accessor: 'provider' as const },
    {
      header: 'Date',
      accessor: (row: CLECredit) => new Date(row.date).toLocaleDateString(),
    },
    {
      header: 'Credits',
      accessor: (row: CLECredit) => (
        <span className="font-medium">{row.credits}</span>
      ),
    },
    {
      header: 'Category',
      accessor: (row: CLECredit) => (
        <Badge
          variant={
            row.category === 'Ethics' ? 'info' : row.category === 'Specialty' ? 'warning' : 'default'
          }
        >
          {row.category}
        </Badge>
      ),
    },
    { header: 'Jurisdiction', accessor: 'jurisdiction' as const },
    {
      header: 'Status',
      accessor: (row: CLECredit) => (
        <Badge
          variant={
            row.status === 'Verified' ? 'success' : row.status === 'Pending' ? 'warning' : 'default'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: CLECredit) => (
        <Link href={`/cle/${row.id}`}>
          <Button variant="ghost" size="sm">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {credits.length > 0 ? (
          <Table columns={columns} data={credits} />
        ) : (
          <EmptyState
            title="No CLE credits logged"
            description="Log your first CLE credit to start tracking"
            action={
              <Link href="/cle/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                  Log Credit
                </Button>
              </Link>
            }
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function CLEPage() {
  return (
    <>
      <PageHeader
        title="CLE Tracking"
        description="Monitor continuing legal education credits and compliance"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'CLE' },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/cle/courses">
              <Button variant="outline" icon={<BookOpen className="h-4 w-4" />}>
                Browse Courses
              </Button>
            </Link>
            <Link href="/cle/new">
              <Button icon={<Plus className="h-4 w-4" />}>Log Credit</Button>
            </Link>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Credits</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">24.5</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ethics Credits</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">4.0</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Jurisdictions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">2</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Next Deadline</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">Mar 31</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* CLE Progress */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Compliance Progress
        </h2>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardBody>
                    <SkeletonLine lines={4} />
                  </CardBody>
                </Card>
              ))}
            </div>
          }
        >
          <CLEProgressCards />
        </Suspense>
      </div>

      {/* CLE Credits Table */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
          CLE Credits
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
          <CLECreditsTable />
        </Suspense>
      </div>
    </>
  );
}
