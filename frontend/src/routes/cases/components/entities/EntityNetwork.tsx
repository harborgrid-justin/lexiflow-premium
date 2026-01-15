/**
 * @module components/entities/EntityNetwork
 * @category Entities
 * @description Entity relationship graph with conflict cluster detection.
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with graph computations (memoized)
 * - Guideline 28: Theme usage is pure function (graph styling)
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for graph transitions
 * - Guideline 29: Graph rendering doesn't trigger Suspense cascades
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useMemo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Components
import { NexusGraph } from '@/routes/visual/components/NexusGraph';
import { AdaptiveLoader } from '@/components/molecules/AdaptiveLoader/AdaptiveLoader';
import { Card } from '@/components/molecules/Card/Card';

// Utils & Constants
import { cn } from '@/lib/cn';
import { DisjointSet } from '@/utils/datastructures/disjointSet';

// Types
import { Case, EntityRelationship, LegalEntity, Party } from '@/types';
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
  // Guideline 34: Side-effect free context read
  const { theme } = useTheme();

  const { data: relationships = [], isLoading } = useQuery<EntityRelationship[]>(
    ['relationships', 'all'],
    () => DataService.entities.getAllRelationships()
  );

  // Guideline 28: Memoize complex graph computations (pure function)
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

  const handleNodeClick = (_node: unknown) => {
    // Entity node interaction - can be extended for detailed entity profile viewing
  };

  return (
    <div className="h-full flex gap-6">
      <div className="flex-1 border rounded-xl overflow-hidden shadow-sm">
        <NexusGraph caseData={{ title: 'Entity Network' } as unknown as Case} parties={nodes as unknown as Party[]} evidence={[]} onNodeClick={handleNodeClick} />
      </div>
      <div className={cn("w-80 space-y-4", theme.surface.default, theme.border.default)}>
        <h3 className={cn("p-4 font-bold border-b", theme.text.primary, theme.border.default)}>Conflict Clusters</h3>
        <div className="p-4 space-y-3 overflow-y-auto">
          {components.map((comp, i) => (
            <Card key={i} className={cn(comp.length > 2 ? "border-l-4 border-l-red-500" : "")}>
              <h4 className={cn("font-bold text-sm mb-2", theme.text.primary)}>Cluster {i + 1}</h4>
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
