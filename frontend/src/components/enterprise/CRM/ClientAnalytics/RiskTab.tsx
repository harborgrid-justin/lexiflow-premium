/**
 * @module components/enterprise/CRM/ClientAnalytics/RiskTab
 */

import { Card } from '@/components/ui/molecules/Card/Card';
import { RiskCard } from './RiskCard';
import type { ClientRiskAssessment } from './types';

interface RiskTabProps {
  riskData: ClientRiskAssessment[];
  theme: any;
}

export function RiskTab({ riskData, theme }: RiskTabProps) {
  return (
    <div className="space-y-6">
      <Card title="Client Risk Assessment">
        <div className="space-y-4">
          {riskData.map(client => (
            <RiskCard key={client.clientId} client={client} theme={theme} />
          ))}
        </div>
      </Card>
    </div>
  );
}
