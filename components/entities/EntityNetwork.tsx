
import React from 'react';
import { LegalEntity } from '../../types';
import { NexusGraph } from '../visual/NexusGraph';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface EntityNetworkProps {
  entities: LegalEntity[];
}

export const EntityNetwork: React.FC<EntityNetworkProps> = ({ entities }) => {
  const { theme } = useTheme();
  
  // Map entities to compatible structure for NexusGraph until a specific graph is built
  // Mocking a central 'Firm' node context
  const caseMock: any = { title: 'Global Entity Network' };
  const partyMap: any[] = entities.map(e => ({ id: e.id, name: e.name, type: e.type }));

  return (
    <div className="h-full p-6 flex flex-col">
        <div className={cn("mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800")}>
            <strong>Network Analysis:</strong> Visualizing {entities.length} entities and their cross-matter relationships.
        </div>
        <div className="flex-1 border rounded-xl overflow-hidden shadow-sm">
            <NexusGraph caseData={caseMock} parties={partyMap} evidence={[]} />
        </div>
    </div>
  );
};
