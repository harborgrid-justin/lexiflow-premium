/**
 * Case Team Detail Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  Edit,
  Mail,
  Phone,
  Plus,
  Shield,
  Trash2,
  User,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CaseTeamDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CaseTeamDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const team = await apiFetch(`/case-teams/${id}`);
    return {
      title: `${team.caseName} Team | Case Teams | LexiFlow`,
      description: `Team details for ${team.caseName}`,
    };
  } catch {
    return { title: 'Team Not Found' };
  }
}

export default async function CaseTeamDetailPage({ params }: CaseTeamDetailPageProps) {
  const { id } = await params;

  let team;
  try {
    team = await apiFetch(`/case-teams/${id}`);
  } catch {
    notFound();
  }

  const statusColors = {
    active: 'success',
    inactive: 'default',
    pending: 'warning',
  } as const;

  // Fetch team members from API
  let members = [];
  try {
    members = await apiFetch(`/case-teams/${id}/members`) || [];
  } catch {
    members = team.members || [];
  }

  const roleColors = {
    'Lead Attorney': 'info',
    Associate: 'success',
    Paralegal: 'warning',
    'Legal Assistant': 'default',
    Partner: 'purple',
  } as const;

  const memberColumns = [
    {
      header: 'Member',
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {row.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">{row.name}</p>
            <p className="text-sm text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (row: any) => (
        <Badge variant={roleColors[row.role as keyof typeof roleColors] || 'default'}>
          {row.role}
        </Badge>
      ),
    },
    {
      header: 'Contact',
      accessor: (row: any) => (
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" /> {row.phone}
          </span>
        </div>
      ),
    },
    {
      header: 'Hours Logged',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>{row.hoursLogged}h</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" icon={<Mail className="h-3 w-3" />}>
            Email
          </Button>
          <Button size="sm" variant="ghost" icon={<UserMinus className="h-3 w-3" />}>
            Remove
          </Button>
        </div>
      ),
    },
  ];

  const totalHours = members.reduce((acc: number, m: any) => acc + (m.hoursLogged || 0), 0);
  const activeMembers = members.filter((m: any) => m.status === 'active').length;

  return (
    <>
      <PageHeader
        title={`${team.caseName || 'Case'} Team`}
        description={team.caseNumber || `Team ID: ${id}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Cases', href: '/cases' },
          { label: 'Teams', href: '/case-teams' },
          { label: team.caseName || 'Team Detail' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={<Edit className="h-4 w-4" />}>
              Edit Team
            </Button>
            <Button variant="danger" icon={<Trash2 className="h-4 w-4" />}>
              Delete Team
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Overview */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Team Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Total Members</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {members.length}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Active Members</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {activeMembers}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Total Hours</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalHours.toFixed(1)}h
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Team Members */}
          <Card>
            <CardBody className="p-0">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Team Members
                </h3>
                <Button size="sm" icon={<UserPlus className="h-4 w-4" />}>
                  Add Member
                </Button>
              </div>
              <Table columns={memberColumns} data={members} />
            </CardBody>
          </Card>

          {/* Case Details */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Case Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Case Name</dt>
                  <dd className="text-slate-900 dark:text-slate-50 font-medium">{team.caseName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Case Number</dt>
                  <dd className="text-slate-900 dark:text-slate-50">{team.caseNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Lead Attorney</dt>
                  <dd className="text-slate-900 dark:text-slate-50">{team.leadAttorney}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Status</dt>
                  <dd>
                    <Badge variant={statusColors[team.status as keyof typeof statusColors] || 'default'}>
                      {team.status?.charAt(0).toUpperCase() + team.status?.slice(1)}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Created</dt>
                  <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Last Updated</dt>
                  <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {team.updatedAt ? new Date(team.updatedAt).toLocaleDateString() : '-'}
                  </dd>
                </div>
              </dl>
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
                <Button variant="outline" className="w-full justify-start" icon={<UserPlus className="h-4 w-4" />}>
                  Add Team Member
                </Button>
                <Button variant="outline" className="w-full justify-start" icon={<Briefcase className="h-4 w-4" />}>
                  View Case
                </Button>
                <Button variant="outline" className="w-full justify-start" icon={<Clock className="h-4 w-4" />}>
                  View Time Entries
                </Button>
                <Button variant="outline" className="w-full justify-start" icon={<Mail className="h-4 w-4" />}>
                  Email Team
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Roles Distribution */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Role Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(
                  members.reduce((acc: Record<string, number>, m: any) => {
                    acc[m.role] = (acc[m.role] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center">
                    <Badge variant={roleColors[role as keyof typeof roleColors] || 'default'}>
                      {role}
                    </Badge>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{count}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Activity Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">This Week</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">24.5 hours</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">This Month</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">156.0 hours</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Active Tasks</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">12 tasks</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/case-teams">
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Case Teams
          </Button>
        </Link>
      </div>
    </>
  );
}
