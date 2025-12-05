
import React, { useMemo, useCallback, useEffect } from 'react';
import { PageHeader } from './common/PageHeader';
import { HRManager } from './practice/HRManager';
import { FinancialCenter } from './practice/FinancialCenter';
import { MarketingDashboard } from './practice/MarketingDashboard';
import { AssetManager } from './practice/AssetManager';
import { Users, TrendingUp, Building2, Briefcase, Laptop, Wallet } from 'lucide-react';
import { Button } from './common/Button';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { useSessionStorage } from '../hooks/useSessionStorage';

type OperationView = 'hr' | 'assets' | 'finance' | 'marketing';

interface FirmOperationsProps {
    initialTab?: OperationView;
}

const PARENT_TABS = [
  {
    id: 'admin', label: 'Administration', icon: Building2,
    subTabs: [
      { id: 'hr', label: 'HR & Staffing', icon: Users },
      { id: 'assets', label: 'IT & Assets', icon: Laptop },
    ]
  },
  {
    id: 'performance', label: 'Firm Performance', icon: TrendingUp,
    subTabs: [
      { id: 'finance', label: 'Banking & Ledger', icon: Wallet },
      { id: 'marketing', label: 'Marketing & ROI', icon: TrendingUp },
    ]
  }
];

export const FirmOperations: React.FC<FirmOperationsProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useSessionStorage<OperationView>('ops_active_tab', 'hr');

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab, setActiveTab]);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as OperationView);
    }
  }, [setActiveTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'hr': return <HRManager />;
      case 'assets': return <AssetManager />;
      case 'finance': return <FinancialCenter />;
      case 'marketing': return <MarketingDashboard />;
      default: return <HRManager />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Firm Operations" 
          subtitle="Centralized management for staff, assets, financials, and growth."
          actions={
            <div className="flex gap-2">
              <Button variant="outline">Firm Settings</Button>
              <Button variant="primary">Generate P&L Report</Button>
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
        {activeParentTab.subTabs.length > 0 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surfaceHighlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as OperationView)} 
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

      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};
