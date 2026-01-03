import React from 'react';
import { Network, Users, Share2, ShieldAlert, Map as MapIcon, BarChart3, Database, Building, Briefcase, Import, GraduationCap, Scale, FileCheck, DollarSign } from 'lucide-react';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';

export type DirectorView = 
  | 'directory' | 'network' | 'hierarchy' | 'conflicts' | 'map' | 'analytics' | 'ingestion' | 'governance' | 'vendors'
  | 'ubo_register' | 'kyc_docs' 
  | 'oc_scorecards' | 'oc_rates'
  | 'talent_alumni';

interface EntityNavigationProps {
  activeTab: DirectorView;
  setActiveTab: (tab: DirectorView) => void;
  activeParentTabId: string;
  onParentTabChange: (parentId: string) => void;
}

const PARENT_TABS = [
  {
    id: 'manage', label: 'Management', icon: Users,
    subTabs: [
      { id: 'directory', label: 'Master Directory', icon: Users },
      { id: 'governance', label: 'Corporate Registry', icon: Building },
      { id: 'vendors', label: 'Vendor Ops', icon: Briefcase },
    ]
  },
  {
    id: 'compliance', label: 'Corporate Structure', icon: ShieldAlert,
    subTabs: [
      { id: 'ubo_register', label: 'Beneficial Ownership', icon: Network },
      { id: 'kyc_docs', label: 'KYC & Due Diligence', icon: FileCheck },
    ]
  },
  {
    id: 'counsel', label: 'Outside Counsel', icon: Scale,
    subTabs: [
      { id: 'oc_scorecards', label: 'Performance', icon: BarChart3 },
      { id: 'oc_rates', label: 'Rate Cards', icon: DollarSign },
    ]
  },
  {
    id: 'talent', label: 'Talent Network', icon: GraduationCap,
    subTabs: [
      { id: 'talent_alumni', label: 'Alumni Directory', icon: Users },
    ]
  },
  {
    id: 'intel', label: 'Intelligence', icon: Network,
    subTabs: [
      { id: 'network', label: 'Relationship Graph', icon: Network },
      { id: 'hierarchy', label: 'Org Charts', icon: Share2 },
      { id: 'map', label: 'Geo Map', icon: MapIcon },
      { id: 'analytics', label: 'Demographics', icon: BarChart3 },
    ]
  },
  {
    id: 'risk', label: 'Risk & Data', icon: Database,
    subTabs: [
      { id: 'conflicts', label: 'Conflict Check', icon: ShieldAlert },
      { id: 'ingestion', label: 'Data Ingestion', icon: Import },
    ]
  }
];

export const EntityNavigation: React.FC<EntityNavigationProps> = ({ 
  activeTab, setActiveTab, activeParentTabId, onParentTabChange 
}) => {
  const { theme } = useTheme();
  
  const activeParentTab = PARENT_TABS.find(p => p.id === activeParentTabId) || PARENT_TABS[0];

  return (
    <>
        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4 overflow-x-auto no-scrollbar", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => onParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2 whitespace-nowrap",
                        activeParentTabId === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTabId === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs.length > 1 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surface.highlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as DirectorView)} 
                        className={cn(
                            "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                            activeTab === tab.id 
                                ? cn(theme.surface.default, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                                : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface.default}`)
                        )}
                    >
                        <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                        {tab.label}
                    </button>
                ))}
            </div>
        )}
    </>
  );
};

export const getEntityParentTab = (view: DirectorView) => {
    return PARENT_TABS.find(p => p.subTabs.some(s => s.id === view)) || PARENT_TABS[0];
};

export const getEntityFirstTab = (parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    return parent && parent.subTabs.length > 0 ? parent.subTabs[0].id as DirectorView : 'directory';
};
