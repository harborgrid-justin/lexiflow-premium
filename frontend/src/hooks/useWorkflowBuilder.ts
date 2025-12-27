/**
 * @module hooks/useWorkflowBuilder
 * @category Hooks - Workflow
 * @description Generic workflow builder hook managing nodes, connections, and visual graph structure. Supports
 * template initialization (converts stage list to node graph), node CRUD (add/update/delete with type-specific
 * config like decision ports), and connection CRUD with self-connection prevention and duplicate detection.
 * Provides base workflow building capabilities for all workflow types (not litigation-specific).
 * 
 * NO THEME USAGE: Business logic hook for workflow graph building
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Utils & Constants
import { WorkflowNode, WorkflowConnection, NodeType, LITIGATION_PORTS } from '@/types/workflow-types';

// Types
import { WorkflowTemplateData } from '@/types';

// ============================================================================
// HOOK
// ============================================================================
export const useWorkflowBuilder = (initialTemplate?: WorkflowTemplateData | null) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(() => {
    if (initialTemplate) {
      const generatedNodes: WorkflowNode[] = [{ id: 'start', type: 'Start', label: 'Start', x: 50, y: 300, config: {} }];
      initialTemplate.stages.forEach((stage, idx) => {
        generatedNodes.push({
          id: `n-${idx}`, type: 'Task', label: stage, x: 50 + ((idx + 1) * 220), y: 300,
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

  const addNode = useCallback((type: NodeType, x: number, y: number, label?: string) => {
    const id = `node-${Date.now()}`;
    const nodeLabel = label || type;
    const newNode: WorkflowNode = { id, type, label: nodeLabel, x, y, config: {} };

    if (type === 'Decision') {
        newNode.ports = LITIGATION_PORTS[nodeLabel] || LITIGATION_PORTS['Default'];
    }

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

  const addConnection = useCallback((from: string, to: string, fromPort?: string) => {
    if (from === to) {
        console.warn("Cannot connect a node to itself.");
        return;
    }
    const exists = connections.some(c => c.from === from && c.to === to && c.fromPort === fromPort);
    if (exists) {
        console.warn("Connection already exists.");
        return;
    }

    const id = `conn-${Date.now()}`;
    const newConnection: WorkflowConnection = { id, from, to, fromPort, toPort: 'input' };

    const fromNode = nodes.find(n => n.id === from);
    if (fromNode && fromPort) {
        const port = fromNode.ports?.find(p => p.id === fromPort);
        if (port) {
            newConnection.label = port.label;
        }
    }

    setConnections(prev => [...prev, newConnection]);
  }, [nodes, connections]);

  const updateConnection = useCallback((id: string, updates: Partial<WorkflowConnection>) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);
  
  const deleteConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  }, []);

  return { nodes, connections, addNode, updateNode, deleteNode, addConnection, updateConnection, deleteConnection };
};
