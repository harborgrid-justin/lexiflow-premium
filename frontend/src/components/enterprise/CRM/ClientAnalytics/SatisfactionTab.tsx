/**
 * @module components/enterprise/CRM/ClientAnalytics/SatisfactionTab
 */

import { Card } from '@/shared/ui/molecules/Card/Card';
import type { ThemeObject } from '@/contexts/theme/ThemeContext';
import { SatisfactionCard } from './SatisfactionCard';
import type { ClientSatisfaction } from './types';

interface ChartTheme {
  grid: string;
  text: string;
  tooltipStyle: Record<string, unknown>;
  [key: string]: string | number | Record<string, unknown>;
}

interface SatisfactionTabProps {
  satisfactionData: ClientSatisfaction[];
  theme: ThemeObject;
  chartColors: string[];
  chartTheme: ChartTheme;
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
