import { useState, useCallback } from 'react';
import { WorkflowNode, WorkflowConnection, NodeType, Port } from '../components/workflow/builder/types';
import { Playbook } from '../data/mockLitigationPlaybooks';

// FIX: Define LITIGATION_PORTS locally to resolve the import error.
// The constant was previously imported from a file that did not export it.
const LITIGATION_PORTS: Record<string, Port[]> = {
    'Rule 12(b)(6)': [{ id: 'granted', label: 'Granted' }, { id: 'denied', label: 'Denied' }],
    'Rule 56': [{ id: 'granted', label: 'Granted' }, { id: 'denied', label: 'Denied' }],
    'Motion in Limine': [{ id: 'granted', label: 'Granted' }, { id: 'denied', label: 'Denied' }],
    'Default': [{ id: 'success', label: 'Success' }, { id: 'failure', label: 'Failure' }],
};

// This is a specialized version of useWorkflowBuilder for the Litigation module
export const useLitigationBuilder = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: 'start', type: 'Start', label: 'Start', x: 50, y: 200, config: {} },
    { id: 'end', type: 'End', label: 'End', x: 550, y: 200, config: {} },
  ]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([
    { id: 'c1', from: 'start', to: 'end' }
  ]);

  const loadFromPlaybook = useCallback((playbook: Playbook) => {
    const newNodes: WorkflowNode[] = [];
    const newConnections: WorkflowConnection[] = [];

    newNodes.push({ id: 'start', type: 'Start', label: 'Start', x: 50, y: 400, config: {} });
    
    let lastNodeId = 'start';
    let yOffset = 400;

    playbook.stages.forEach((stage, idx) => {
      const stageNodeId = `phase-${idx}`;
      newNodes.push({
        id: stageNodeId,
        type: 'Phase',
        label: stage.name,
        x: 50 + ((idx + 1) * 350) - 150,
        y: 150,
        width: 300,
        height: 500,
        config: { description: `Duration: ${stage.duration}` }
      });

      let lastTaskInPhaseId: string | null = null;
      stage.criticalTasks.forEach((task, taskIdx) => {
          const taskId = `task-${idx}-${taskIdx}`;
          newNodes.push({
              id: taskId,
              type: 'Task',
              label: task,
              x: 50 + ((idx + 1) * 350),
              y: 200 + (taskIdx * 120),
              parentId: stageNodeId,
              config: {}
          });
          if (lastTaskInPhaseId) {
             newConnections.push({ id: `c-${lastTaskInPhaseId}-${taskId}`, from: lastTaskInPhaseId, to: taskId });
          }
          lastTaskInPhaseId = taskId;
      });
    });
    
    setNodes(newNodes);
    setConnections(newConnections);

  }, []);

  const addNode = useCallback((type: NodeType, x: number, y: number, label?: string): string => {
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
    const newConnection: WorkflowConnection = { id: `conn-${Date.now()}`, from, to, fromPort, toPort: 'input' };
    setConnections(prev => [...prev, newConnection]);
  }, []);
  
  const updateConnection = useCallback((id: string, updates: Partial<WorkflowConnection>) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);
  
  const deleteConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    nodes, connections, addNode, updateNode, deleteNode, 
    addConnection, updateConnection, deleteConnection, loadFromPlaybook
  };
};