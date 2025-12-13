
/**
 * @module EvidenceOverview
 * @category Evidence
 * @description Overview tab for evidence details.
 * Aggregates particulars, location, and FRCP status components.
 */

import React from 'react';

// Sub-components
import { EvidenceParticulars } from './overview/EvidenceParticulars';
import { EvidenceLocation } from './overview/EvidenceLocation';
import { EvidenceFRCPStatus } from './overview/EvidenceFRCPStatus';

// Types
import { EvidenceItem } from '../../types';

interface EvidenceOverviewProps {
  selectedItem: EvidenceItem;
}

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