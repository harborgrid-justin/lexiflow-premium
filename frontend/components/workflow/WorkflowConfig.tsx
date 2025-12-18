
import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { ToggleLeft, ToggleRight, Settings, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/data/dataService'';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';
import { queryKeys } from '../../utils/queryKeys';
import { useNotify } from '../../hooks/useNotify';

export const WorkflowConfig: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  
  // Load settings from IndexedDB via useQuery for accurate, cached data
  const { data: settings = [], isLoading: loading } = useQuery(
    queryKeys.workflowsExtended.settings(),
    () => DataService.workflow.getSettings()
  );

  const { mutate: updateSettings } = useMutation(
    async (newSettings: any[]) => DataService.workflow.updateSettings(newSettings),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidate(queryKeys.workflowsExtended.settings());
        const changedSetting = variables.find((s, i) => s.enabled !== settings[i]?.enabled);
        if (changedSetting) notify.success(`Updated ${changedSetting.label}`);
      },
      onError: () => notify.error("Failed to save settings")
    }
  );

  const toggleSetting = (index: number) => {
      const newSettings = [...settings];
      newSettings[index].enabled = !newSettings[index].enabled;
      updateSettings(newSettings);
  };

  if (loading) {
      return (
          <Card title="Workflow Automation Settings">
              <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
          </Card>
      );
  }

  return (
    <Card title="Workflow Automation Settings">
      <div className="space-y-4">
        {settings.map((setting, i) => (
          <div key={i} className={cn("flex items-center justify-between p-3 border-b last:border-0", theme.border.default)}>
            <span className={cn("text-sm font-medium", theme.text.primary)}>{setting.label}</span>
            <button 
                onClick={() => toggleSetting(i)}
                className={cn("text-2xl transition-colors", setting.enabled ? theme.primary.text : theme.text.tertiary)}
            >
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

