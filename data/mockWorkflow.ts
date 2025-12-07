import { WorkflowStage } from '../types';
import { WorkflowTask } from '../types';

export const MOCK_STAGES: WorkflowStage[] = [
    {
        id: 'stage-1',
        title: 'Case Intake & Conflicts',
        status: 'Completed',
        tasks: [
            {
                id: 't1', title: 'Global Conflict Check', status: 'Done', assignee: 'System', dueDate: '2023-11-16', priority: 'High',
                description: 'Run automated conflict search against new parties.', automatedTrigger: 'New Party Added',
                relatedModule: 'Documents', actionLabel: 'View Report'
            },
            {
                id: 't1-2', title: 'Engagement Letter Execution', status: 'Done', assignee: 'Partner Alex', dueDate: '2023-11-20', priority: 'High',
                relatedModule: 'Documents', actionLabel: 'View Signed Doc'
            }
        ]
    },
    {
        id: 'stage-2',
        title: 'Discovery Phase',
        status: 'Active',
        tasks: [
            {
                id: 't2', title: 'Review Plaintiff Production', status: 'In Progress', assignee: 'Assoc. Doe', dueDate: '2024-04-01', priority: 'High',
                description: 'Analyze incoming production set for "smoking gun" documents.',
                relatedModule: 'Discovery', actionLabel: 'Open Review Platform'
            },
            {
                id: 't3', title: 'Schedule CEO Deposition', status: 'Pending', assignee: 'Para. Jenkins', dueDate: '2024-04-15', priority: 'Medium',
                description: 'Coordinate with opposing counsel for dates.',
                relatedModule: 'Motions', actionLabel: 'Draft Notice'
            },
            {
                id: 't4', title: 'Privilege Log Review', status: 'Pending', assignee: 'Assoc. Doe', dueDate: '2024-03-25', priority: 'High',
                description: 'Review withheld documents for proper privilege assertion.',
                relatedModule: 'Discovery', actionLabel: 'Go to Log'
            }
        ]
    },
    {
        id: 'stage-3',
        title: 'Motion Practice',
        status: 'Pending',
        tasks: [
            {
                id: 't5', title: 'Draft Motion for Summary Judgment', status: 'Pending', assignee: 'Senior Partner', dueDate: '2024-05-10', priority: 'High',
                description: 'Prepare MSJ based on lack of causation evidence.',
                relatedModule: 'Motions', actionLabel: 'Start Draft'
            }
        ]
    }
];
export const MOCK_TASKS: WorkflowTask[] = [
    // --- EXISTING MOCK TASKS ---
    {
        id: 't1', title: 'File Motion to Dismiss', status: 'Pending',
        assignee: 'James Doe', assigneeId: 'usr-assoc-james',
        dueDate: '2024-03-15', priority: 'High', caseId: 'C-2024-001'
    },
    {
        id: 't2', title: 'Client Intake Meeting', status: 'Done',
        assignee: 'Justin Saadein', assigneeId: 'usr-admin-justin',
        dueDate: '2024-03-10', priority: 'Medium', caseId: 'C-2024-004'
    },
    {
        id: 't3', title: 'Discovery Deadline', status: 'In Progress',
        assignee: 'Sarah Jenkins', assigneeId: 'usr-para-sarah',
        dueDate: '2024-03-22', priority: 'High', caseId: 'C-2024-001'
    },
    {
        id: 't4', title: 'Settlement Conference', status: 'Pending',
        assignee: 'Alexandra H.', assigneeId: 'usr-partner-alex',
        dueDate: '2024-03-28', priority: 'High', caseId: 'C-2023-892'
    },
    {
        id: 't5', title: 'Review Expert Report', status: 'Pending',
        assignee: 'Justin Saadein', assigneeId: 'usr-admin-justin',
        dueDate: '2024-04-05', priority: 'Medium', caseId: 'C-2024-001'
    },

    // --- NEW: 7-Month Schedule for 1:24-cv-01442-LMB-IDD ---

    // Phase 1: Strategy & Pleadings (Month 1: Nov 2024)
    {
        id: 'task-25-01', caseId: '1:24-cv-01442-LMB-IDD', title: 'Initial Case Assessment & Strategy',
        status: 'Done', assignee: 'Alexandra H.', priority: 'High',
        dueDate: '2024-11-10', startDate: '2024-11-01', relatedModule: 'Strategy'
    },
    {
        id: 'task-25-02', caseId: '1:24-cv-01442-LMB-IDD', title: 'Draft Emergency Motion for Contempt',
        status: 'Done', assignee: 'Justin Saadein', priority: 'Critical',
        dueDate: '2024-11-14', startDate: '2024-11-11', relatedModule: 'Motions',
        dependencies: ['task-25-01']
    },

    // Phase 2: Discovery (Month 2-4: Dec 2024 - Feb 2025)
    {
        id: 'task-25-03', caseId: '1:24-cv-01442-LMB-IDD', title: 'Serve Initial Disclosures (Rule 26)',
        status: 'Completed', assignee: 'James Doe', priority: 'Medium',
        dueDate: '2024-12-01', startDate: '2024-11-20', relatedModule: 'Discovery'
    },
    {
        id: 'task-25-04', caseId: '1:24-cv-01442-LMB-IDD', title: 'Draft First Set of Interrogatories',
        status: 'Done', assignee: 'Sarah Jenkins', priority: 'Medium',
        dueDate: '2024-12-15', startDate: '2024-12-05', relatedModule: 'Discovery'
    },
    {
        id: 'task-25-05', caseId: '1:24-cv-01442-LMB-IDD', title: 'Review Defendant Production Vol. 1',
        status: 'In Progress', assignee: 'Sarah Jenkins', priority: 'High',
        dueDate: '2025-01-15', startDate: '2025-01-05', relatedModule: 'Documents',
        dependencies: ['task-25-04']
    },
    {
        id: 'task-25-06', caseId: '1:24-cv-01442-LMB-IDD', title: 'Deposition Prep: Plaintiff',
        status: 'Pending', assignee: 'Alexandra H.', priority: 'High',
        dueDate: '2025-02-10', startDate: '2025-02-01', relatedModule: 'Discovery'
    },
    {
        id: 'task-25-07', caseId: '1:24-cv-01442-LMB-IDD', title: 'Deposition: Westridge Corp Rep',
        status: 'Pending', assignee: 'Alexandra H.', priority: 'High',
        dueDate: '2025-02-20', startDate: '2025-02-20', relatedModule: 'Discovery',
        dependencies: ['task-25-06']
    },

    // Phase 3: Expert Witness (Month 5: Mar 2025)
    {
        id: 'task-25-08', caseId: '1:24-cv-01442-LMB-IDD', title: 'Retain Forensic Accountant',
        status: 'Pending', assignee: 'Justin Saadein', priority: 'Medium',
        dueDate: '2025-03-05', startDate: '2025-02-25', relatedModule: 'War Room'
    },
    {
        id: 'task-25-09', caseId: '1:24-cv-01442-LMB-IDD', title: 'Expert Report Due',
        status: 'Pending', assignee: 'Dr. Emily Chen', priority: 'Critical',
        dueDate: '2025-03-25', startDate: '2025-03-10', relatedModule: 'Documents',
        dependencies: ['task-25-08']
    },

    // Phase 4: Pre-Trial Motions (Month 6: Apr 2025)
    {
        id: 'task-25-10', caseId: '1:24-cv-01442-LMB-IDD', title: 'Draft Motion for Summary Judgment',
        status: 'Pending', assignee: 'James Doe', priority: 'High',
        dueDate: '2025-04-10', startDate: '2025-03-28', relatedModule: 'Motions',
        dependencies: ['task-25-09']
    },
    {
        id: 'task-25-11', caseId: '1:24-cv-01442-LMB-IDD', title: 'File Motion In Limine',
        status: 'Pending', assignee: 'James Doe', priority: 'Medium',
        dueDate: '2025-04-20', startDate: '2025-04-15', relatedModule: 'Motions'
    },

    // Phase 5: Trial Prep (Month 7: May 2025)
    {
        id: 'task-25-12', caseId: '1:24-cv-01442-LMB-IDD', title: 'Final Pre-Trial Conference',
        status: 'Pending', assignee: 'Alexandra H.', priority: 'Critical',
        dueDate: '2025-05-15', startDate: '2025-05-15', relatedModule: 'Calendar'
    },
    {
        id: 'task-25-13', caseId: '1:24-cv-01442-LMB-IDD', title: 'Submit Jury Instructions',
        status: 'Pending', assignee: 'Sarah Jenkins', priority: 'Medium',
        dueDate: '2025-05-20', startDate: '2025-05-10', relatedModule: 'Documents'
    },
    {
        id: 'task-25-14', caseId: '1:24-cv-01442-LMB-IDD', title: 'Exhibit Binder Finalization',
        status: 'Pending', assignee: 'Paralegal Pool', priority: 'High',
        dueDate: '2025-05-25', startDate: '2025-05-18', relatedModule: 'Exhibits'
    },
    {
        id: 'task-25-15', caseId: '1:24-cv-01442-LMB-IDD', title: 'TRIAL COMMENCEMENT',
        status: 'Pending', assignee: 'All Staff', priority: 'Critical',
        dueDate: '2025-06-01', startDate: '2025-06-01', relatedModule: 'War Room',
        dependencies: ['task-25-12', 'task-25-14']
    }
];