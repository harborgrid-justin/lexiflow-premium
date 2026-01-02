/**
 * Settings Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody, CardHeader, SkeletonLine } from '@/components/ui';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Save } from 'lucide-react';
import { Suspense } from 'react';

async function SettingsContent() {
  let settings: Record<string, string> = {};
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.USERS?.PROFILE('user') || '/api/settings');
    settings = (response as Record<string, string>) || {};
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load settings';
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

  return (
    <div className="max-w-2xl">
      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-semibold">Personal Information</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={settings.fullName || ''}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
              Email
            </label>
            <input
              type="email"
              defaultValue={settings.email || ''}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
              Phone
            </label>
            <input
              type="tel"
              defaultValue={settings.phone || ''}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            />
          </div>
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-semibold">Preferences</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
              Theme
            </label>
            <select className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
              Notifications
            </label>
            <select className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
              <option>All notifications</option>
              <option>Important only</option>
              <option>None</option>
            </select>
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-4">
        <Button icon={<Save className="h-4 w-4" />}>Save Changes</Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />

      <Suspense
        fallback={
          <Card>
            <CardBody>
              <SkeletonLine lines={8} className="h-12" />
            </CardBody>
          </Card>
        }
      >
        <SettingsContent />
      </Suspense>
    </>
  );
}
