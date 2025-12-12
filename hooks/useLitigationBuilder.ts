import { useState, useCallback } from 'react';
import { WorkflowNode, WorkflowConnection, NodeType, LITIGATION_PORTS } from '../components/workflow/builder/types';
import { Playbook } from '../data/mockLitigationPlaybooks';
import { useQuery, useMutation } from '../services/queryClient';
import { DataService } from '../services/dataService';
import { STORES } from '../services/db';
import { Case, CasePhase, WorkflowTask, CaseId, TaskId } from '../types';
import { useNotify } from './useNotify';

interface UseLitigationBuilderProps {
  navigateToCaseTab: (caseId: string, tab: string) => void;
}

// This is a specialized version of useWorkflowBuilder for the Litigation module
export const useLitigationBuilder = ({ navigateToCaseTab }: UseLitigationBuilderProps) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: 'start', type: 'Start', label: 'Start', x: 50, y: 200, config: {} },
    { id: 'end', type: 'End', label: 'End', x: 550, y: 200, config: {} },
  ]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([
    { id: 'c1', from: 'start', to: 'end' }
  ]);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const notify = useNotify();

  const { data: cases = [] } = useQuery<Case[]>([STORES.CASES, 'all'], DataService.cases.getAll);
  
  const { mutate: deploy, isLoading: isDeploying } = useMutation(
    (payload: { caseId: string; phases: CasePhase[]; tasks: WorkflowTask[] }) => 
        DataService.workflow.deployStrategyToCase(payload.caseId, { phases: payload.phases, tasks: payload.tasks }),
    {
        onSuccess: (_, variables) => {
            notify.success('Strategy deployed to case plan!');
            navigateToCaseTab(variables.caseId, 'Planning');
        },
        onError: () => notify.error('Failed to deploy strategy.')
    }
  );

  const deployToCase = useCallback(() => {
      if (!selectedCaseId) {
          notify.warning("Please select a target case first.");
          return;
      }

      // --- Transformation Logic ---
      const ganttPhases: CasePhase[] = [];
      const ganttTasks: WorkflowTask[] = [];
      const today = new Date();
      const minX = nodes.length > 0 ? Math.min(...nodes.map(n => n.x)) : 0;

      nodes.forEach(node => {
          if (node.type === 'Phase') {
              ganttPhases.push({
                  id: node.id,
                  caseId: selectedCaseId as CaseId,
                  name: node.label,
                  startDate: '', duration: 0, status: 'Active', color: 'bg-indigo-500'
              });
          } else if (node.type !== 'Comment' && node.type !== 'Start' && node.type !== 'End') {
              const startOffsetDays = Math.max(0, Math.floor((node.x - minX) / 20));
              const startDate = new Date(today);
              startDate.setDate(today.getDate() + startOffsetDays);
              const durationDays = node.type === 'Decision' ? 14 : node.type === 'Event' ? 1 : 7;
              const dueDate = new Date(startDate);
              dueDate.setDate(startDate.getDate() + durationDays);
              
              ganttTasks.push({
                  id: node.id as TaskId,
                  caseId: selectedCaseId as CaseId,
                  title: node.label,
                  startDate: startDate.toISOString().split('T')[0],
                  dueDate: dueDate.toISOString().split('T')[0],
                  status: 'Pending',
                  assignee: node.config.assignee || 'Unassigned',
                  priority: 'Medium',
                  dependencies: connections.filter(c => c.to === node.id).map(c => c.from as TaskId)
              });
          }
      });
      
      deploy({ caseId: selectedCaseId, phases: ganttPhases, tasks: ganttTasks });

  }, [selectedCaseId, nodes, connections, deploy, notify, navigateToCaseTab]);

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
    addConnection, updateConnection, deleteConnection, loadFromPlaybook,
    cases,
    selectedCaseId,
    setSelectedCaseId,
    deployToCase,
    isDeploying
  };
};