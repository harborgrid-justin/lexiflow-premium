/**
 * @module components/enterprise/CRM/ClientAnalytics/LTVTab
 */

import { Card } from '@/components/ui/molecules/Card/Card';
import React from 'react';
import { LTVCard } from './LTVCard';
import type { ClientLifetimeValue } from './types';

interface LTVTabProps {
  ltvData: ClientLifetimeValue[];
  theme: any;
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
