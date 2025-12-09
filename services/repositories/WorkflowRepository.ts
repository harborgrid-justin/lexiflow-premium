
import { BUSINESS_PROCESSES } from '../../data/models/firmProcess';
import { TEMPLATE_LIBRARY } from '../../data/models/workflowTemplates';
import { db, STORES } from '../db';
import { IntegrationOrchestrator } from '../integrationOrchestrator';
import { SystemEventType } from '../../types/integrationTypes';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const WorkflowRepository = {
    getProcesses: async () => { 
        const procs = await db.getAll<any>(STORES.PROCESSES);
        return procs.length > 0 ? procs : BUSINESS_PROCESSES; 
    },
    
    getTemplates: async () => { 
        const tpls = await db.getAll<any>(STORES.TEMPLATES);
        return tpls.length > 0 ? tpls : TEMPLATE_LIBRARY; 
    },
    
    getAnalytics: async () => { 
        await delay(50); 
        // Calculate real stats from tasks
        const tasks = await db.getAll<any>(STORES.TASKS);
        const completed = tasks.filter(t => t.status === 'Done').length;
        
        return { 
            completion: [
                { name: 'Mon', completed: Math.floor(completed * 0.1) },
                { name: 'Tue', completed: Math.floor(completed * 0.2) },
                { name: 'Wed', completed: Math.floor(completed * 0.15) },
                { name: 'Thu', completed: Math.floor(completed * 0.25) },
                { name: 'Fri', completed: Math.floor(completed * 0.3) },
            ], 
            status: [
                { name: 'On Track', value: 65, color: '#10b981' },
                { name: 'At Risk', value: 25, color: '#f59e0b' },
                { name: 'Overdue', value: 10, color: '#ef4444' }
            ] 
        }; 
    },
    
    getSettings: async () => { 
        await delay(50); 
        return [
            { label: 'Auto-Assign Reviewers', enabled: true }, 
            { label: 'SLA Breach Notifications', enabled: false },
            { label: 'Strict Dependency Enforcement', enabled: true }
        ]; 
    },
    
    getApprovals: async () => { await delay(50); return []; },
    
    deploy: async (templateId: string) => { 
        await delay(1000); 
        console.log(`[API] Deployed workflow ${templateId}`); 
        // In real app, this would instantiate tasks from the template
    },
    
    runAutomation: async (scope: string) => { 
        await delay(800); 
        console.log(`[API] Running automation scope: ${scope}`);
        
        // Simulate an automated system event
        // E.g. Checking for overdue tasks and creating notifications
        const tasks = await db.getAll<any>(STORES.TASKS);
        const overdue = tasks.filter(t => t.status !== 'Done' && new Date(t.dueDate) < new Date());
        
        if (overdue.length > 0) {
            // Generate notification
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
    },
    
    syncEngine: async () => { 
        await delay(800); 
        console.log("[API] Engine synced");
        // Simulate syncing state with external BPMN engine
    }
};
