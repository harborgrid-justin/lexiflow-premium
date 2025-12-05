
import React, { useMemo, useCallback, useEffect } from 'react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { LayoutDashboard, CheckSquare, Bell, Download, PieChart, Activity, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { useSessionStorage } from '../hooks/useSessionStorage';

// Sub-components
import { DashboardOverview } from './dashboard/DashboardOverview';
import { FinancialPerformance } from './dashboard/FinancialPerformance';
import { PersonalWorkspace } from './dashboard/PersonalWorkspace';

interface DashboardProps {
  onSelectCase: (caseId: string) => void;
  initialTab?: DashboardView;
}

type DashboardView = 'overview' | 'financials' | 'tasks' | 'notifications';

const PARENT_TABS = [
  {
    id: 'executive', label: 'Executive', icon: LayoutDashboard,
    subTabs: [
      { id: 'overview', label: 'Firm Overview', icon: Activity },
      { id: 'financials', label: 'Performance', icon: PieChart },
    ]
  },
  {
    id: 'personal', label: 'My Workspace', icon: CheckSquare,
    subTabs: [
      { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ]
  }
];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectCase, initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useSessionStorage<DashboardView>('dashboard_active_tab', 'overview');

  // Holographic Routing
  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab, setActiveTab]);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as DashboardView);
    }
  }, [setActiveTab]);

  const renderContent = () => {
    switch (activeTab) {
        case 'overview': return <DashboardOverview onSelectCase={onSelectCase} />;
        case 'financials': return <FinancialPerformance />;
        case 'tasks': return <PersonalWorkspace activeTab="tasks" />;
        case 'notifications': return <PersonalWorkspace activeTab="notifications" />;
        default: return <DashboardOverview onSelectCase={onSelectCase} />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
            <div>
                <h2 className={cn("text-2xl font-bold tracking-tight leading-tight", theme.text.primary)}>Executive Dashboard</h2>
                <p className={cn("mt-1 text-sm", theme.text.secondary)}>Real-time firm intelligence and personal productivity center.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                    <span className={cn("flex items-center text-[10px] font-bold px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200")}>
                        <ShieldCheck className="h-3 w-3 mr-1"/> SYSTEM OPERATIONAL
                    </span>
                    <span className={cn("text-xs hidden sm:inline", theme.text.tertiary)}>Updated: Just now</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={Download}>Export Report</Button>
                </div>
            </div>
        </div>

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

        {/* Sub-Navigation (Pills) - Touch Scroll Enabled */}
        <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 touch-pan-x", theme.surfaceHighlight, theme.border.default)}>
            {activeParentTab.subTabs.map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id as DashboardView)} 
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
      </div>

      {/* Content Area - Touch Scroll Enabled */}
      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar touch-auto">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
