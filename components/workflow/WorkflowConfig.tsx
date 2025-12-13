
import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { ToggleLeft, ToggleRight, Settings, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useNotify } from '../../hooks/useNotify';

export const WorkflowConfig: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const load = async () => {
          try {
            const data = await DataService.workflow.getSettings();
            setSettings(data);
          } catch (error) {
            console.error("Failed to load settings", error);
          } finally {
            setLoading(false);
          }
      };
      load();
  }, []);

  const toggleSetting = async (index: number) => {
      const newSettings = [...settings];
      newSettings[index].enabled = !newSettings[index].enabled;
      setSettings(newSettings);
      
      try {
          await DataService.workflow.updateSettings(newSettings);
          notify.success(`Updated ${newSettings[index].label}`);
      } catch (error) {
          notify.error("Failed to save settings");
          // Revert on error
          const reverted = [...settings];
          reverted[index].enabled = !reverted[index].enabled;
          setSettings(reverted);
      }
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
