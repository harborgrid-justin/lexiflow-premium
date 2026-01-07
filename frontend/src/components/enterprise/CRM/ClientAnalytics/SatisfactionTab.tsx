/**
 * @module components/enterprise/CRM/ClientAnalytics/SatisfactionTab
 */

import { Card } from '@/components/ui/molecules/Card/Card';
import { SatisfactionCard } from './SatisfactionCard';
import type { ClientSatisfaction } from './types';

interface SatisfactionTabProps {
  satisfactionData: ClientSatisfaction[];
  theme: any;
  chartColors: string[];
  chartTheme: any;
}

export function SatisfactionTab({ satisfactionData, theme, chartColors, chartTheme }: SatisfactionTabProps) {
  return (
    <div className="space-y-6">
      <Card title="Client Satisfaction Metrics">
        <div className="space-y-4">
          {satisfactionData.map(client => (
            <SatisfactionCard
              key={client.clientId}
              client={client}
              theme={theme}
              chartColors={chartColors}
              chartTheme={chartTheme}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
