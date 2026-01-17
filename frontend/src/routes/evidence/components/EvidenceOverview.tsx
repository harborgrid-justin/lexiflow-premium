/**
 * @module components/evidence/EvidenceOverview
 * @category Evidence
 * @description Overview tab for evidence with particulars and FRCP status.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import React from "react";

import { type EvidenceItem } from '@/types';

import { EvidenceFRCPStatus } from './overview/EvidenceFRCPStatus';
import { EvidenceLocation } from './overview/EvidenceLocation';
import { EvidenceParticulars } from './overview/EvidenceParticulars';

// Types


// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EvidenceOverviewProps {
  /** The selected evidence item. */
  selectedItem: EvidenceItem;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const EvidenceOverview: React.FC<EvidenceOverviewProps> = ({ selectedItem }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <EvidenceParticulars selectedItem={selectedItem} />
      <div className="space-y-6">
        <EvidenceLocation location={selectedItem.location} />
        <EvidenceFRCPStatus />
      </div>
    </div>
  );
};
