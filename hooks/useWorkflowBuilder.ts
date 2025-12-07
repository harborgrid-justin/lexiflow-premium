
import { useState, useCallback } from 'react';
import { WorkflowNode, WorkflowConnection, NodeType } from '../components/workflow/builder/types';
import { WorkflowTemplateData } from '../types';

export const useWorkflowBuilder = (initialTemplate?: WorkflowTemplateData | null) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(() => {
    if (initialTemplate) {
      const generatedNodes: WorkflowNode[] = [{ id: 'start', type: 'Start', label: 'Start', x: 50, y: 300, config: {} }];
      initialTemplate.stages.forEach((stage, idx) => {
        generatedNodes.push({
          id: `n-${idx}`, type: 'Task', label: stage, x: 50 + ((idx + 1) * 220), y: 300,
          config: { description: `Execute stage: ${stage}`, assignee: 'Unassigned', sla: '48' }
        });
      });
      generatedNodes.push({ id: 'end', type: 'End', label: 'Process Complete', x: 50 + ((initialTemplate.stages.length + 1) * 220), y: 300, config: {} });
      return generatedNodes;
    }
    return [
      { id: 'start', type: 'Start', label: 'Trigger: New Case', x: 100, y: 250, config: {} },
      { id: 'n1', type: 'Task', label: 'Conflict Check', x: 350, y: 250, config: { assignee: 'Paralegal', sla: '24' } },
      { id: 'n2', type: 'Decision', label: 'Clear?', x: 600, y: 250, config: {} },
    ];
  });
  
  const [connections, setConnections] = useState<WorkflowConnection[]>(() => {
    if (initialTemplate) {
      const conns: WorkflowConnection[] = [];
      const stageCount = initialTemplate.stages.length;
      if (stageCount > 0) {
        conns.push({ id: 'c-start', from: 'start', to: 'n-0' });
        for (let i = 0; i < stageCount - 1; i++) conns.push({ id: `c-${i}`, from: `n-${i}`, to: `n-${i+1}` });
        conns.push({ id: 'c-end', from: `n-${stageCount-1}`, to: 'end' });
      } else {
        conns.push({ id: 'c-direct', from: 'start', to: 'end' });
      }
      return conns;
    }
    return [{ id: 'c1', from: 'start', to: 'n1' }, { id: 'c2', from: 'n1', to: 'n2' }];
  });

  const detectCycle = (fromId: string, toId: string): boolean => {
      // Depth-First Search to check if 'fromId' is reachable from 'toId'
      const visited = new Set<string>();
      const stack = [toId];

      while (stack.length > 0) {
          const current = stack.pop()!;
          if (current === fromId) return true; // Cycle detected
          if (visited.has(current)) continue;
          visited.add(current);

          // Find outgoing connections from current node
          const outgoing = connections.filter(c => c.from === current).map(c => c.to);
          stack.push(...outgoing);
      }
      return false;
  };

  const addConnection = (from: string, to: string) => {
      if (from === to) return; // No self loops
      if (connections.some(c => c.from === from && c.to === to)) return; // No duplicates
      
      if (detectCycle(from, to)) {
          alert("Cannot connect: This would create an infinite loop.");
          return;
      }

      setConnections(prev => [...prev, { id: `c-${Date.now()}`, from, to }]);
  };

  const addNode = (type: NodeType, x: number, y: number) => {
      const newNode: WorkflowNode = {
          id: `n-${Date.now()}`, type, label: `New ${type}`, x, y, config: {}
      };
      setNodes(prev => [...prev, newNode]);
      return newNode.id;
  };

  const updateNode = (id: string, updates: Partial<WorkflowNode>) => {
      setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNode = (id: string) => {
      setNodes(prev => prev.filter(n => n.id !== id));
      setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
  };

  return { nodes, connections, setNodes, setConnections, addNode, updateNode, deleteNode, addConnection };
};
