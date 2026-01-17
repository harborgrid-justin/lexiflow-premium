/**
 * @module components/enterprise/CRM/ClientAnalytics/LTVTab
 */

import { Card } from '@/components/molecules/Card/Card';

import { LTVCard } from './LTVCard';

import type { ClientLifetimeValue } from './types';
import type { ThemeObject } from '@/lib/theme/types';

interface LTVTabProps {
  ltvData: ClientLifetimeValue[];
  theme: ThemeObject;
}

export function LTVTab({ ltvData, theme }: LTVTabProps) {
  return (
    <div className="space-y-6">
      <Card title="Client Lifetime Value Analysis">
        <div className="space-y-4">
          {ltvData.map(client => (
            <LTVCard key={client.clientId} client={client} theme={theme} />
          ))}
        </div>
      </Card>
    </div>
  );
}
