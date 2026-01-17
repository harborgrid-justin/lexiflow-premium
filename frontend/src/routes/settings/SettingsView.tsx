/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Settings Domain - View Component
 */

import { Bell, Link, Settings as SettingsIcon, Shield } from 'lucide-react';
import React from 'react';

import { PageHeader } from '@/components/organisms/PageHeader';

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
        <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border divide-y">
          {currentSettings.map(setting => (
            <SettingRow key={setting.id} setting={setting} />
          ))}
          {currentSettings.length === 0 && (
            <div style={{ color: 'var(--color-textMuted)' }} className="p-8 text-center">
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
    <div style={{ backgroundColor: 'transparent' }} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div style={{ color: 'var(--color-text)' }} className="font-medium mb-1">
            {setting.key}
          </div>
          <div style={{ color: 'var(--color-textMuted)' }} className="text-sm">
            {setting.description}
          </div>
        </div>
        <div className="ml-4">
          <input
            type="text"
            value={setting.value}
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            className="px-3 py-1.5 rounded border text-sm"
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
