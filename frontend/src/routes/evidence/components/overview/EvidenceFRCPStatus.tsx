/**
 * @module EvidenceFRCPStatus
 * @category Evidence
 * @description Displays the FRCP 26(a) disclosure status of an evidence item.
 */

import { CheckCircle } from 'lucide-react';

// Common Components
import { Card } from '@/shared/ui/molecules/Card';

// Context & Utils
import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';

export const EvidenceFRCPStatus: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Card title="FRCP 26(a) Status">
      <div className="flex items-center mb-4">
        <CheckCircle className={cn("h-5 w-5 mr-2", theme.status.success.text)}/>
        <span className={cn("text-sm font-medium", theme.text.primary)}>Disclosed to Opposing Counsel</span>
      </div>
      <div className={cn("text-xs p-3 rounded border", theme.surface.highlight, theme.text.secondary, theme.border.default)}>
        Included in Initial Disclosures Packet v2 sent on 2024-02-01. Bates Range: 00145-00152.
      </div>
    </Card>
  );
};
