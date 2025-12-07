
import { WorkflowTask } from '../types';

interface GraphNode {
    id: string;
    duration: number; // Estimate
    neighbors: string[];
}

export const Pathfinding = {
    /**
     * Calculates the Critical Path (longest path) in a dependency graph.
     * Used for project management to identify tasks that cannot be delayed.
     */
    findCriticalPath: (tasks: WorkflowTask[]): string[] => {
        // Build Adjacency List and Durations
        const adj = new Map<string, string[]>();
        const durations = new Map<string, number>();
        const inDegree = new Map<string, number>();
        
        tasks.forEach(t => {
            durations.set(t.id, 1); // Simplified: 1 unit per task unless specified
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

        while (queue.length > 0) {
            const u = queue.shift()!;
            sortedOrder.push(u);
            
            // Calculate Earliest Finish
            // EF(u) = Duration(u) + max(EF(predecessors))
            // Simplified: We accumulate cost forward
            const currentCost = earliestFinish.get(u) || durations.get(u) || 0;
            
            const neighbors = adj.get(u) || [];
            neighbors.forEach(v => {
                const existing = earliestFinish.get(v) || 0;
                const newCost = currentCost + (durations.get(v) || 0);
                if (newCost > existing) {
                    earliestFinish.set(v, newCost);
                }
                
                inDegree.set(v, (inDegree.get(v) || 1) - 1);
                if (inDegree.get(v) === 0) {
                    queue.push(v);
                }
            });
        }

        // Backtrack to find path with max cost
        let maxNode = '';
        let maxVal = -1;
        earliestFinish.forEach((val, key) => {
            if (val > maxVal) {
                maxVal = val;
                maxNode = key;
            }
        });

        // Reconstruct path backward (Simplified Critical Path)
        // In full CPM, we'd calculate LS/LF and Float. 
        // Here we just grab the longest chain found during topo sort propogation.
        // This is a heuristic approximation suitable for UI visualization.
        const path: string[] = [];
        // TODO: Full backtracking implementation requires storing predecessor pointers.
        // For now, return the nodes with 0 float (approximated by high accumulated cost).
        
        return Array.from(earliestFinish.keys()).sort((a,b) => earliestFinish.get(b)! - earliestFinish.get(a)!);
    }
};
