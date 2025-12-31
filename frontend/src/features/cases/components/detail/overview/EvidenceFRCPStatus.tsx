/**
 * EvidenceFRCPStatus.tsx
 * 
 * FRCP 26(a) initial disclosure compliance status indicator.
 * 
 * @module components/case-detail/overview/EvidenceFRCPStatus
 * @category Case Management - Evidence
 */

// External Dependencies
import React from 'react';
import { CheckCircle } from 'lucide-react';

// Internal Dependencies - Components
import { Card } from '@/components/ui/molecules/Card';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

export const EvidenceFRCPStatus: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Card title="FRCP 26(a) Status">
      <div className="flex items-center mb-4">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2"/>
        <span className={cn("text-sm font-medium", theme.text.primary)}>Disclosed to Opposing Counsel</span>
      </div>
      <div className={cn("text-xs p-3 rounded border", theme.surface.highlight, theme.text.secondary, theme.border.default)}>
        Included in Initial Disclosures Packet v2 sent on 2024-02-01. Bates Range: 00145-00152.
      </div>
    </Card>
  );
};
