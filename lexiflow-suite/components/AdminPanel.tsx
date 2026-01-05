
import React, { useState, useTransition, useCallback } from 'react';
import { Activity, Shield, Link, Database, Network, Palette, Settings, ToggleRight, List } from 'lucide-react';
import { AdminAuditLog } from './admin/AdminAuditLog.tsx';
import { AdminHierarchy } from './admin/AdminHierarchy.tsx';
import { AdminDatabaseControl } from './admin/AdminDatabaseControl.tsx';
import { ThemeTokensViewer } from './admin/ThemeTokensViewer.tsx';
import { SecuritySettings } from './admin/SecuritySettings.tsx';
import { IntegrationsHub } from './admin/IntegrationsHub.tsx';
import { FeatureFlags } from './admin/FeatureFlags.tsx';
import { AdminPlatformManager } from './admin/AdminPlatformManager.tsx';
import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { useData } from '../hooks/useData.ts';
import { Button } from './common/Button.tsx';

export const AdminPanel: React.FC = () => {
  const auditLogs = useData(s => s.auditLogs);
  const [activeTab, setActiveTab] = useState('hierarchy');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = useCallback((tab: string) => {
      startTransition(() => {
          setActiveTab(tab);
      });
  }, []);

  const tabs = [
    { id: 'hierarchy', label: 'Hierarchy', icon: Network },
    { id: 'db', label: 'Database', icon: Database },
    { id: 'data', label: 'Data Manager', icon: List },
    { id: 'theme', label: 'Theme Tokens', icon: Palette },
    { id: 'features', label: 'Feature Flags', icon: ToggleRight },
    { id: 'logs', label: 'Audit Logs', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Connectors', icon: Link }
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in bg-slate-50">
      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title="Admin & Security" 
            subtitle="Global configuration, enterprise security audits, and centralized design tokens."
            actions={
                <Button variant="secondary" icon={Settings} onClick={() => alert("Global Configuration Modal: Settings for system-wide variables would appear here.")}>Global Settings</Button>
            }
        />
        <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
        />
      </div>
      
      <div className={`flex-1 min-h-0 overflow-y-auto p-6 pt-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="max-w-[1920px] mx-auto h-full flex flex-col">
            {activeTab === 'hierarchy' && <div className="h-full"><AdminHierarchy /></div>}
            {activeTab === 'db' && <div className="h-full"><AdminDatabaseControl /></div>}
            {activeTab === 'data' && <div className="h-full"><AdminPlatformManager /></div>}
            {activeTab === 'theme' && <div className="h-full"><ThemeTokensViewer /></div>}
            {activeTab === 'features' && <div className="h-full"><FeatureFlags /></div>}
            {activeTab === 'logs' && <div className="h-full"><AdminAuditLog logs={auditLogs} /></div>}
            {activeTab === 'security' && <div className="h-full"><SecuritySettings /></div>}
            {activeTab === 'integrations' && <div className="h-full"><IntegrationsHub /></div>}
        </div>
      </div>
    </div>
  );
};
