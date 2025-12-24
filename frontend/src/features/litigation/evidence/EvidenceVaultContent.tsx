
/**
 * @module EvidenceVaultContent
 * @category Evidence
 * @description Router component for Evidence Vault views.
 * Renders the appropriate sub-component based on the current view mode.
 */

import React, { lazy } from 'react';

// Types
import { ViewMode, EvidenceFilters } from '../../../hooks/useEvidenceVault';
import { EvidenceItem } from '../../../types';

// Lazy Loaded Components
const EvidenceDashboard = lazy(() => import('./EvidenceDashboard').then(m => ({ default: m.EvidenceDashboard })));
const EvidenceInventory = lazy(() => import('./EvidenceInventory').then(m => ({ default: m.EvidenceInventory })));
const EvidenceCustodyLog = lazy(() => import('./EvidenceCustodyLog').then(m => ({ default: m.EvidenceCustodyLog })));
const EvidenceIntake = lazy(() => import('./EvidenceIntake').then(m => ({ default: m.EvidenceIntake })));

interface EvidenceVaultContentProps {
  view: ViewMode;
  evidenceItems: EvidenceItem[];
  filteredItems: EvidenceItem[];
  filters: EvidenceFilters;
  setFilters: React.Dispatch<React.SetStateAction<EvidenceFilters>>;
  onItemClick: (item: EvidenceItem) => void;
  onIntakeClick: () => void;
  onIntakeComplete: (item: EvidenceItem) => void;
  onNavigate: (view: ViewMode) => void;
}

export const EvidenceVaultContent: React.FC<EvidenceVaultContentProps> = ({
  view, evidenceItems, filteredItems, filters, setFilters, onItemClick, onIntakeClick, onIntakeComplete, onNavigate
}) => {
    switch (view) {
      case 'dashboard': return <EvidenceDashboard onNavigate={onNavigate} />;
      case 'inventory': return <EvidenceInventory items={evidenceItems} filteredItems={filteredItems} filters={filters} setFilters={setFilters} onItemClick={onItemClick} onIntakeClick={onIntakeClick} />;
      case 'custody': return <EvidenceCustodyLog />;
      case 'intake': return <EvidenceIntake handleBack={() => onNavigate('inventory')} onComplete={onIntakeComplete} />;
      default: return <EvidenceDashboard onNavigate={onNavigate} />;
    }
};
