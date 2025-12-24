
/**
 * @module EvidenceLocation
 * @category Evidence
 * @description Displays the physical or digital location of an evidence item.
 * Includes functionality to request a transfer.
 */

import React from 'react';
import { MapPin } from 'lucide-react';

// Common Components
import { Card } from '../../../common/Card';
import { Button } from '../../../common/Button';

// Context & Utils
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '@/utils/cn';

interface EvidenceLocationProps {
  location: string;
}

export const EvidenceLocation: React.FC<EvidenceLocationProps> = ({ location }) => {
  const { theme } = useTheme();

  return (
    <Card title="Current Location">
      <div className="flex flex-col items-center text-center p-4">
        <div className={cn("h-16 w-16 rounded-full flex items-center justify-center mb-4", theme.primary.light)}>
          <MapPin className={cn("h-8 w-8", theme.primary.text)}/>
        </div>
        <h3 className={cn("font-bold", theme.text.primary)}>{location}</h3>
        <p className={cn("text-xs mt-1", theme.text.secondary)}>Last Verified: Today, 09:00 AM</p>
      </div>
      <div className={cn("border-t pt-4 mt-4", theme.border.subtle)}>
        <Button variant="outline" size="sm" className="w-full">Request Transfer</Button>
      </div>
    </Card>
  );
};
