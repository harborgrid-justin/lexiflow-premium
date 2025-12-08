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
          // FIX: Corrected shorthand property error by providing an initializer for 'assignee'.
          config: { description: `Execute stage: ${stage}`, assignee: '' }
        });
      });
      generatedNodes.push({ id: 'end', type: 'End', label: 'End', x: 50 + (initialTemplate.stages.length + 1) * 220, y: 300, config: {} });
      return generatedNodes;
    }
    return [
        { id: 'start', type: 'Start', label: 'Start', x: 50, y: 200, config: {} },
        { id: 'end', type: 'End', label: 'End', x: 550, y: 200, config: {} },
    ];
  });
  
  const [connections, setConnections] = useState<WorkflowConnection[]>(() => {
    if (initialTemplate) {
        const nodes = [
            { id: 'start' }, 
            ...initialTemplate.stages.map((_, idx) => ({ id: `n-${idx}` })),
            { id: 'end' }
        ];
        return nodes.slice(0, -1).map((node, i) => ({
            id: `c-${i}`,
            from: node.id,
            to: nodes[i+1].id
        }));
    }
    return [{ id: 'c1', from: 'start', to: 'end' }];
  });

  const addNode = useCallback((type: NodeType, x: number, y: number) => {
    const id = `node-${Date.now()}`;
    const newNode: WorkflowNode = { id, type, label: type, x, y, config: {} };
    setNodes(prev => [...prev, newNode]);
    return id;
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
  }, []);

  // FIX: Added missing return statement.
  return { nodes, connections, addNode, updateNode, deleteNode };
};