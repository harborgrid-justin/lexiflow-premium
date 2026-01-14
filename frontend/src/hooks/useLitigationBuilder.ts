/**
 * @module hooks/useLitigationBuilder
 * @category Hooks - Litigation
 *
 * Specialized litigation strategy workflow builder with playbook loading.
 * Transforms visual workflow graph into Gantt phases/tasks.
 *
 * @example
 * ```typescript
 * const builder = useLitigationBuilder({ navigateToCaseTab });
 *
 * // Load playbook
 * builder.loadPlaybook(playbook);
 *
 * // Manage nodes
 * builder.addNode('Task', 100, 200, 'Discovery');
 * builder.updateNode(nodeId, { label: 'Updated' });
 * builder.deleteNode(nodeId);
 *
 * // Deploy to case
 * builder.selectCase(caseId);
 * builder.deployToCase();
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useCallback, useState } from "react";

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from "@/services/data/data-service.service";
import { DateCalculationService } from "@/services/infrastructure/dateCalculationService";
import { GraphValidationService } from "@/services/search/graph-validation.service";
import { queryKeys } from "@/utils/query-keys.service";
import { useMutation, useQuery } from "./useQueryHooks";

// Hooks & Context
import { useAutoSave } from "./useAutoSave";
import { useNotify } from "./useNotify";

// Utils & Constants
import {
  CANVAS_CONSTANTS,
  VALIDATION_MESSAGES,
} from "@/types/canvas-constants";
import { Playbook } from "@/types/playbook";
import {
  LITIGATION_PORTS,
  NodeType,
  TypedWorkflowNode,
  WorkflowConnection,
  WorkflowNode,
} from "@/types/workflow-types";

// Types - Direct imports to avoid barrel export overhead
import type {
  Case,
  CaseId,
  CasePhase,
  TaskId,
  WorkflowTask,
} from "@/types/models";
import { TaskPriorityBackend, TaskStatusBackend } from "@/types/workflow";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Props for useLitigationBuilder hook
 */
interface UseLitigationBuilderProps {
  /** Navigate to case tab after deployment */
  navigateToCaseTab: (caseId: string, tab: string) => void;
}

/**
 * Return type for useLitigationBuilder hook
 */
