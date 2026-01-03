import { Input } from '@/components/ui/atoms/Input';
import { Card } from '@/components/ui/molecules/Card';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';
import { Shield } from 'lucide-react';
import React from 'react';
import { CardSectionProps } from './types';

const CLASSIFICATIONS = ['Public', 'Internal', 'Confidential', 'Restricted'] as const;

export const GovernanceCard: React.FC<CardSectionProps> = ({ formData, setFormData }) => {
  const { theme } = useTheme();

  return (
    <Card title="Governance & Security">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={cn('block text-xs font-bold uppercase mb-1.5', theme.text.secondary)}>Data Classification</label>
          <div className="space-y-2">
            {CLASSIFICATIONS.map((cls) => (
              <div
                key={cls}
                onClick={() => setFormData({ ...formData, classification: cls })}
                className={cn(
                  'flex items-center p-2 rounded border cursor-pointer transition-colors',
                  formData.classification === cls
                    ? cn(theme.primary.light, theme.primary.border, 'border-l-4 border-l-blue-600')
                    : cn(theme.surface.default, theme.border.default)
                )}
              >
                <Shield className={cn('h-4 w-4 mr-2', formData.classification === cls ? 'text-blue-600' : theme.text.tertiary)} />
                <span className="text-sm font-medium">{cls}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className={cn('p-4 rounded-lg border', theme.status.error.bg, theme.status.error.border)}>
            <div className="flex items-center justify-between mb-2">
              <span className={cn('text-sm font-bold', theme.status.error.text)}>PII Flag</span>
              <input
                type="checkbox"
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                checked={formData.isPII}
                onChange={(e) => setFormData({ ...formData, isPII: e.target.checked })}
              />
            </div>
            <p className={cn('text-xs', theme.status.error.text)}>Checking this enforces column-level encryption and strict access logging.</p>
          </div>
          <Input
            label="Data Steward / Owner"
            value={formData.owner}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, owner: e.target.value })}
          />
        </div>
      </div>
    </Card>
  );
};
