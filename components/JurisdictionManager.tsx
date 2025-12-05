
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PageHeader } from './common/PageHeader';
import { Landmark, Map, Gavel, Globe, ScrollText, Scale, Building2, BookOpen } from 'lucide-react';
import { JurisdictionFederal } from './jurisdiction/JurisdictionFederal';
import { JurisdictionState } from './jurisdiction/JurisdictionState';
import { JurisdictionRegulatory } from './jurisdiction/JurisdictionRegulatory';
import { JurisdictionInternational } from './jurisdiction/JurisdictionInternational';
import { JurisdictionArbitration } from './jurisdiction/JurisdictionArbitration';
import { JurisdictionLocalRules } from './jurisdiction/JurisdictionLocalRules';
import { JurisdictionGeoMap } from './jurisdiction/JurisdictionGeoMap';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

type JurisdictionView = 'federal' | 'state' | 'regulatory' | 'international' | 'arbitration' | 'local' | 'map';

interface JurisdictionManagerProps {
  currentUser?: User;
  initialTab?: JurisdictionView;
}

const PARENT_TABS = [
  {
    id: 'courts', label: 'Courts', icon: Landmark,
    subTabs: [
      { id: 'federal', label: 'Federal Circuit', icon: Landmark },
      { id: 'state', label: 'State Venues', icon: Building2 },
      { id: 'map', label: 'Geo Map', icon: Map },
    ]
  },
  {
    id: 'rules_adr', label: 'Rules & ADR', icon: BookOpen,
    subTabs: [
      { id: 'local', label: 'Local Rules', icon: ScrollText },
      { id: 'arbitration', label: 'Arbitration', icon: Gavel },
    ]
  },
  {
    id: 'specialty', label: 'Specialty', icon: Globe,
    subTabs: [
      { id: 'regulatory', label: 'Regulatory', icon: Scale },
      { id: 'international', label: 'International', icon: Globe },
    ]
  }
];

export const JurisdictionManager: React.FC<JurisdictionManagerProps> = ({ currentUser, initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<JurisdictionView>('federal');

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as JurisdictionView);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
        case 'federal': return <JurisdictionFederal />;
        case 'state': return <JurisdictionState />;
        case 'regulatory': return <JurisdictionRegulatory />;
        case 'international': return <JurisdictionInternational />;
        case 'arbitration': return <JurisdictionArbitration />;
        case 'local': return <JurisdictionLocalRules />;
        case 'map': return <div className="h-full"><JurisdictionGeoMap /></div>;
        default: return <JurisdictionFederal />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
            title="Jurisdiction & Venues" 
            subtitle="Manage courts, regulatory bodies, and jurisdictional rules."
            actions={
            currentUser ? (
                <div className={cn("flex items-center text-xs px-3 py-1.5 rounded-full shadow-sm border", theme.surface, theme.border.default, theme.text.secondary)}>
                  <span className={cn("w-2 h-2 rounded-full mr-2", currentUser.role === 'Senior Partner' ? "bg-purple-500" : "bg-blue-500")}></span>
                  Viewing as: <span className={cn("font-bold ml-1", theme.text.primary)}>{currentUser.role}</span>
                </div>
            ) : undefined
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
                        onClick={() => setActiveTab(tab.id as JurisdictionView)} 
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

export default JurisdictionManager;
