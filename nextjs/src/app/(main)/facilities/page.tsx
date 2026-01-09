/**
 * Facilities Management Page
 * Manages office locations, meeting rooms, and facility information
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { Building2, MapPin, Plus, Users } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Facilities | LexiFlow',
  description: 'Manage office locations, meeting rooms, and facilities',
};

interface Facility {
  id: string;
  name: string;
  type: 'Office' | 'Storage' | 'Meeting Room' | 'Court' | 'Other';
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  capacity?: number;
  amenities?: string[];
  notes?: string;
}

async function FacilitiesStats() {
  let facilities: Facility[] = [];

  try {
    const response = await apiFetch('/facilities');
    facilities = Array.isArray(response) ? response : [];
  } catch {
    return null;
  }

  const stats = {
    total: facilities.length,
    offices: facilities.filter(f => f.type === 'Office').length,
    meetingRooms: facilities.filter(f => f.type === 'Meeting Room').length,
    totalCapacity: facilities.reduce((sum, f) => sum + (f.capacity || 0), 0),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Facilities</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.total}</p>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Offices</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.offices}</p>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Meeting Rooms</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.meetingRooms}</p>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Capacity</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalCapacity}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

async function FacilitiesList() {
  let facilities: Facility[] = [];
  let error = null;

  try {
    const response = await apiFetch('/facilities');
    facilities = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load facilities';
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

  const typeColors = {
    Office: 'success',
    Storage: 'default',
    'Meeting Room': 'info',
    Court: 'warning',
    Other: 'default',
  } as const;

  const columns = [
    {
      header: 'Name',
      accessor: (row: Facility) => (
        <Link href={`/facilities/${row.id}`} className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
          {row.name}
        </Link>
      ),
    },
    {
      header: 'Type',
      accessor: (row: Facility) => (
        <Badge variant={typeColors[row.type]}>{row.type}</Badge>
      ),
    },
    {
      header: 'Address',
      accessor: (row: Facility) => (
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
          <span>{row.address}, {row.city}, {row.state} {row.zip}</span>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: (row: Facility) => row.phone || '-',
    },
    {
      header: 'Capacity',
      accessor: (row: Facility) => row.capacity ? `${row.capacity} people` : '-',
    },
    {
      header: 'Actions',
      accessor: (row: Facility) => (
        <Link href={`/facilities/${row.id}`}>
          <Button variant="ghost" size="sm">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="p-0">
        {facilities.length > 0 ? (
          <Table columns={columns} data={facilities} />
        ) : (
          <EmptyState
            title="No facilities found"
            description="Add your first office or facility"
            action={
              <Link href="/facilities/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                  Add Facility
                </Button>
              </Link>
            }
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function FacilitiesPage() {
  return (
    <>
      <PageHeader
        title="Facilities"
        description="Manage office locations, meeting rooms, and facilities"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Facilities' },
        ]}
        actions={
          <Link href="/facilities/new">
            <Button icon={<Plus className="h-4 w-4" />}>Add Facility</Button>
          </Link>
        }
      />

      {/* Stats */}
      <Suspense fallback={null}>
        <FacilitiesStats />
      </Suspense>

      {/* Search */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex gap-4">
            <input
              placeholder="Search facilities..."
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            />
            <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
              <option value="">All Types</option>
              <option value="Office">Office</option>
              <option value="Storage">Storage</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Court">Court</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Facilities List */}
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
        <FacilitiesList />
      </Suspense>
    </>
  );
}
