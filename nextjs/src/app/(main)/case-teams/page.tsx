/**
 * Case Teams List Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { Plus, Search, Users, UserPlus, Shield, Briefcase } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Case Teams | LexiFlow',
  description: 'Manage case team assignments and roles',
};

interface CaseTeam {
  id: string;
  caseName: string;
  caseNumber: string;
  teamSize: number;
  leadAttorney: string;
  paralegal: string | null;
  status: string;
  createdAt: string;
}

interface CaseTeamsSearchParams {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

async function CaseTeamsContent({ searchParams }: CaseTeamsSearchParams) {
  const params = await searchParams;
  const search = params.search || '';
  const statusFilter = params.status || '';

  let teams: CaseTeam[] = [];
  try {
    teams = await apiFetch('/case-teams');
  } catch {
    teams = [];
  }

  // Apply filters
  let filteredTeams = teams;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTeams = filteredTeams.filter(
      (t) =>
        t.caseName?.toLowerCase().includes(searchLower) ||
        t.caseNumber?.toLowerCase().includes(searchLower) ||
        t.leadAttorney?.toLowerCase().includes(searchLower)
    );
  }
  if (statusFilter && statusFilter !== 'all') {
    filteredTeams = filteredTeams.filter((t) => t.status === statusFilter);
  }

  // Calculate stats
  const totalTeams = teams.length;
  const activeTeams = teams.filter((t) => t.status === 'active').length;
  const totalMembers = teams.reduce((acc, t) => acc + (t.teamSize || 0), 0);
  const avgTeamSize = totalTeams > 0 ? (totalMembers / totalTeams).toFixed(1) : '0';

  const statusColors = {
    active: 'success',
    inactive: 'default',
    pending: 'warning',
  } as const;

  const columns = [
    {
      header: 'Case',
      accessor: (row: CaseTeam) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-50">{row.caseName}</p>
          <p className="text-sm text-slate-500">{row.caseNumber}</p>
        </div>
      ),
    },
    {
      header: 'Lead Attorney',
      accessor: (row: CaseTeam) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              {row.leadAttorney?.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <span>{row.leadAttorney}</span>
        </div>
      ),
    },
    {
      header: 'Team Size',
      accessor: (row: CaseTeam) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span>{row.teamSize} members</span>
        </div>
      ),
    },
    {
      header: 'Paralegal',
      accessor: (row: CaseTeam) => row.paralegal || '-',
    },
    {
      header: 'Status',
      accessor: (row: CaseTeam) => (
        <Badge variant={statusColors[row.status as keyof typeof statusColors] || 'default'}>
          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Created',
      accessor: (row: CaseTeam) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
    },
    {
      header: 'Actions',
      accessor: (row: CaseTeam) => (
        <Link href={`/case-teams/${row.id}`}>
          <Button size="sm" variant="ghost">
            View Team
          </Button>
        </Link>
      ),
    },
  ];

  if (filteredTeams.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="No case teams found"
        description={search || statusFilter ? 'Try adjusting your filters' : 'Create your first case team to get started'}
        action={
          <Link href="/case-teams/new">
            <Button icon={<Plus className="h-4 w-4" />}>Create Team</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{totalTeams}</p>
                <p className="text-sm text-slate-500">Total Teams</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{activeTeams}</p>
                <p className="text-sm text-slate-500">Active Teams</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{totalMembers}</p>
                <p className="text-sm text-slate-500">Total Members</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{avgTeamSize}</p>
                <p className="text-sm text-slate-500">Avg Team Size</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cases, attorneys..."
                defaultValue={search}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              />
            </div>
            <select
              defaultValue={statusFilter || 'all'}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Teams Table */}
      <Card>
        <CardBody className="p-0">
          <Table columns={columns} data={filteredTeams} />
        </CardBody>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardBody>
              <SkeletonLine className="h-16" />
            </CardBody>
          </Card>
        ))}
      </div>
      <Card>
        <CardBody>
          <SkeletonLine className="h-10" />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonLine key={i} className="h-12" />
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default async function CaseTeamsPage({ searchParams }: CaseTeamsSearchParams) {
  return (
    <>
      <PageHeader
        title="Case Teams"
        description="Manage team assignments and roles for cases"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Cases', href: '/cases' },
          { label: 'Teams' },
        ]}
        actions={
          <Link href="/case-teams/new">
            <Button icon={<Plus className="h-4 w-4" />}>Create Team</Button>
          </Link>
        }
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <CaseTeamsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
