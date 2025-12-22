import { BUSINESS_PROCESSES } from '../../../data/models/firmProcess';
import { delay } from '../../../utils/async';
import { TEMPLATE_LIBRARY } from '../../../data/models/workflowTemplates';
import { WorkflowTask, TaskId, WorkflowTemplateData, CaseId, ProjectId, CasePhase } from '../../../types';
import { db, STORES } from '../db';
import { IntegrationOrchestrator } from '../../integration/integrationOrchestrator';
import { SystemEventType } from '../../../types/integration-types';
import { StorageUtils } from '../../../utils/storage';

export const WorkflowRepository = {
    getProcesses: async () => { 
        try {
            const procs = await db.getAll<any>(STORES.PROCESSES);
            return procs.length > 0 ? procs : BUSINESS_PROCESSES;
        } catch (error) {
            console.warn('[WorkflowRepository] Error fetching processes from IndexedDB, using mock data:', error);
            return BUSINESS_PROCESSES;
        }
    },
    
    getTemplates: async () => { 
        try {
            const tpls = await db.getAll<any>(STORES.TEMPLATES);
            return tpls.length > 0 ? tpls : TEMPLATE_LIBRARY;
        } catch (error) {
            console.warn('[WorkflowRepository] Error fetching templates from IndexedDB, using mock data:', error);
            return TEMPLATE_LIBRARY;
        }
    },
    getTasks: async () => {
        try {
            return await db.getAll<WorkflowTask>(STORES.TASKS);
        } catch (error) {
            console.warn('[WorkflowRepository] Error fetching tasks from IndexedDB:', error);
            return [];
        }
    },
    getAnalytics: async () => { 
        await delay(50); 
        try {
            // Calculate real stats from tasks
            const tasks = await db.getAll<WorkflowTask>(STORES.TASKS);
            const completed = tasks.filter(t => t.status === 'Done' || t.status === 'Completed').length;
            const total = tasks.length;
            
            // Calculate status distribution
            const now = new Date();
            const overdue = tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed' && new Date(t.dueDate) < now).length;
            const atRisk = tasks.filter(t => {
                if (t.status === 'Done' || t.status === 'Completed') return false;
                const due = new Date(t.dueDate);
                const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
                return diffHours > 0 && diffHours < 48; // Due within 48 hours
            }).length;
            const onTrack = total - completed - overdue - atRisk;
            return { 
                completion: [
                    { name: 'Mon', completed: Math.floor(completed * 0.1) },
                    { name: 'Tue', completed: Math.floor(completed * 0.2) },
                    { name: 'Wed', completed: Math.floor(completed * 0.15) },
                    { name: 'Thu', completed: Math.floor(completed * 0.25) },
                    { name: 'Fri', completed: Math.floor(completed * 0.3) },
                ], 
                status: [
                    { name: 'On Track', value: Math.max(0, onTrack), color: '#10b981' },
                    { name: 'At Risk', value: atRisk, color: '#f59e0b' },
                    { name: 'Overdue', value: overdue, color: '#ef4444' }
                ] 
            };
        } catch (error) {
            console.warn('[WorkflowRepository] Error fetching analytics:', error);
            return { 
                completion: [], 
                status: [
                    { name: 'On Track', value: 0, color: '#10b981' },
                    { name: 'At Risk', value: 0, color: '#f59e0b' },
                    { name: 'Overdue', value: 0, color: '#ef4444' }
                ] 
            };
        }
    },
    getSettings: async () => { 
        const defaultSettings = [
            { label: 'Auto-Assign Reviewers', enabled: true }, 
            { label: 'SLA Breach Notifications', enabled: false },
            { label: 'Strict Dependency Enforcement', enabled: true }
        ];
        return StorageUtils.get('WORKFLOW_SETTINGS', defaultSettings);
    },
    updateSettings: async (settings: any[]) => {
        await delay(50);
        StorageUtils.set('WORKFLOW_SETTINGS', settings);
        return settings;
    },
    saveTemplate: async (template: WorkflowTemplateData) => {
        await db.put(STORES.TEMPLATES, template);
        return template;
    },
    getApprovals: async () => {
        try {
            const tasks = await db.getAll<WorkflowTask>(STORES.TASKS);
            const reviewTasks = tasks.filter(t => t.status === 'Review');
            return reviewTasks.map(t => ({
                id: t.id,
                title: t.title,
                requester: t.assignee || 'System',
                date: t.startDate || t.createdAt || new Date().toISOString().split('T')[0],
                status: 'Pending',
                description: t.description || 'Approval required for this task.',
                priority: t.priority === 'Critical' ? 'High' : (t.priority === 'High' ? 'High' : 'Medium')
            }));
        } catch (error) {
            console.warn('[WorkflowRepository] Error fetching approvals:', error);
            return [];
        }
    },
    deploy: async (templateId: string, context?: { caseId?: string }) => { 
        try {
            console.log(`[API] Deploying workflow ${templateId}...`);
            const template = await db.get<WorkflowTemplateData>(STORES.TEMPLATES, templateId) 
                            || TEMPLATE_LIBRARY.find(t => t.id === templateId);
            if (!template) throw new Error("Template not found");
            const now = new Date();
            const newTasks: WorkflowTask[] = [];
            // Instantiate tasks from template stages
            template.stages.forEach((stage: string, idx: number) => {
                 const dueDate = new Date(now);
                 dueDate.setDate(dueDate.getDate() + (idx + 1) * 2); // Stagger deadlines
                 const task: WorkflowTask = {
                     id: `t-auto-${Date.now()}-${idx}` as TaskId,
                     title: stage,
                     status: 'Pending',
                     assignee: 'Unassigned',
                     priority: 'Medium',
                     dueDate: dueDate.toISOString().split('T')[0],
                     caseId: context?.caseId as CaseId || 'General' as CaseId,
                     description: `Automated task from template: ${template.title}`,
                     linkedRules: []
                 };
                 newTasks.push(task);
            });
            // Batch insert
            for (const t of newTasks) {
                await db.put(STORES.TASKS, t);
            }
            return newTasks;
        } catch (error) {
            console.error('[WorkflowRepository] Error deploying workflow:', error);
            throw error;
        }
    },
    deployStrategyToCase: async (caseId: string, payload: { phases: CasePhase[], tasks: WorkflowTask[] }) => {
        try {
            // 1. Clear existing generated items for this case
            const [existingPhases, existingTasks] = await Promise.all([
                db.getByIndex<CasePhase>(STORES.PHASES, 'caseId', caseId),
                db.getByIndex<WorkflowTask>(STORES.TASKS, 'caseId', caseId)
            ]);
            for (const phase of existingPhases) {
                await db.delete(STORES.PHASES, phase.id);
            }
            // Only delete auto-generated tasks to avoid wiping manual ones.
            // For this demo, we'll assume all tasks for a case are part of the plan.
            for (const task of existingTasks) {
                await db.delete(STORES.TASKS, task.id);
            }
            // 2. Bulk insert new items
            await db.bulkPut(STORES.PHASES, payload.phases);
            await db.bulkPut(STORES.TASKS, payload.tasks);
            return { success: true };
        } catch (error) {
            console.error('[WorkflowRepository] Error deploying strategy to case:', error);
            return { success: false };
        }
    },
    getAutomations: async () => {
        try {
            // Fetch automation rules from IndexedDB
            const automations = await db.getAll(STORES.WORKFLOW_AUTOMATIONS);
            
            // Return stored automations, or fallback to demo data if none exist
            if (automations.length > 0) {
                return automations;
            }
            
            // Demo/seed data for first-time users
            const demoAutomations = [
            {
                id: 'auto-1',
                title: 'Document Upload Trigger',
                description: 'IF new document contains "Motion" THEN create task "Review Motion".',
                type: 'Trigger',
                module: 'Documents',
                target: 'Workflow',
                active: true,
                icon: 'Zap',
                color: 'amber'
            },
            {
                id: 'auto-2',
                title: 'SLA Breach Warning',
                description: 'IF "High Priority" task is overdue > 24h THEN notify Senior Partner.',
                type: 'Monitor',
                module: 'Tasks',
                target: 'Notifications',
                icon: 'Clock',
                color: 'blue',
                active: true
            }
        ];
        
        return demoAutomations;
        } catch (error) {
            console.warn('[WorkflowRepository] Error fetching automations:', error);
            // Return empty demo data on error
            return [
                {
                    id: 'auto-1',
                    title: 'Document Upload Trigger',
                    description: 'IF new document contains "Motion" THEN create task "Review Motion".',
                    type: 'Trigger',
                    module: 'Documents',
                    target: 'Workflow',
                    active: true,
                    icon: 'Zap',
                    color: 'amber'
                }
            ];
        }
    },
    getProcessDetails: async (id: string) => {
        try {
            const process = await db.get<any>(STORES.PROCESSES, id);
            // If not found in DB, check static list (for demo purposes)
            const staticProcess = BUSINESS_PROCESSES.find(p => p.id === id);
            if (process || staticProcess) {
                return process || staticProcess;
            }
            // Fallback mock if absolutely nothing found (shouldn't happen if list is populated)
            return {
                id,
                name: 'Unknown Process',
                description: 'Process definition not found.',
                owner: 'System',
                triggers: 'Manual',
                sla: 'N/A'
            };
        } catch (error) {
            console.warn('[WorkflowRepository] Error fetching process details:', error);
            return {
                id,
                name: 'Unknown Process',
                description: 'Error loading process details.',
                owner: 'System',
                triggers: 'Manual',
                sla: 'N/A'
            };
        }
    },
    runAutomation: async (scope: string) => { 
        try {
            await delay(800); 
            console.log(`[API] Running automation scope: ${scope}`);
            const tasks = await db.getAll<any>(STORES.TASKS);
            const overdue = tasks.filter(t => t.status !== 'Done' && new Date(t.dueDate) < new Date());
            if (overdue.length > 0) {
                const notif = {
                    id: `notif-auto-${Date.now()}`,
                    text: `Automation Run: Identified ${overdue.length} overdue tasks. Escalations triggered.`,
                    time: new Date().toLocaleTimeString(),
                    read: false,
                    type: 'System'
                };
                await db.put(STORES.NOTIFICATIONS, notif);
            }
            return { success: true, processed: tasks.length, actions: overdue.length };
        } catch (error) {
            console.error('[WorkflowRepository] Error running automation:', error);
            return { success: false, processed: 0, actions: 0 };
        }
    },
    syncEngine: async () => { 
        console.log("[API] Engine synced");
    },
    getEngineDetails: async (id: string, type: 'case' | 'process') => {
        try {
            await delay(100);
            // In a real app, this would fetch the specific workflow instance state.
            // For now, we'll aggregate data from tasks.
            const tasks = await db.getByIndex<WorkflowTask>(STORES.TASKS, 'caseId', id);
            const total = tasks.length;
            const completed = tasks.filter(t => t.status === 'Done').length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            // Mock data for now, but derived from real tasks if available
            return {
                id,
                type,
                status: 'Active',
                progress,
                tasksTotal: total,
                tasksCompleted: completed,
                nextDeadline: '2 Days', // Mock
                automationRate: '85%' // Mock
            };
        } catch (error) {
            console.warn('[WorkflowRepository] Error fetching engine details:', error);
            return {
                id,
                type,
                status: 'Unknown',
                progress: 0,
                tasksTotal: 0,
                tasksCompleted: 0,
                nextDeadline: 'N/A',
                automationRate: '0%'
            };
        }
    },
};

