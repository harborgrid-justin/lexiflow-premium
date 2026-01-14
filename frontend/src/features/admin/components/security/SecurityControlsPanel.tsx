import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { Clock, Globe, Lock, Smartphone } from 'lucide-react';
import type { SecurityControl } from './types';

interface SecurityControlsPanelProps {
  controls: SecurityControl[];
  onToggle: (id: string) => void;
}

const iconMap = {
  Smartphone,
  Lock,
  Globe,
  Clock
};

export function SecurityControlsPanel({ controls, onToggle }: SecurityControlsPanelProps) {
  const { theme } = useTheme();

  return (
    <Card title="Security Controls">
      <div className="grid grid-cols-2 gap-4">
        {controls.map(control => {
          const Icon = iconMap[control.type];
          return (
            <div
              key={control.id}
              className={cn(
                "p-4 rounded-lg border transition-all",
                theme.border.default,
                control.enabled ? theme.surface.highlight : theme.surface.default
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <span className={cn("font-medium text-sm", theme.text.primary)}>
                    {control.label}
                  </span>
                </div>
                <button
                  onClick={() => onToggle(control.id)}
                  aria-label={`Toggle ${control.label}`}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    control.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      control.enabled ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
              <p className={cn("text-xs", theme.text.secondary)}>{control.description}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
