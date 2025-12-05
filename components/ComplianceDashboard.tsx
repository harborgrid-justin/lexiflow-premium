
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ConflictCheck, EthicalWall } from '../types';
import { DataService } from '../services/dataService';
import { PageHeader } from './common/PageHeader';
import { LayoutDashboard, ShieldAlert, Lock, ScrollText, Download } from 'lucide-react';
import { Button } from './common/Button';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

// Sub-components
import { ComplianceOverview } from './compliance/ComplianceOverview';
import { ComplianceConflicts } from './compliance/ComplianceConflicts';
import { ComplianceWalls } from './compliance/ComplianceWalls';
import { CompliancePolicies } from './compliance/CompliancePolicies';

type ComplianceView = 'overview' | 'conflicts' | 'walls' | 'policies';

interface ComplianceDashboardProps {
    initialTab?: ComplianceView;
}

const PARENT_TABS = [
  {
    id: 'risk_center', label: 'Risk Center', icon: ShieldAlert,
    subTabs: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'policies', label: 'Regulatory Policies', icon: ScrollText },
    ]
  },
  {
    id: 'clearance', label: 'Clearance', icon: ShieldAlert,
    subTabs: [
      { id: 'conflicts', label: 'Conflict Checks', icon: ShieldAlert },
    ]
  },
  {
    id: 'barriers', label: 'Information Barriers', icon: Lock,
    subTabs: [
      { id: 'walls', label: 'Ethical Walls', icon: Lock },
    ]
  }
];

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ComplianceView>('overview');
  const [conflicts, setConflicts] = useState<ConflictCheck[]>([]);
  const [walls, setWalls] = useState<EthicalWall[]>([]);

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const loadComplianceData = async () => {
      const [fetchedConflicts, fetchedWalls] = await Promise.all([
        DataService.compliance.getConflicts(),
        DataService.compliance.getEthicalWalls()
      ]);
      setConflicts(fetchedConflicts);
      setWalls(fetchedWalls);
    };
    loadComplianceData();
  }, []);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as ComplianceView);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <ComplianceOverview />;
      case 'conflicts': return <ComplianceConflicts conflicts={conflicts} />;
      case 'walls': return <ComplianceWalls walls={walls} />;
      case 'policies': return <CompliancePolicies />;
      default: return <ComplianceOverview />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Risk & Compliance Center" 
          subtitle="Conflicts, Ethical Walls, and Regulatory Monitoring."
          actions={
            <div className="flex gap-2">
                <Button variant="secondary" icon={Download}>Audit Report</Button>
            </div>
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
                        onClick={() => setActiveTab(tab.id as ComplianceView)} 
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

export default ComplianceDashboard;
