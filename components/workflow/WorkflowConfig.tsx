
import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { ToggleLeft, ToggleRight, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';

export const WorkflowConfig: React.FC = () => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
      const load = async () => {
          const data = await DataService.workflow.getSettings();
          setSettings(data);
      };
      load();
  }, []);

  return (
    <Card title="Workflow Automation Settings">
      <div className="space-y-4">
        {settings.map((setting, i) => (
          <div key={i} className={cn("flex items-center justify-between p-3 border-b last:border-0", theme.border.default)}>
            <span className={cn("text-sm font-medium", theme.text.primary)}>{setting.label}</span>
            <button className={cn("text-2xl", setting.enabled ? theme.primary.text : theme.text.tertiary)}>
              {setting.enabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
            </button>
          </div>
        ))}
        
        <div className={cn("pt-4 mt-4 border-t", theme.border.default)}>
            <button className={cn("flex items-center text-sm font-medium", theme.text.secondary, `hover:${theme.primary.text}`)}>
                <Settings className="h-4 w-4 mr-2" /> Advanced Configuration
            </button>
        </div>
      </div>
    </Card>
  );
};
