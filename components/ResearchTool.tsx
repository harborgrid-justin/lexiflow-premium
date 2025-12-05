
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, History, Bookmark, Settings, Globe, BookOpen } from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

// Sub-components
import { ActiveResearch } from './research/ActiveResearch';
import { ResearchHistory } from './research/ResearchHistory';
import { SavedAuthorities } from './research/SavedAuthorities';
import { JurisdictionSettings } from './research/JurisdictionSettings';

type ResearchView = 'active' | 'history' | 'saved' | 'settings';

interface ResearchToolProps {
    initialTab?: ResearchView;
}

const PARENT_TABS = [
  {
    id: 'research', label: 'Research', icon: Search,
    subTabs: [
      { id: 'active', label: 'Active Session', icon: Search },
    ]
  },
  {
    id: 'library', label: 'Library', icon: BookOpen,
    subTabs: [
      { id: 'history', label: 'History', icon: History },
      { id: 'saved', label: 'Saved Authorities', icon: Bookmark },
    ]
  },
  {
    id: 'config', label: 'Configuration', icon: Settings,
    subTabs: [
      { id: 'settings', label: 'Jurisdiction', icon: Globe },
    ]
  }
];

export const ResearchTool: React.FC<ResearchToolProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ResearchView>('active');

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as ResearchView);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'active': return <ActiveResearch />;
      case 'history': return <ResearchHistory />;
      case 'saved': return <SavedAuthorities />;
      case 'settings': return <JurisdictionSettings />;
      default: return <ActiveResearch />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Legal Research Center" 
          subtitle="AI-powered case law analysis, citation verification, and legislative tracking."
          actions={
            <Button variant="outline" size="sm" icon={History} onClick={() => setActiveTab('history')}>Recent</Button>
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

        {/* Sub-Navigation (Pills) - Touch Scroll */}
        {activeParentTab.subTabs.length > 1 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 touch-pan-x", theme.surfaceHighlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as ResearchView)} 
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
        <div className="h-full overflow-y-auto custom-scrollbar touch-auto">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};
