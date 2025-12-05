
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { 
  Scale, Gavel, BookOpen, Map, Search, LayoutDashboard, FileText, 
  Settings, GitCompare, Plus, Filter 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { RulesDashboard } from './rules/RulesDashboard';
import { RuleBookViewer } from './rules/RuleBookViewer';
import { StandingOrders } from './rules/StandingOrders';
import { LocalRulesMap } from './rules/LocalRulesMap';

type RulesView = 'dashboard' | 'federal_evidence' | 'federal_civil' | 'local' | 'standing_orders' | 'compare' | 'search';

interface RulesPlatformProps {
    initialTab?: RulesView;
}

const PARENT_TABS = [
  {
    id: 'overview', label: 'Overview', icon: LayoutDashboard,
    subTabs: [ { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard } ]
  },
  {
    id: 'federal', label: 'Federal Rules', icon: Scale,
    subTabs: [
      { id: 'federal_evidence', label: 'Evidence (FRE)', icon: BookOpen },
      { id: 'federal_civil', label: 'Civil Procedure (FRCP)', icon: FileText },
    ]
  },
  {
    id: 'local_courts', label: 'Local & Standing', icon: Gavel,
    subTabs: [
      { id: 'local', label: 'Local Rules', icon: Map },
      { id: 'standing_orders', label: 'Standing Orders', icon: Gavel },
    ]
  },
  {
    id: 'tools', label: 'Tools', icon: Settings,
    subTabs: [
      { id: 'search', label: 'Deep Search', icon: Search },
      { id: 'compare', label: 'Redline / Compare', icon: GitCompare },
    ]
  }
];

export const RulesPlatform: React.FC<RulesPlatformProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<RulesView>('dashboard');

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as RulesView);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <RulesDashboard onNavigate={setActiveTab} />;
      case 'federal_evidence': return <RuleBookViewer type="FRE" title="Federal Rules of Evidence" />;
      case 'federal_civil': return <RuleBookViewer type="FRCP" title="Federal Rules of Civil Procedure" />;
      case 'local': return <LocalRulesMap />;
      case 'standing_orders': return <StandingOrders />;
      case 'search': return <div className="p-12 text-center text-slate-400">Deep Semantic Search Module Loading...</div>;
      case 'compare': return <div className="p-12 text-center text-slate-400">Rule Comparison Engine Loading...</div>;
      default: return <RulesDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
            title="Legal Authority Management" 
            subtitle="Comprehensive legal authority management, compliance tracking, and judicial standing orders."
            actions={
              <div className="flex gap-2">
                  <Button variant="secondary" icon={Filter}>My Jurisdictions</Button>
                  <Button variant="primary" icon={Plus}>Add Rule Set</Button>
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
                        onClick={() => setActiveTab(tab.id as RulesView)} 
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
