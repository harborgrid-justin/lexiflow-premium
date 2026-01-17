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
import { Plus, Search } from 'lucide-react';
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context

// Components
import { Button } from '@/components/atoms/Button';
import { LazyLoader } from '@/components/molecules/LazyLoader/LazyLoader';
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';
import { useTheme } from '@/hooks/useTheme';


// Utils & Constants
import { cn } from '@/lib/cn';
import { useWindow } from '@/providers';

// Types
import { type EntityType } from '@/types/enums';

import { useEntities } from '../hooks/useEntities';

import { type DirectorView, EntityNavigation, getEntityFirstTab, getEntityParentTab } from './layout/EntityNavigation';

import type { EntityId, LegalEntity } from '@/types';

import { DataService } from '@/services/dataService';

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

export const EntityDirector = ({ initialTab }: EntityDirectorProps) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow(); // Holographic DOM
  const [activeTab, setActiveTab] = useState<DirectorView>('directory');

  // Enterprise Data Access
  const { entities } = useEntities(); // Use Context from loader
  // const { data: entities = [] } = useQuery<LegalEntity[]>(
  //   queryKeys.entities.all(),
  //   () => DataService.entities.getAll()
  // );

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
      type: type as EntityType,
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
              <Button variant="primary" icon={Plus} onClick={() => void handleAddEntity()}>
                New Profile
              </Button>
            </div>
          }
        />

        <EntityNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeParentTabId={activeParentTab?.id || ''}
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
