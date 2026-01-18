import { BUSINESS_PROCESSES } from "@/api/types/firmProcess";
import { TEMPLATE_LIBRARY } from "@/api/types/workflowTemplates";
import { type CreateTaskDto, TasksApiService } from "@/api/workflow/tasks-api";
import {
  WorkflowApiService,
  type WorkflowTemplate,
} from "@/api/workflow/workflow-api";
import {
  type CasePhase,
  TaskPriorityBackend,
  TaskStatusBackend,
  type WorkflowTask,
  type WorkflowTemplateData,
} from "@/types";
import { delay } from "@/utils/async";
import { StorageUtils } from "@/utils/storage";

class WorkflowRepositoryClass {
  private workflowApi: WorkflowApiService;
  private tasksApi: TasksApiService;

  constructor() {
    this.workflowApi = new WorkflowApiService();
    this.tasksApi = new TasksApiService();
    // console.log("[WorkflowRepository] Initialized with Backend API");
  }

  getProcesses = async () => {
    await delay(100);
    return BUSINESS_PROCESSES;
  };

  getTemplates = async () => {
    try {
      const templates = await this.workflowApi.getTemplates();
      return templates && templates.length > 0
        ? (templates as unknown as WorkflowTemplateData[])
        : TEMPLATE_LIBRARY;
    } catch (error) {
      console.warn(
        "[WorkflowRepository] Error fetching templates from API, using fallback:",
        error,
      );
      return TEMPLATE_LIBRARY;
    }
  };

  getTasks = async (): Promise<WorkflowTask[]> => {
    try {
      return (await this.tasksApi.getAll()) as unknown as WorkflowTask[];
    } catch (error) {
      console.warn(
        "[WorkflowRepository] Error fetching tasks from API:",
        error,
      );
      return [];
    }
  };

  getAnalytics = async () => {
    try {
      const tasks = await this.getTasks();
      const completed = tasks.filter(
        (t) => t.status === TaskStatusBackend.COMPLETED,
      ).length;
      const total = tasks.length;

      const now = new Date();
      const overdue = tasks.filter(
        (t) =>
          t.status !== TaskStatusBackend.COMPLETED &&
          t.dueDate &&
          new Date(t.dueDate) < now,
      ).length;
      const atRisk = tasks.filter((t) => {
        if (t.status === TaskStatusBackend.COMPLETED) return false;
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours < 48;
      }).length;
      const onTrack = Math.max(0, total - completed - overdue - atRisk);
      return {
        completion: [
          { name: "Mon", completed: Math.floor(completed * 0.1) },
          { name: "Tue", completed: Math.floor(completed * 0.2) },
          { name: "Wed", completed: Math.floor(completed * 0.15) },
          { name: "Thu", completed: Math.floor(completed * 0.25) },
          { name: "Fri", completed: Math.floor(completed * 0.3) },
        ],
        status: [
          { name: "On Track", value: onTrack, color: "#10b981" },
          { name: "At Risk", value: atRisk, color: "#f59e0b" },
          { name: "Overdue", value: overdue, color: "#ef4444" },
        ],
      };
    } catch (error) {
      console.warn("[WorkflowRepository] Error fetching analytics:", error);
      return {
        completion: [],
        status: [
          { name: "On Track", value: 0, color: "#10b981" },
          { name: "At Risk", value: 0, color: "#f59e0b" },
          { name: "Overdue", value: 0, color: "#ef4444" },
        ],
      };
    }
  };

  getSettings = async () => {
    const defaultSettings = [
      { label: "Auto-Assign Reviewers", enabled: true },
      { label: "SLA Breach Notifications", enabled: false },
      { label: "Strict Dependency Enforcement", enabled: true },
    ];
    return StorageUtils.get("WORKFLOW_SETTINGS", defaultSettings);
  };

  updateSettings = async (settings: unknown[]) => {
    await delay(50);
    StorageUtils.set("WORKFLOW_SETTINGS", settings);
    return settings;
  };

  saveTemplate = async (template: WorkflowTemplateData) => {
    try {
      if (template.id && !template.id.startsWith("temp-")) {
        return await this.workflowApi.updateTemplate(
          template.id,
          template as unknown as Partial<WorkflowTemplate>,
        );
      } else {
        return await this.workflowApi.createTemplate(
          template as unknown as Omit<
            WorkflowTemplate,
            "id" | "createdAt" | "updatedAt"
          >,
        );
      }
    } catch (error) {
      console.error("[WorkflowRepository] Error saving template:", error);
      throw error;
    }
  };

