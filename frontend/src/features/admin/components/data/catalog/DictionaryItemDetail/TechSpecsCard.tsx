import { Badge } from '@/components/ui/atoms/Badge';
import { Card } from '@/components/ui/molecules/Card';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import { DataDictionaryItem } from '@/types';
import React from 'react';

interface TechSpecsCardProps {
  formData: DataDictionaryItem;
}

export const TechSpecsCard: React.FC<TechSpecsCardProps> = ({ formData }) => {
  const { theme } = useTheme();

  return (
    <Card title="Tech Specs">
      <div className="space-y-3 text-sm">
        <div className={cn('flex justify-between border-b pb-2', theme.border.default)}>
          <span className={theme.text.secondary}>Source System</span>
          <span className="font-medium">{formData.sourceSystem}</span>
        </div>
        <div className={cn('flex justify-between border-b pb-2', theme.border.default)}>
          <span className={theme.text.secondary}>Last Updated</span>
          <span className="font-mono text-xs">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={theme.text.secondary}>Quality Score</span>
          <Badge variant="success">{formData.dataQualityScore}/100</Badge>
        </div>
        <div className={cn('w-full rounded-full h-1.5 mt-2', theme.surface.highlight)}>
          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${formData.dataQualityScore}%` }} />
        </div>
      </div>
    </Card>
  );
};
