
import { BUSINESS_PROCESSES } from '../../data/models/firmProcess';
import { TEMPLATE_LIBRARY } from '../../data/workflowTemplates';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const WorkflowRepository = {
    getProcesses: async () => { await delay(50); return BUSINESS_PROCESSES; },
    getTemplates: async () => { await delay(50); return TEMPLATE_LIBRARY; },
    getAnalytics: async () => { await delay(50); return { completion: [], status: [] }; },
    getSettings: async () => { await delay(50); return [{ label: 'Auto-Assign Reviewers', enabled: true }, { label: 'SLA Breach Notifications', enabled: false }]; },
    getApprovals: async () => { await delay(50); return []; },
    deploy: async (templateId: string) => { await delay(2000); console.log(`[API] Deployed workflow ${templateId}`); },
    runAutomation: async (id: string) => { await delay(1000); console.log(`[API] Running automation ${id}`); },
    syncEngine: async () => { await delay(800); console.log("[API] Engine synced"); }
};
