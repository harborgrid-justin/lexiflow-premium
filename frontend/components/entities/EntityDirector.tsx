/**
 * @module components/entities/EntityDirector
 * @category Entities
 * @description Main entity management hub with navigation and lazy loading.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { Search, Plus } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../hooks/useQueryHooks';
import { queryKeys } from '../../utils/queryKeys';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useWindow } from '../../context/WindowContext';

// Components
import { PageHeader } from '../common/PageHeader';
import { Button } from '../common/Button';
import { LazyLoader } from '../common/LazyLoader';
import { EntityNavigation, DirectorView, getEntityParentTab, getEntityFirstTab } from './layout/EntityNavigation';

// Utils & Constants
import { cn } from '../../utils/cn';

// Types
import { LegalEntity, EntityId } from '../../types';

// Sub-components
const EntityGrid = React.lazy(() => import('./EntityGrid').then(m => ({ default: m.EntityGrid })));
const EntityNetwork = React.lazy(() => import('./EntityNetwork').then(m => ({ default: m.EntityNetwork })));
const EntityOrgChart = React.lazy(() => import('./EntityOrgChart').then(m => ({ default: m.EntityOrgChart })));
const EntityProfile = React.lazy(() => import('./EntityProfile').then(m => ({ default: m.EntityProfile })));
const ConflictCheckPanel = React.lazy(() => import('./ConflictCheckPanel').then(m => ({ default: m.ConflictCheckPanel })));
const EntityAnalytics = React.lazy(() => import('./EntityAnalytics').then(m => ({ default: m.EntityAnalytics })));
const EntityIngestion = React.lazy(() => import('./EntityIngestion').then(m => ({ default: m.EntityIngestion })));
const EntityGovernance = React.lazy(() => import('./EntityGovernance').then(m => ({ default: m.EntityGovernance })));
const EntityVendorOps = React.lazy(() => import('./EntityVendorOps').then(m => ({ default: m.EntityVendorOps })));
const EntityMap = React.lazy(() => import('./EntityMap').then(m => ({ default: m.EntityMap })));
const UboRegister = React.lazy(() => import('./ubo/UboRegister').then(m => ({ default: m.UboRegister })));
const KycManager = React.lazy(() => import('./ubo/KycManager').then(m => ({ default: m.KycManager })));
const PerformanceScorecards = React.lazy(() => import('./counsel/PerformanceScorecards').then(m => ({ default: m.PerformanceScorecards })));
const RateNegotiation = React.lazy(() => import('./counsel/RateNegotiation').then(m => ({ default: m.RateNegotiation })));
const AlumniDirectory = React.lazy(() => import('./talent/AlumniDirectory').then(m => ({ default: m.AlumniDirectory })));

interface EntityDirectorProps {
    initialTab?: DirectorView;
}

export const EntityDirector: React.FC<EntityDirectorProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow(); // Holographic DOM
  const [activeTab, setActiveTab] = useState<DirectorView>('directory');

  // Enterprise Data Access
  const { data: entities = [] } = useQuery<LegalEntity[]>(
      queryKeys.entities.all(),
      DataService.entities.getAll
  );

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() => getEntityParentTab(activeTab), [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    setActiveTab(getEntityFirstTab(parentId));
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
        
        <EntityNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            activeParentTabId={activeParentTab.id}
            onParentTabChange={handleParentTabChange}
        />
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



export default EntityDirector;