export interface UseLitigationBuilderReturn {
  /** Workflow nodes */
  nodes: WorkflowNode[];
  /** Set nodes */
  setNodes: (nodes: WorkflowNode[]) => void;
  /** Workflow connections */
  connections: WorkflowConnection[];
  /** Set connections */
  setConnections: (connections: WorkflowConnection[]) => void;
  /** Selected case ID */
  selectedCaseId: string | null;
  /** Set selected case ID */
  setSelectedCaseId: (caseId: string | null) => void;
  /** Select case */
  selectCase: (caseId: string | null) => void;
  /** Validation errors */
  validationErrors: string[];
  /** All cases */
  cases: Case[];
  /** Deploy to case */
  deployToCase: () => void;
  /** Whether deploying */
  isDeploying: boolean;
  /** Load playbook */
  loadPlaybook: (playbook: Playbook) => void;
  /** Clear canvas */
  clearCanvas: () => void;
  /** Add node */
  addNode: (type: NodeType, x: number, y: number, label?: string) => string;
  /** Update node */
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  /** Delete node */
  deleteNode: (id: string) => void;
  /** Add connection */
  addConnection: (from: string, to: string, fromPort?: string) => void;
  /** Update connection */
  updateConnection: (id: string, updates: Partial<WorkflowConnection>) => void;
  /** Delete connection */
  deleteConnection: (id: string) => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Litigation strategy workflow builder.
 *
 * @param props - Configuration options
 * @returns Object with workflow builder state and operations
 */
export function useLitigationBuilder({
  navigateToCaseTab,
}: UseLitigationBuilderProps): UseLitigationBuilderReturn {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: "start", type: "Start", label: "Start", x: 50, y: 200, config: {} },
    { id: "end", type: "End", label: "End", x: 550, y: 200, config: {} },
  ]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([
    { id: "c1", from: "start", to: "end" },
  ]);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const notify = useNotify();

  const { data: cases = [] } = useQuery<Case[]>(queryKeys.cases.all(), () =>
    DataService.cases.getAll()
  );

  // Auto-save draft to localStorage
  useAutoSave({
    data: { nodes, connections, selectedCaseId },
    onSave: async (data) => {
      localStorage.setItem("litigation-strategy-draft", JSON.stringify(data));
    },
    delay: CANVAS_CONSTANTS.AUTOSAVE_DEBOUNCE_MS,
    enabled: true,
  });

  const { mutate: deploy, isLoading: isDeploying } = useMutation(
    async (payload: {
      caseId: string;
      phases: CasePhase[];
      tasks: WorkflowTask[];
    }) => {
      // Use WorkflowRepository directly as this method isn't in the API service yet
      const WorkflowRepository =
        await import("../services/data/repositories/WorkflowRepository").then(
          (m) => m.WorkflowRepository
        );
      return WorkflowRepository.deployStrategyToCase(payload.caseId, {
        phases: payload.phases,
        tasks: payload.tasks,
      });
    },
    {
      onSuccess: (
        _data: unknown,
        variables: {
          caseId: string;
          phases: CasePhase[];
          tasks: WorkflowTask[];
        }
      ) => {
        notify.success("Strategy deployed to case plan!");
        setValidationErrors([]);
        navigateToCaseTab(variables.caseId, "Planning");
      },
      onError: () => {
        notify.error("Failed to deploy strategy.");
      },
    }
  );

  const deployToCase = useCallback(() => {
    if (!selectedCaseId) {
      notify.warning(VALIDATION_MESSAGES.MISSING_CASE_SELECTION);
      return;
    }

    // Validate graph before deployment
    const validation = GraphValidationService.validateGraph(
      nodes as TypedWorkflowNode[],
      connections
    );

    if (!validation.isValid) {
      setValidationErrors(validation.errors.map((e) => e.message));
      if (validation.errors[0]) {
        notify.error(`Cannot deploy: ${validation.errors[0].message}`);
      }
      return;
    }

    if (validation.warnings.length > 0 && validation.warnings[0]) {
      notify.warning(`Warning: ${validation.warnings[0].message}`);
    }

    // --- Transformation Logic ---
    const ganttPhases: CasePhase[] = [];
    const ganttTasks: WorkflowTask[] = [];
    const today = new Date();
    const minX = nodes.length > 0 ? Math.min(...nodes.map((n) => n.x)) : 0;

    nodes.forEach((node) => {
      if (node.type === "Phase") {
        ganttPhases.push({
          id: node.id,
          caseId: selectedCaseId as CaseId,
          name: node.label,
          startDate: "",
          duration: 0,
          status: "Active",
          color: "bg-indigo-500",
        });
      } else if (
        node.type !== "Comment" &&
        node.type !== "Start" &&
        node.type !== "End"
      ) {
        const startDate = DateCalculationService.calculateStartDateFromPosition(
          node.x,
          CANVAS_CONSTANTS.PIXELS_PER_DAY,
          minX,
          today
        );
        const durationDays =
          node.type === "Decision"
            ? CANVAS_CONSTANTS.DECISION_DURATION
            : node.type === "Event"
              ? CANVAS_CONSTANTS.EVENT_DURATION
              : CANVAS_CONSTANTS.DEFAULT_TASK_DURATION;
        const dueDate = DateCalculationService.calculateDueDate(
          startDate,
          durationDays
        );

        ganttTasks.push({
          id: node.id as TaskId,
          caseId: selectedCaseId as CaseId,
          title: node.label,
          startDate: DateCalculationService.formatToISO(startDate),
          dueDate: DateCalculationService.formatToISO(dueDate),
          status: TaskStatusBackend.TODO,
          assignee:
            typeof node.config.assignee === "string"
              ? node.config.assignee
              : "Unassigned",
          priority: TaskPriorityBackend.MEDIUM,
          dependencies: connections
            .filter((c) => c.to === node.id)
            .map((c) => c.from as TaskId),
        });
      }
    });

    deploy({ caseId: selectedCaseId, phases: ganttPhases, tasks: ganttTasks });
  }, [selectedCaseId, nodes, connections, deploy, notify]);

  const loadFromPlaybook = useCallback((playbook: Playbook) => {
    const newNodes: WorkflowNode[] = [];
    const newConnections: WorkflowConnection[] = [];

    newNodes.push({
      id: "start",
      type: "Start",
      label: "Start",
      x: 50,
      y: 400,
      config: {},
    });

    playbook.stages.forEach((stage, idx) => {
      const stageNodeId = `phase-${idx}`;
      newNodes.push({
        id: stageNodeId,
        type: "Phase",
        label: stage.name,
        x: 50 + (idx + 1) * 350 - 150,
        y: 150,
        width: 300,
        height: 500,
        config: { description: `Duration: ${stage.duration}` },
      });

      let lastTaskInPhaseId: string | null = null;
      stage.criticalTasks.forEach((task, taskIdx) => {
        const taskId = `task-${idx}-${taskIdx}`;
        newNodes.push({
          id: taskId,
          type: "Task",
          label: task,
          x: 50 + (idx + 1) * 350,
          y: 200 + taskIdx * 120,
          parentId: stageNodeId,
          config: {},
        });
        if (lastTaskInPhaseId) {
          newConnections.push({
            id: `c-${lastTaskInPhaseId}-${taskId}`,
            from: lastTaskInPhaseId,
            to: taskId,
          });
        }
        lastTaskInPhaseId = taskId;
      });
    });

    setNodes(newNodes);
    setConnections(newConnections);
  }, []);

  const addNode = useCallback(
    (type: NodeType, x: number, y: number, label?: string): string => {
      const id = `node-${Date.now()}`;
      const nodeLabel = label || type;
      const newNode: WorkflowNode = {
        id,
        type,
        label: nodeLabel,
        x,
        y,
        config: {},
      };

      if (type === "Decision") {
        newNode.ports =
          LITIGATION_PORTS[nodeLabel] || LITIGATION_PORTS["Default"];
      }

      setNodes((prev) => [...prev, newNode]);
      return id;
    },
    []
  );

  const updateNode = useCallback(
    (id: string, updates: Partial<WorkflowNode>) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
      );
    },
    []
  );

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
  }, []);

  const addConnection = useCallback(
    (from: string, to: string, fromPort?: string) => {
      const newConnection: WorkflowConnection = {
        id: `conn-${Date.now()}`,
        from,
        to,
        fromPort,
        toPort: "input",
      };
      setConnections((prev) => [...prev, newConnection]);
    },
    []
  );

  const updateConnection = useCallback(
    (id: string, updates: Partial<WorkflowConnection>) => {
      setConnections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    []
  );

  const deleteConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCanvas = useCallback(() => {
    setNodes([
      { id: "start", type: "Start", label: "Start", x: 50, y: 200, config: {} },
      { id: "end", type: "End", label: "End", x: 550, y: 200, config: {} },
    ]);
    setConnections([{ id: "c1", from: "start", to: "end" }]);
  }, []);

  const selectCase = useCallback((caseId: string | null) => {
    setSelectedCaseId(caseId);
  }, []);

  return {
    nodes,
    setNodes,
    connections,
    setConnections,
    selectedCaseId,
    setSelectedCaseId,
    selectCase,
    validationErrors,
    cases,
    deployToCase,
    isDeploying,
    loadPlaybook: loadFromPlaybook,
    clearCanvas,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    updateConnection,
    deleteConnection,
  };
}
