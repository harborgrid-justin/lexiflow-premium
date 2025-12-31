/**
 * @module utils/pathfinding
 * @category Utils - Graph Algorithms
 * @description Critical Path Method (CPM) implementation using Kahn's topological sort with longest path
 * calculation. Identifies project management critical path (tasks that cannot be delayed without affecting
 * project completion). Builds dependency graph from WorkflowTask dependencies, calculates earliest finish
 * times, and backtracks from maximum duration node.
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Types
import { WorkflowTask } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Graph node interface for advanced pathfinding algorithms
 */
export interface GraphNode {
    id: string;
    duration: number;
    neighbors: string[];
}

// ============================================================================
// PATHFINDING ALGORITHMS
// ============================================================================
export const Pathfinding = {
    /**
     * Calculates the Critical Path (longest path) in a dependency graph.
     * Used for project management to identify tasks that cannot be delayed.
     */
    findCriticalPath: (tasks: WorkflowTask[]): string[] => {
        if (tasks.length === 0) return [];

        // Build Adjacency List and Durations
        const adj = new Map<string, string[]>();
        const durations = new Map<string, number>();
        const inDegree = new Map<string, number>();

        tasks.forEach(t => {
            const dueDate = t.dueDate || new Date().toISOString();
            const start = t.startDate ? new Date(t.startDate) : new Date(dueDate);
            const due = new Date(dueDate);
            const durationDays = (due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) || 1;

            durations.set(t.id, durationDays);
            inDegree.set(t.id, 0);
            if (!adj.has(t.id)) adj.set(t.id, []);
        });

        // Populate Graph
        tasks.forEach(t => {
            if (t.dependencies) {
                t.dependencies.forEach(depId => {
                    if (adj.has(depId)) {
                        adj.get(depId)!.push(t.id);
                        inDegree.set(t.id, (inDegree.get(t.id) || 0) + 1);
                    }
                });
            }
        });

        // Topological Sort (Kahn's Algorithm)
        const queue: string[] = [];
        inDegree.forEach((deg, id) => {
            if (deg === 0) queue.push(id);
        });

        const sortedOrder: string[] = [];
        const earliestFinish = new Map<string, number>();
        const predecessors = new Map<string, string | null>();

        while (queue.length > 0) {
            const u = queue.shift()!;
            sortedOrder.push(u);

            const ef_u = (earliestFinish.get(u) || 0) + (durations.get(u) || 0);

            const neighbors = adj.get(u) || [];
            neighbors.forEach(v => {
                const existing_ef_v = earliestFinish.get(v) || 0;
                if (ef_u > existing_ef_v) {
                    earliestFinish.set(v, ef_u);
                    predecessors.set(v, u);
                }

                inDegree.set(v, (inDegree.get(v) || 1) - 1);
                if (inDegree.get(v) === 0) {
                    queue.push(v);
                }
            });
        }

        // Backtrack from the last node(s) to find path with max cost
        let maxNode: string | null = null;
        let maxVal = -1;
        earliestFinish.forEach((val, key) => {
            const totalDuration = val + (durations.get(key) || 0);
            if (totalDuration > maxVal) {
                maxVal = totalDuration;
                maxNode = key;
            }
        });

        if (!maxNode) { // Handle case with no links
            return tasks.length > 0 ? [tasks[0]!.id] : [];
        }

        const path: string[] = [];
        let current: string | null = maxNode;
        while (current) {
            path.unshift(current);
            current = predecessors.get(current) || null;
        }

        return path;
    }
};
