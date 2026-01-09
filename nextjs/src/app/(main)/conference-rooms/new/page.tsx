/**
 * Book Conference Room Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { ArrowLeft, Calendar, Save } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Book Room | Facilities | LexiFlow',
  description: 'Reserve a conference room or facility',
};

export default function BookRoomPage() {
  return (
    <>
      <PageHeader
        title="Reserve Conference Room"
        description="Book a meeting space or facility resource"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Conference Rooms', href: '/conference-rooms' },
          { label: 'New Reservation' },
        ]}
      />

      <div className="max-w-3xl">
        <form>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Client Deposition: Smith vs. Jones"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Resource / Room
                    </label>
                    <select
                      name="resource"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="main_conf">Main Conference Room (20 ppl)</option>
                      <option value="small_conf_a">Small Conf A (6 ppl)</option>
                      <option value="small_conf_b">Small Conf B (6 ppl)</option>
                      <option value="war_room">War Room (Secure)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Organizer
                    </label>
                    <input
                      type="text"
                      name="organizer"
                      defaultValue="Current User"
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        required
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        required
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amenities Needed
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="amenities" value="video" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Video Conference</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="amenities" value="catering" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Catering</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="amenities" value="projector" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Projector/Screen</span>
                    </label>
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/conference-rooms">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" icon={<Calendar className="h-4 w-4" />}>
              Examine Availability & Book
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
