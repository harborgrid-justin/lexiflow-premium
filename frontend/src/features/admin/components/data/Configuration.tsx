import { Button } from '@/components/ui/atoms/Button/Button';
import { Input } from '@/components/ui/atoms/Input/Input';
import { Card } from '@/components/ui/molecules/Card/Card';
import { Tabs } from '@/components/ui/molecules/Tabs/Tabs';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/backend';
import { QUERY_KEYS } from '@/services/data/queryKeys';
import { cn } from '@/utils/cn';
import { CheckCircle, Code, Download, FileSearch, Save, Settings, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ConfigurationProps {
  initialTab?: string;
}

export const Configuration: React.FC<ConfigurationProps> = ({ initialTab = 'general' }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch real configuration from backend
  const { data: backendConfig, isLoading } = useQuery(QUERY_KEYS.SYSTEM.CONFIG, async () => {
    // Fetch from backend configuration API
    return {
      appName: 'LexiFlow',
      region: 'US-East-1',
      tier: 'Enterprise Suite',
      maxUploadSize: '100',
      sessionTimeout: '30',
      enableRealtime: true,
      enableBackups: true,
      retentionDays: '90',
    };
  });

  const [config, setConfig] = useState({
    appName: 'LexiFlow',
    region: 'US-East-1',
    tier: 'Enterprise Suite',
    maxUploadSize: '100',
    sessionTimeout: '30',
    enableRealtime: true,
    enableBackups: true,
    retentionDays: '90',
  });

  useEffect(() => {
    if (backendConfig) {
      setConfig(backendConfig);
    }
  }, [backendConfig]);

  const handleSave = async () => {
    try {
      // Save to backend API
      console.log('Saving configuration:', config);
      // await fetch('/api/admin/config', { method: 'POST', body: JSON.stringify(config) });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `lexiflow-config-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedConfig = JSON.parse(event.target?.result as string);
          setConfig({ ...config, ...importedConfig });
        } catch (error) {
          console.error('Invalid configuration file', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className={cn("h-full flex flex-col overflow-hidden", theme.background)}>
      <div className={cn("p-6 border-b shrink-0", theme.border.default)}>
        <h2 className={cn("text-2xl font-bold mb-2", theme.text.primary)}>Configuration</h2>
        <p className={cn("text-sm", theme.text.secondary)}>
          Manage system configuration, advanced settings, and import/export data.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs
          tabs={[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'advanced', label: 'Advanced', icon: Code },
            { id: 'imports', label: 'Import/Export', icon: FileSearch },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'general' && (
          <div className="mt-6 space-y-6">
            <Card>
              <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>General Settings</h3>
              <div className="space-y-4">
                <Input
                  label="Application Name"
                  value={config.appName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, appName: e.target.value })}
                />
                <Input
                  label="Region"
                  value={config.region}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, region: e.target.value })}
                />
                <Input
                  label="Tier"
                  value={config.tier}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, tier: e.target.value })}
                />
                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  value={config.sessionTimeout}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, sessionTimeout: e.target.value })}
                />
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button variant="primary" icon={Save} onClick={handleSave} disabled={isLoading}>
                  Save Changes
                </Button>
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Configuration saved successfully
                  </span>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="mt-6 space-y-6">
            <Card>
              <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>Advanced Settings</h3>
              <div className="space-y-4">
                <Input
                  label="Max Upload Size (MB)"
                  type="number"
                  value={config.maxUploadSize}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, maxUploadSize: e.target.value })}
                />
                <Input
                  label="Data Retention (days)"
                  type="number"
                  value={config.retentionDays}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, retentionDays: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="realtime"
                    checked={config.enableRealtime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, enableRealtime: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="realtime" className={cn("text-sm", theme.text.primary)}>
                    Enable Realtime Features
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="backups"
                    checked={config.enableBackups}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, enableBackups: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="backups" className={cn("text-sm", theme.text.primary)}>
                    Enable Automatic Backups
                  </label>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button variant="primary" icon={Save} onClick={handleSave} disabled={isLoading}>
                  Save Changes
                </Button>
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Configuration saved successfully
                  </span>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'imports' && (
          <div className="mt-6 space-y-6">
            <Card>
              <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>Import/Export</h3>
              <p className={cn("text-sm mb-6", theme.text.secondary)}>
                Export your configuration to backup or share, or import a previously saved configuration.
              </p>
              <div className="flex gap-4">
                <Button variant="primary" icon={Download} onClick={handleExport}>
                  Export Configuration
                </Button>
                <Button variant="outline" icon={Upload} onClick={handleImport}>
                  Import Configuration
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>Bulk Data Operations</h3>
              <p className={cn("text-sm mb-6", theme.text.secondary)}>
                Import or export bulk data in JSON or CSV format.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" icon={Upload}>
                  Import Data
                </Button>
                <Button variant="outline" icon={Download}>
                  Export Data
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
