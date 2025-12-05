
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Network, Users, Share2, ShieldAlert, Map as MapIcon, Search, Plus, BarChart3, Database, Building, Briefcase, Import } from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { useQuery } from '../services/queryClient';
import { DataService } from '../services/dataService';
import { STORES } from '../services/db';
import { LegalEntity } from '../types';
import { useWindow } from '../context/WindowContext'; // Holographic DOM

// Sub-components
import { EntityGrid } from './entities/EntityGrid';
import { EntityNetwork } from './entities/EntityNetwork';
import { EntityOrgChart } from './entities/EntityOrgChart';
import { EntityProfile } from './entities/EntityProfile';
import { ConflictCheckPanel } from './entities/ConflictCheckPanel';
import { EntityAnalytics } from './entities/EntityAnalytics';
import { EntityIngestion } from './entities/EntityIngestion';
import { EntityGovernance } from './entities/EntityGovernance';
import { EntityVendorOps } from './entities/EntityVendorOps';
import { EntityMap } from './entities/EntityMap';

type DirectorView = 'directory' | 'network' | 'hierarchy' | 'conflicts' | 'map' | 'analytics' | 'ingestion' | 'governance' | 'vendors';

interface EntityDirectorProps {
    initialTab?: DirectorView;
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
    id: 'intel', label: 'Intelligence', icon: Network,
    subTabs: [
      { id: 'network', label: 'Relationship Graph', icon: Network },
      { id: 'hierarchy', label: 'Org Charts', icon: Share2 },
      { id: 'map', label: 'Geo Map', icon: MapIcon },
      { id: 'analytics', label: 'Demographics', icon: BarChart3 },
    ]
  },
  {
    id: 'risk', label: 'Risk & Data', icon: ShieldAlert,
    subTabs: [
      { id: 'conflicts', label: 'Conflict Check', icon: ShieldAlert },
      { id: 'ingestion', label: 'Data Ingestion', icon: Import },
    ]
  }
];

export const EntityDirector: React.FC<EntityDirectorProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow(); // Holographic DOM
  const [activeTab, setActiveTab] = useState<DirectorView>('directory');

  // Enterprise Data Access
  const { data: entities = [] } = useQuery<LegalEntity[]>(
      [STORES.ENTITIES, 'all'],
      DataService.entities.getAll
  );

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as DirectorView);
    }
  }, []);

  const handleSelectEntity = (entity: LegalEntity) => {
      const winId = `entity-${entity.id}`;
      openWindow(
          winId,
          `Profile: ${entity.name}`,
          <EntityProfile 
             entityId={entity.id} 
             onClose={() => closeWindow(winId)} 
          />
      );
  };

  const handleAddEntity = async () => {
      const name = prompt("Enter Entity Name:");
      if (!name) return;
      const type = prompt("Type (Individual/Corporation/Law Firm):") || 'Individual';
      
      const newEntity: LegalEntity = {
          id: `ent-${Date.now()}`,
          name,
          type: type as any,
          roles: ['Prospect'],
          status: 'Active',
          riskScore: 0,
          tags: []
      };
      
      await DataService.entities.add(newEntity);
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
            title="Entity Director" 
            subtitle="Centralized identity management, relationship mapping, and conflict resolution."
            actions={
              <div className="flex gap-2">
                  <Button variant="secondary" icon={Search}>Global Search</Button>
                  <Button variant="primary" icon={Plus} onClick={handleAddEntity}>New Profile</Button>
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
                        onClick={() => setActiveTab(tab.id as DirectorView)} 
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

      <div className="flex-1 overflow-hidden flex relative">
         <div className={cn("flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar", activeTab === 'map' ? 'p-0' : '')}>
            {activeTab === 'directory' && <EntityGrid entities={entities} onSelect={handleSelectEntity} />}
            {activeTab === 'network' && <EntityNetwork entities={entities} />}
            {activeTab === 'hierarchy' && <EntityOrgChart entities={entities} onSelect={handleSelectEntity} />}
            {activeTab === 'conflicts' && <ConflictCheckPanel entities={entities} />}
            {activeTab === 'map' && <EntityMap entities={entities} />}
            {activeTab === 'analytics' && <EntityAnalytics entities={entities} />}
            {activeTab === 'ingestion' && <EntityIngestion />}
            {activeTab === 'governance' && <EntityGovernance entities={entities} onSelect={handleSelectEntity} />}
            {activeTab === 'vendors' && <EntityVendorOps entities={entities} onSelect={handleSelectEntity} />}
         </div>
      </div>
    </div>
  );
};
