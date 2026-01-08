/**
 * Team Management Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Plus } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Team | LexiFlow',
  description: 'Manage team members, roles, and permissions',
};

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Attorney' | 'Paralegal' | 'Staff';
  status: 'Active' | 'Inactive';
  joinDate: string;
}

async function TeamList() {
  let members: TeamMember[] = [];
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.USERS?.LIST || '/api/team');
    members = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load team members';
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
    { header: 'Name', accessor: 'name' as const },
    { header: 'Email', accessor: 'email' as const },
    {
      header: 'Role',
      accessor: (row: TeamMember) => (
        <Badge
          variant={
            row.role === 'Admin'
              ? 'danger'
              : row.role === 'Attorney'
                ? 'primary'
                : row.role === 'Paralegal'
                  ? 'info'
                  : 'default'
          }
        >
          {row.role}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (row: TeamMember) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      ),
    },
    { header: 'Join Date', accessor: 'joinDate' as const },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {members.length > 0 ? (
          <Table columns={columns} data={members} />
        ) : (
          <EmptyState
            title="No team members found"
            description="Invite your first team member"
            action={<Button size="sm">Invite Member</Button>}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team Management"
        description="Manage team members and permissions"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Team' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />}>Invite Member</Button>}
      />

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
        <TeamList />
      </Suspense>
    </>
  );
}
