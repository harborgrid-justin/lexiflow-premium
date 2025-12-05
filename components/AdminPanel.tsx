
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Network, Shield, Link, Database, Activity, Lock, Server } from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { DataService } from '../services/dataService';
import { AuditLogEntry } from '../types';

// Sub-components
import { AdminHierarchy } from './admin/AdminHierarchy';
import { AdminSecurity } from './admin/AdminSecurity';
import { AdminDatabaseControl } from './admin/AdminDatabaseControl';
import { AdminIntegrations } from './admin/AdminIntegrations';
import { AdminAuditLog } from './admin/AdminAuditLog';
import { AdminPlatformManager } from './admin/AdminPlatformManager';

type AdminView = 'hierarchy' | 'security' | 'db' | 'data' | 'logs' | 'integrations';

interface AdminPanelProps {
    initialTab?: AdminView;
}

const PARENT_TABS = [
  {
    id: 'org',
    label: 'Organization',
    icon: Network,
    subTabs: [
      { id: 'hierarchy', label: 'Hierarchy & Access', icon: Network },
      { id: 'security', label: 'Security Policies', icon: Lock },
    ]
  },
  {
    id: 'data_mgmt',
    label: 'Data Management',
    icon: Database,
    subTabs: [
      { id: 'db', label: 'Database Control', icon: Server },
      { id: 'data', label: 'Platform Data', icon: Database },
    ]
  },
  {
    id: 'system',
    label: 'System Health',
    icon: Activity,
    subTabs: [
      { id: 'logs', label: 'Audit Logs', icon: Shield },
      { id: 'integrations', label: 'Integrations', icon: Link },
    ]
  }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminView>('hierarchy');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const loadLogs = async () => {
      const logs = await DataService.admin.getLogs();
      setAuditLogs(logs);
    };
    loadLogs();
  }, []);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as AdminView);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'hierarchy': return <AdminHierarchy />;
      case 'security': return <AdminSecurity />;
      case 'db': return <div className="p-6 h-full overflow-y-auto"><AdminDatabaseControl /></div>;
      case 'data': return <AdminPlatformManager />;
      case 'logs': return <AdminAuditLog logs={auditLogs} />;
      case 'integrations': return <AdminIntegrations />;
      default: return <AdminHierarchy />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Admin Console" 
          subtitle="System settings, security audits, and data management."
        />
        
        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                        activeParentTab.id === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs.length > 1 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surfaceHighlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as AdminView)} 
                        className={cn(
                            "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                            activeTab === tab.id 
                                ? cn(theme.surface, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                                : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface}`)
                        )}
                    >
                        <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                        {tab.label}
                    </button>
                ))}
            </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};
