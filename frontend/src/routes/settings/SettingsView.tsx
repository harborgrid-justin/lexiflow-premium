/**
 * Settings Domain - View Component
 */

import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { Bell, Link, Settings as SettingsIcon, Shield } from 'lucide-react';
import React from 'react';
import { useSettings } from './SettingsProvider';

export function SettingsView() {
  const { activeTab, setActiveTab, getSettingsByCategory } = useSettings();

  const currentSettings = getSettingsByCategory(activeTab);

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Settings"
        subtitle="System configuration and preferences"
      />

      <div className="flex gap-2 px-4 pb-4">
        <TabButton
          active={activeTab === 'general'}
          onClick={() => setActiveTab('general')}
          icon={<SettingsIcon className="w-4 h-4" />}
        >
          General
        </TabButton>
        <TabButton
          active={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
          icon={<Shield className="w-4 h-4" />}
        >
          Security
        </TabButton>
        <TabButton
          active={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
          icon={<Bell className="w-4 h-4" />}
        >
          Notifications
        </TabButton>
        <TabButton
          active={activeTab === 'integrations'}
          onClick={() => setActiveTab('integrations')}
          icon={<Link className="w-4 h-4" />}
        >
          Integrations
        </TabButton>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
          {currentSettings.map(setting => (
            <SettingRow key={setting.id} setting={setting} />
          ))}
          {currentSettings.length === 0 && (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
              No settings in this category
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {icon}
      {children}
    </button>
  );
}

type SystemSetting = {
  id: string;
  key: string;
  value: string;
  category: 'general' | 'security' | 'notifications' | 'integrations';
  description: string;
};

function SettingRow({ setting }: { setting: SystemSetting }) {
  return (
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-slate-900 dark:text-white mb-1">
            {setting.key}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {setting.description}
          </div>
        </div>
        <div className="ml-4">
          <input
            type="text"
            value={setting.value}
            className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
