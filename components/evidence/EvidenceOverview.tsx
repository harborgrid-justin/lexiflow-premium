import React from 'react';
import { EvidenceItem } from '../../types';
import { EvidenceParticulars } from './overview/EvidenceParticulars';
import { EvidenceLocation } from './overview/EvidenceLocation';
import { EvidenceFRCPStatus } from './overview/EvidenceFRCPStatus';

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