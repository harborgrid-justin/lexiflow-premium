
import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { Network, Users, Share2, ShieldAlert, Map as MapIcon, Search, Plus, BarChart3, Database, Building, Briefcase, Import, GraduationCap, Scale, FileCheck, DollarSign } from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { useQuery } from '../services/queryClient';
import { DataService } from '../services/dataService';
import { STORES } from '../services/db';
import { LegalEntity, EntityId } from '../types';
import { useWindow } from '../context/WindowContext'; // Holographic DOM
import { LazyLoader } from './common/LazyLoader';

// Sub-components
const EntityGrid = React.lazy(() => import('./entities/EntityGrid').then(m => ({ default: m.EntityGrid })));
const EntityNetwork = React.lazy(() => import('./entities/EntityNetwork').then(m => ({ default: m.EntityNetwork })));
const EntityOrgChart = React.lazy(() => import('./entities/EntityOrgChart').then(m => ({ default: m.EntityOrgChart })));
const EntityProfile = React.lazy(() => import('./entities/EntityProfile').then(m => ({ default: m.EntityProfile })));
const ConflictCheckPanel = React.lazy(() => import('./entities/ConflictCheckPanel').then(m => ({ default: m.ConflictCheckPanel })));
const EntityAnalytics = React.lazy(() => import('./entities/EntityAnalytics').then(m => ({ default: m.EntityAnalytics })));
const EntityIngestion = React.lazy(() => import('./entities/EntityIngestion').then(m => ({ default: m.EntityIngestion })));
const EntityGovernance = React.lazy(() => import('./entities/EntityGovernance').then(m => ({ default: m.EntityGovernance })));
const EntityVendorOps = React.lazy(() => import('./entities/EntityVendorOps').then(m => ({ default: m.EntityVendorOps })));
const EntityMap = React.lazy(() => import('./entities/EntityMap').then(m => ({ default: m.EntityMap })));
const UboRegister = React.lazy(() => import('./entities/ubo/UboRegister').then(m => ({ default: m.UboRegister })));
const KycManager = React.lazy(() => import('./entities/ubo/KycManager').then(m => ({ default: m.KycManager })));
const PerformanceScorecards = React.lazy(() => import('./entities/counsel/PerformanceScorecards').then(m => ({ default: m.PerformanceScorecards })));
const RateNegotiation = React.lazy(() => import('./entities/counsel/RateNegotiation').then(m => ({ default: m.RateNegotiation })));
const AlumniDirectory = React.lazy(() => import('./entities/talent/AlumniDirectory').then(m => ({ default: m.AlumniDirectory })));

type DirectorView = 
  | 'directory' | 'network' | 'hierarchy' | 'conflicts' | 'map' | 'analytics' | 'ingestion' | 'governance' | 'vendors'
  | 'ubo_register' | 'kyc_docs' 
  | 'oc_scorecards' | 'oc_rates'
  | 'talent_alumni';

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
          <Suspense fallback={<LazyLoader message="Loading Profile..." />}>
            <EntityProfile 
              entityId={entity.id} 
              onClose={() => closeWindow(winId)} 
            />
          </Suspense>
      );
  };

  const handleAddEntity = async () => {
      const name = prompt("Enter Entity Name:");
      if (!name) return;
      const type = prompt("Type (Individual/Corporation/Law Firm):") || 'Individual';
      
      const newEntity: LegalEntity = {
          id: `ent-${Date.now()}` as EntityId,
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
        <div className={cn("hidden md:flex space-x-6 border-b mb-4 overflow-x-auto no-scrollbar", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2 whitespace-nowrap",
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

      <div className="flex-1 flex overflow-hidden relative">
         <div className={cn("flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar", activeTab === 'map' || activeTab === 'network' ? 'p-0' : '')}>
            <Suspense fallback={<LazyLoader message="Loading Module..." />}>
              {activeTab === 'directory' && <EntityGrid entities={entities} onSelect={handleSelectEntity} />}
              {activeTab === 'network' && <EntityNetwork entities={entities} />}
              {activeTab === 'hierarchy' && <EntityOrgChart entities={entities} onSelect={handleSelectEntity} />}
              {activeTab === 'conflicts' && <ConflictCheckPanel entities={entities} />}
              {activeTab === 'map' && <EntityMap entities={entities} />}
              {activeTab === 'analytics' && <EntityAnalytics entities={entities} />}
              {activeTab === 'ingestion' && <EntityIngestion />}
              {activeTab === 'governance' && <EntityGovernance entities={entities} onSelect={handleSelectEntity} />}
              {activeTab === 'vendors' && <EntityVendorOps entities={entities} onSelect={handleSelectEntity} />}
              
              {/* New Modules */}
              {activeTab === 'ubo_register' && <UboRegister entities={entities} onSelect={handleSelectEntity} />}
              {activeTab === 'kyc_docs' && <KycManager entities={entities} />}
              {activeTab === 'oc_scorecards' && <PerformanceScorecards entities={entities} />}
              {activeTab === 'oc_rates' && <RateNegotiation entities={entities} />}
              {activeTab === 'talent_alumni' && <AlumniDirectory entities={entities} />}
            </Suspense>
         </div>
      </div>
    </div>
  );
};
