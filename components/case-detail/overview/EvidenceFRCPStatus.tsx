
import React from 'react';
import { Card } from '../../common/Card';
import { CheckCircle } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Case } from '../../../types';

export const EvidenceFRCPStatus: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Card title="FRCP 26(a) Status">
      <div className="flex items-center mb-4">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2"/>
        <span className={cn("text-sm font-medium", theme.text.primary)}>Disclosed to Opposing Counsel</span>
      </div>
      <div className={cn("text-xs p-3 rounded border", theme.surfaceHighlight, theme.text.secondary, theme.border.default)}>
        Included in Initial Disclosures Packet v2 sent on 2024-02-01. Bates Range: 00145-00152.
      </div>
    </Card>
  );
};
