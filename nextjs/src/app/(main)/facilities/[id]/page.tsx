/**
 * Facility Detail Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { ArrowLeft, Edit, MapPin, Phone, Trash2, Users } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface FacilityDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: FacilityDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const facility = await apiFetch(`/facilities/${id}`);
    return {
      title: `${facility.name} | Facilities | LexiFlow`,
      description: `Facility details for ${facility.name}`,
    };
  } catch {
    return { title: 'Facility Not Found' };
  }
}

export default async function FacilityDetailPage({ params }: FacilityDetailPageProps) {
  const { id } = await params;

  let facility;
  try {
    facility = await apiFetch(`/facilities/${id}`);
  } catch {
    notFound();
  }

  const typeColors = {
    Office: 'success',
    Storage: 'default',
    'Meeting Room': 'info',
    Court: 'warning',
    Other: 'default',
  } as const;

  return (
    <>
      <PageHeader
        title={facility.name}
        description={`${facility.type} • ${facility.city}, ${facility.state}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Facilities', href: '/facilities' },
          { label: facility.name },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Facility Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Name</dt>
                  <dd className="text-slate-900 dark:text-slate-50 font-medium">{facility.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Type</dt>
                  <dd>
                    <Badge variant={typeColors[facility.type as keyof typeof typeColors] || 'default'}>
                      {facility.type}
                    </Badge>
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Address</dt>
                  <dd className="text-slate-900 dark:text-slate-50 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                    <span>
                      {facility.address}<br />
                      {facility.city}, {facility.state} {facility.zip}
                    </span>
                  </dd>
                </div>
                {facility.phone && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Phone</dt>
                    <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {facility.phone}
                    </dd>
                  </div>
                )}
                {facility.capacity && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Capacity</dt>
                    <dd className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      {facility.capacity} people
                    </dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>

          {/* Amenities */}
          {facility.amenities && facility.amenities.length > 0 && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {facility.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="default">{amenity}</Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Notes */}
          {facility.notes && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Notes
                </h3>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{facility.notes}</p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Map Placeholder */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Location
              </h3>
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Map view</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Get Directions
              </Button>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Book Meeting Room
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  View Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Report Issue
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/facilities">
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Facilities
          </Button>
        </Link>
      </div>
    </>
  );
}
