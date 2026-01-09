/**
 * CLE Courses Catalog Page
 * Browse available continuing legal education courses
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import { BookOpen, Calendar, DollarSign, ExternalLink, Filter, MapPin, Search } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'CLE Courses | LexiFlow',
  description: 'Browse available continuing legal education courses',
};

interface CLECourse {
  id: string;
  title: string;
  provider: string;
  credits: number;
  category: 'Ethics' | 'General' | 'Specialty';
  jurisdiction: string[];
  format: 'Live' | 'Online' | 'On-Demand';
  date?: string;
  cost: number;
  description: string;
  registrationUrl?: string;
}

async function CourseCatalog() {
  let courses: CLECourse[] = [];
  let error = null;

  try {
    const response = await apiFetch('/cle/courses');
    courses = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load courses';
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

  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses available"
        description="Check back later for new CLE courses"
        action={
          <Button variant="outline" size="sm">
            Refresh
          </Button>
        }
      />
    );
  }

  const formatColors = {
    Live: 'success',
    Online: 'info',
    'On-Demand': 'default',
  } as const;

  const categoryColors = {
    Ethics: 'info',
    General: 'default',
    Specialty: 'warning',
  } as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course.id} className="flex flex-col">
          <CardBody className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <Badge variant={formatColors[course.format]}>{course.format}</Badge>
              <Badge variant={categoryColors[course.category]}>{course.category}</Badge>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2 line-clamp-2">
              {course.title}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
              {course.description}
            </p>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{course.credits} credits</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{course.jurisdiction.slice(0, 3).join(', ')}{course.jurisdiction.length > 3 && ` +${course.jurisdiction.length - 3} more`}</span>
              </div>
              {course.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(course.date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>{course.cost > 0 ? `$${course.cost}` : 'Free'}</span>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Provider: {course.provider}
            </p>

            <div className="flex gap-2 mt-auto">
              {course.registrationUrl && (
                <a
                  href={course.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="primary" className="w-full" icon={<ExternalLink className="h-4 w-4" />}>
                    Register
                  </Button>
                </a>
              )}
              <Button variant="outline" size="sm">
                Details
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default function CLECoursesPage() {
  return (
    <>
      <PageHeader
        title="CLE Courses"
        description="Browse and register for continuing legal education courses"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'CLE', href: '/cle' },
          { label: 'Courses' },
        ]}
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Categories</option>
                <option value="General">General</option>
                <option value="Ethics">Ethics</option>
                <option value="Specialty">Specialty</option>
              </select>
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Formats</option>
                <option value="Live">Live</option>
                <option value="Online">Online</option>
                <option value="On-Demand">On-Demand</option>
              </select>
              <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <option value="">All Jurisdictions</option>
                <option value="California">California</option>
                <option value="New York">New York</option>
                <option value="Texas">Texas</option>
              </select>
              <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
                More Filters
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Course Grid */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardBody>
                  <SkeletonLine lines={6} />
                </CardBody>
              </Card>
            ))}
          </div>
        }
      >
        <CourseCatalog />
      </Suspense>
    </>
  );
}
