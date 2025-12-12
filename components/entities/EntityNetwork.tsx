
import React, { useMemo } from 'react';
import { LegalEntity, EntityRelationship } from '../../types';
import { NexusGraph } from '../visual/NexusGraph';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DisjointSet } from '../../utils/datastructures/disjointSet';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { Loader2 } from 'lucide-react';
import { Card } from '../common/Card';

interface EntityNetworkProps {
  entities: LegalEntity[];
}

export const EntityNetwork: React.FC<EntityNetworkProps> = ({ entities }) => {
  const { theme } = useTheme();

  const { data: relationships = [], isLoading } = useQuery<EntityRelationship[]>(
      [STORES.RELATIONSHIPS, 'all'],
      () => DataService.entities.getRelationships('all') // Mocked to fetch all
  );
  
  const { nodes, links, components } = useMemo(() => {
    if (isLoading || entities.length === 0) return { nodes: [], links: [], components: [] };
    
    // 1. Initialize Disjoint Set
    const ds = new DisjointSet(entities.map(e => e.id));
    
    // 2. Union based on relationships
    relationships.forEach(rel => {
      ds.union(rel.sourceId, rel.targetId);
    });

    // 3. Get connected components (clusters)
    const comps = ds.getConnectedComponents();
    
    // 4. Prepare data for NexusGraph
    const graphNodes = entities.map(e => ({
      id: e.id,
      label: e.name,
      type: e.type === 'Corporation' ? 'org' : 'party',
      original: e
    }));
    
    const graphLinks = relationships.map(rel => ({
      source: rel.sourceId,
      target: rel.targetId,
      strength: 0.8
    }));

    return { nodes: graphNodes, links: graphLinks, components: comps };
  }, [entities, relationships, isLoading]);

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600"/></div>;

  return (
    <div className="h-full flex gap-6">
        <div className="flex-1 border rounded-xl overflow-hidden shadow-sm">
            <NexusGraph caseData={{title: 'Entity Network'} as any} parties={nodes as any} evidence={[]} onNodeClick={(node) => console.log('Node clicked:', node)} />
        </div>
        <div className={cn("w-80 space-y-4", theme.surface.default, theme.border.default)}>
             <h3 className={cn("p-4 font-bold border-b", theme.text.primary, theme.border.default)}>Conflict Clusters</h3>
             <div className="p-4 space-y-3 overflow-y-auto">
                {components.map((comp, i) => (
                    <Card key={i} className={cn(comp.length > 2 ? "border-l-4 border-l-red-500" : "")}>
                         <h4 className={cn("font-bold text-sm mb-2", theme.text.primary)}>Cluster {i+1}</h4>
                         <ul className="text-xs space-y-1">
                             {comp.map(id => {
                                 const entity = entities.find(e => e.id === id);
                                 return <li key={id} className={cn("truncate", theme.text.secondary)}>{entity?.name || id}</li>
                             })}
                         </ul>
                    </Card>
                ))}
             </div>
        </div>
    </div>
  );
};
