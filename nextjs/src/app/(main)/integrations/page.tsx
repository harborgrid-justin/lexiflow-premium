/**
 * Integrations Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, SkeletonLine } from '@/components/ui';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Settings } from 'lucide-react';
import { Suspense } from 'react';

interface Integration {
  id: string;
  name: string;
  status: 'Connected' | 'Disconnected';
  lastSync: string;
}

async function IntegrationsList() {
  let integrations: Integration[] = [];
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.COMMUNICATIONS?.ROOT || '/api/integrations');
    integrations = Array.isArray(response) ? response : [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load integrations';
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

  const defaultIntegrations = [
    { id: '1', name: 'Google Drive', status: 'Connected' as const, lastSync: '2024-01-15' },
    { id: '2', name: 'Slack', status: 'Disconnected' as const, lastSync: '-' },
    { id: '3', name: 'Microsoft 365', status: 'Connected' as const, lastSync: '2024-01-14' },
  ];

  const displayIntegrations = integrations.length > 0 ? integrations : defaultIntegrations;

  return (
    <div className="space-y-4">
      {displayIntegrations.map((integration) => (
        <Card key={integration.id}>
          <CardBody className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                {integration.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Last sync: {integration.lastSync}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={integration.status === 'Connected' ? 'success' : 'default'}>
                {integration.status}
              </Badge>
              <Button size="sm" variant="outline" icon={<Settings className="h-4 w-4" />}>
                Configure
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect external services and tools"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Integrations' }]}
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardBody>
                  <SkeletonLine lines={2} className="h-12" />
                </CardBody>
              </Card>
            ))}
          </div>
        }
      >
        <IntegrationsList />
      </Suspense>
    </>
  );
}