  getApprovals = async () => {
    try {
      const tasks = await this.getTasks();
      const reviewTasks = tasks.filter(
        (t) => t.status === TaskStatusBackend.BLOCKED,
      );
      return reviewTasks.map((t) => ({
        id: t.id,
        title: t.title,
        requester: t.assignee || "System",
        date:
          t.startDate || t.createdAt || new Date().toISOString().split("T")[0],
        status: TaskStatusBackend.TODO,
        description: t.description || "Approval required for this task.",
        priority:
          t.priority === TaskPriorityBackend.CRITICAL
            ? TaskPriorityBackend.HIGH
            : t.priority === TaskPriorityBackend.HIGH
              ? TaskPriorityBackend.HIGH
              : TaskPriorityBackend.MEDIUM,
      }));
    } catch (error) {
      console.warn("[WorkflowRepository] Error fetching approvals:", error);
      return [];
    }
  };

  deploy = async (templateId: string, context?: { caseId?: string }) => {
    try {
      console.log(`[API] Deploying workflow ${templateId}...`);
      // Start workflow instance via API

      await this.workflowApi.startWorkflow(templateId, context || {});

      if (context?.caseId) {
        return await this.tasksApi.getAll({ caseId: context.caseId });
      }
      return [];
    } catch (error) {
      console.error("[WorkflowRepository] Error deploying workflow:", error);
      throw error;
    }
  };

  deployStrategyToCase = async (
    caseId: string,
    payload: { phases: CasePhase[]; tasks: WorkflowTask[] },
  ) => {
    try {
      if (payload.tasks && payload.tasks.length > 0) {
        await this.tasksApi.createBulk({
          entries: payload.tasks.map(
            (t) => ({ ...t, caseId }) as CreateTaskDto,
          ),
        });
      }
      return { success: true };
    } catch (error) {
      console.error(
        "[WorkflowRepository] Error deploying strategy to case:",
        error,
      );
      return { success: false };
    }
  };

  getAutomations = async () => {
    return [
      {
        id: "auto-1",
        title: "Document Upload Trigger",
        description:
          'IF new document contains "Motion" THEN create task "Review Motion".',
        type: "Trigger",
        module: "Documents",
        target: "Workflow",
        active: true,
        icon: "Zap",
        color: "amber",
      },
      {
        id: "auto-2",
        title: "SLA Breach Warning",
        description:
          'IF "High Priority" task is overdue > 24h THEN notify Senior Partner.',
        type: "Monitor",
        module: "Tasks",
        target: "Notifications",
        icon: "Clock",
        color: "blue",
        active: true,
      },
    ];
  };

  getProcessDetails = async (id: string) => {
    const staticProcess = BUSINESS_PROCESSES.find((p) => p.id === id);
    if (staticProcess) return staticProcess;
    return {
      id,
      name: "Unknown Process",
      description: "Process definition not found.",
      owner: "System",
      triggers: "Manual",
      sla: "N/A",
    };
  };

  runAutomation = async (scope: string) => {
    try {
      await delay(800);
      console.log(`[API] Running automation scope: ${scope}`);
      return { success: true, processed: 10, actions: 0 };
    } catch {
      return { success: false, processed: 0, actions: 0 };
    }
  };

  syncEngine = async () => {
    console.log("[API] Engine synced");
  };

  getEngineDetails = async (id: string, type: "case" | "process") => {
    try {
      await delay(100);
      const tasks = await this.tasksApi.getAll({
        caseId: id,
      });
      const total = tasks?.length || 0;
      const completed =
        tasks?.filter((t) => t.status === TaskStatusBackend.COMPLETED).length ||
        0;
      const entries =
        tasks?.filter((t) => t.status !== TaskStatusBackend.COMPLETED) || [];

      let nextDeadline = "N/A";
      if (entries.length > 0) {
        const dates = entries
          .map((t) => (t.dueDate ? new Date(t.dueDate).getTime() : 0))
          .filter((d) => d > 0)
          .sort((a, b) => a - b);

        if (dates.length > 0) {
          const diff = dates[0]! - Date.now();
          const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
          nextDeadline = days >= 0 ? `${days} Days` : "Overdue";
        }
      }

      return {
        id,
        type,
        status: "Active",
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        tasksTotal: total,
        tasksCompleted: completed,
        nextDeadline: nextDeadline,
        automationRate: "0%",
      };
    } catch (error) {
      console.warn(
        "[WorkflowRepository] Error fetching engine details:",
        error,
      );
      return {
        id,
        type,
        status: "Unknown",
        progress: 0,
        tasksTotal: 0,
        tasksCompleted: 0,
        nextDeadline: "N/A",
        automationRate: "0%",
      };
    }
  };
}

export const WorkflowRepository = new WorkflowRepositoryClass();
