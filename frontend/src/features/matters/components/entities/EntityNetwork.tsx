/**
 * @module components/entities/EntityNetwork
 * @category Entities
 * @description Entity relationship graph with conflict cluster detection.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { NexusGraph } from '@/features/visual/NexusGraph';
import { Card } from '@/components/molecules/Card';
import { AdaptiveLoader } from '@/components/molecules/AdaptiveLoader';

// Utils & Constants
import { cn } from '@/utils/cn';
import { DisjointSet } from '@/utils/datastructures/disjointSet';

// Types
import { LegalEntity, EntityRelationship } from '@/types';
// ✅ Migrated to backend API (2025-12-21)

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EntityNetworkProps {
  /** List of entities for network graph. */
  entities: LegalEntity[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export const EntityNetwork: React.FC<EntityNetworkProps> = ({ entities }) => {
  const { theme } = useTheme();

  const { data: relationships = [], isLoading } = useQuery<EntityRelationship[]>(
      ['relationships', 'all'],
      () => DataService.entities.getAllRelationships()
  );
  
  const { nodes, links: _links, components } = useMemo(() => {
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

  if (isLoading) return <AdaptiveLoader contentType="dashboard" shimmer />;

  const handleNodeClick = (node: unknown) => {
    // Entity node interaction - can be extended for detailed entity profile viewing
  };

  return (
    <div className="h-full flex gap-6">
        <div className="flex-1 border rounded-xl overflow-hidden shadow-sm">
            <NexusGraph caseData={{title: 'Entity Network'} as any} parties={nodes as any} evidence={[]} onNodeClick={handleNodeClick} />
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


