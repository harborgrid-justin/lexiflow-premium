/**
 * @module components/enterprise/CRM/ClientAnalytics/RiskTab
 */

import { Card } from '@/shared/ui/molecules/Card/Card';
import type { ThemeObject } from '@/features/theme';
import { RiskCard } from './RiskCard';
import type { ClientRiskAssessment } from './types';

interface RiskTabProps {
  riskData: ClientRiskAssessment[];
  theme: ThemeObject;
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
