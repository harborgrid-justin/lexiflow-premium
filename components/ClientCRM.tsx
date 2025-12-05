
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Client } from '../types';
import { 
  UserPlus, LayoutDashboard, List, GitPullRequest, 
  BarChart3, Users, TrendingUp 
} from 'lucide-react';
import { ClientIntakeModal } from './ClientIntakeModal';
import { ClientPortalModal } from './ClientPortalModal';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { DataService } from '../services/dataService';

// Sub-components
import { CRMDashboard } from './crm/CRMDashboard';
import { ClientDirectory } from './crm/ClientDirectory';
import { CRMPipeline } from './crm/CRMPipeline';
import { ClientAnalytics } from './crm/ClientAnalytics';

type CRMView = 'dashboard' | 'directory' | 'pipeline' | 'analytics';

interface ClientCRMProps {
    initialTab?: CRMView;
}

const PARENT_TABS = [
  {
    id: 'relationships', label: 'Relationships', icon: Users,
    subTabs: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'directory', label: 'Client Directory', icon: List },
    ]
  },
  {
    id: 'growth', label: 'Growth', icon: TrendingUp,
    subTabs: [
      { id: 'pipeline', label: 'Intake Pipeline', icon: GitPullRequest },
    ]
  },
  {
    id: 'insights', label: 'Insights', icon: BarChart3,
    subTabs: [
      { id: 'analytics', label: 'Revenue Analytics', icon: BarChart3 },
    ]
  }
];

export const ClientCRM: React.FC<ClientCRMProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<CRMView>('dashboard');
  const [showIntake, setShowIntake] = useState(false);
  const [selectedClientPortal, setSelectedClientPortal] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const loadClients = async () => {
      const data = await DataService.clients.getAll();
      setClients(data);
  };

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as CRMView);
    }
  }, []);

  const handleAddClient = async (clientName: string) => {
      const newClient: Client = {
          id: `cli-${Date.now()}`,
          name: clientName,
          industry: 'General',
          status: 'Prospect',
          totalBilled: 0,
          matters: []
      };
      await DataService.clients.add(newClient);
      loadClients();
      setShowIntake(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <CRMDashboard />;
      case 'directory': return <ClientDirectory clients={clients} onOpenPortal={setSelectedClientPortal} />;
      case 'pipeline': return <CRMPipeline />;
      case 'analytics': return <ClientAnalytics />;
      default: return <CRMDashboard />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      {showIntake && <ClientIntakeModal onClose={() => setShowIntake(false)} onSave={handleAddClient}/>}
      
      {selectedClientPortal && (
        <ClientPortalModal client={selectedClientPortal} onClose={() => setSelectedClientPortal(null)} />
      )}

      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Client Relationships" 
          subtitle="CRM, Intake Pipeline, and Secure Client Portals."
          actions={
            <Button variant="primary" icon={UserPlus} onClick={() => setShowIntake(true)}>New Intake</Button>
          }
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
                        onClick={() => setActiveTab(tab.id as CRMView)} 
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

export default ClientCRM;
