
import { WorkflowTask } from '../../types.ts';

export const MOCK_TASKS: WorkflowTask[] = [
    { id: 't1', title: 'File Motion to Dismiss', status: 'Pending', assignee: 'Assoc. Doe', dueDate: '2024-03-15', priority: 'High', caseId: 'C-2024-001' },
    { id: 't2', title: 'Client Intake Meeting', status: 'Done', assignee: 'Partner Alex', dueDate: '2024-03-10', priority: 'Medium', caseId: 'C-2024-004' },
    { id: 't3', title: 'Discovery Deadline', status: 'In Progress', assignee: 'Para. Jenkins', dueDate: '2024-03-22', priority: 'High', caseId: 'C-2024-001' },
    { id: 't4', title: 'Settlement Conference', status: 'Pending', assignee: 'Partner Alex', dueDate: '2024-03-28', priority: 'High', caseId: 'C-2023-892' },
    
    // Estate of H. Smith Tasks
    { 
        id: 't-s1', title: 'Engagement Letter Execution', status: 'Done', assignee: 'Partner Alex', dueDate: '2023-11-20', priority: 'High', caseId: 'C-2024-004',
        relatedModule: 'Documents', actionLabel: 'View Letter'
    },
    { 
        id: 't-s2', title: 'Global Conflict Check', status: 'Done', assignee: 'System', dueDate: '2023-11-16', priority: 'Critical', caseId: 'C-2024-004',
        relatedModule: 'Documents', actionLabel: 'View Report'
    }
];
