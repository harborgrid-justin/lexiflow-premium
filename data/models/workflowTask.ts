


import { WorkflowTask, TaskId, UserId, CaseId } from '../../types';

const CID = '1:24-cv-01442-LMB-IDD' as CaseId;

export const MOCK_TASKS: WorkflowTask[] = [
    // --- EXISTING MOCK TASKS ---
    { 
      // FIX: Cast string to branded type TaskId
      id: 't1' as TaskId, title: 'File Motion to Dismiss', status: 'Pending', 
      assignee: 'James Doe', 
      // FIX: Cast string to branded type UserId
      assigneeId: 'usr-assoc-james' as UserId,
      dueDate: '2024-03-15', priority: 'High', 
      // FIX: Cast string to branded type CaseId
      caseId: 'C-2024-001' as CaseId 
    },
    { 
      // FIX: Cast string to branded type TaskId
      id: 't2' as TaskId, title: 'Client Intake Meeting', status: 'Done', 
      assignee: 'Justin Saadein', 
      // FIX: Cast string to branded type UserId
      assigneeId: 'usr-admin-justin' as UserId,
      dueDate: '2024-03-10', priority: 'Medium', 
      // FIX: Cast string to branded type CaseId
      caseId: 'C-2024-004' as CaseId 
    },
    { 
      // FIX: Cast string to branded type TaskId
      id: 't3' as TaskId, title: 'Discovery Deadline', status: 'In Progress', 
      assignee: 'Sarah Jenkins', 
      // FIX: Cast string to branded type UserId
      assigneeId: 'usr-para-sarah' as UserId,
      dueDate: '2024-03-22', priority: 'High', 
      // FIX: Cast string to branded type CaseId
      caseId: 'C-2024-001' as CaseId 
    },
    { 
      // FIX: Cast string to branded type TaskId
      id: 't4' as TaskId, title: 'Settlement Conference', status: 'Pending', 
      assignee: 'Alexandra H.', 
      // FIX: Cast string to branded type UserId
      assigneeId: 'usr-partner-alex' as UserId,
      dueDate: '2024-03-28', priority: 'High', 
      // FIX: Cast string to branded type CaseId
      caseId: 'C-2023-892' as CaseId 
    },
    {
      // FIX: Cast string to branded type TaskId
      id: 't5' as TaskId, title: 'Review Expert Report', status: 'Pending',
      assignee: 'Justin Saadein', 
      // FIX: Cast string to branded type UserId
      assigneeId: 'usr-admin-justin' as UserId,
      dueDate: '2024-04-05', priority: 'Medium', 
      // FIX: Cast string to branded type CaseId
      caseId: 'C-2024-001' as CaseId
    },

    // --- NEW: 7-Month Schedule for 1:24-cv-01442-LMB-IDD ---
    
    // Phase 1: Strategy & Pleadings (Month 1: Nov 2024)
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-01' as TaskId, caseId: CID, title: 'Initial Case Assessment & Strategy',
        status: 'Done', assignee: 'Alexandra H.', priority: 'High',
        dueDate: '2024-11-10', startDate: '2024-11-01', relatedModule: 'Strategy'
    },
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-02' as TaskId, caseId: CID, title: 'Draft Emergency Motion for Contempt',
        status: 'Done', assignee: 'Justin Saadein', priority: 'Critical',
        dueDate: '2024-11-14', startDate: '2024-11-11', relatedModule: 'Motions',
        dependencies: ['task-25-01' as TaskId]
    },

    // Phase 2: Discovery (Month 2-4: Dec 2024 - Feb 2025)
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-03' as TaskId, caseId: CID, title: 'Serve Initial Disclosures (Rule 26)',
        status: 'Completed', assignee: 'James Doe', priority: 'Medium',
        dueDate: '2024-12-01', startDate: '2024-11-20', relatedModule: 'Discovery'
    },
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-04' as TaskId, caseId: CID, title: 'Draft First Set of Interrogatories',
        status: 'Done', assignee: 'Sarah Jenkins', priority: 'Medium',
        dueDate: '2024-12-15', startDate: '2024-12-05', relatedModule: 'Discovery'
    },
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-05' as TaskId, caseId: CID, title: 'Review Defendant Production Vol. 1',
        status: 'In Progress', assignee: 'Sarah Jenkins', priority: 'High',
        dueDate: '2025-01-15', startDate: '2025-01-05', relatedModule: 'Documents',
        dependencies: ['task-25-04' as TaskId]
    },
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-06' as TaskId, caseId: CID, title: 'Deposition Prep: Plaintiff',
        status: 'Pending', assignee: 'Alexandra H.', priority: 'High',
        dueDate: '2025-02-10', startDate: '2025-02-01', relatedModule: 'Discovery'
    },
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-07' as TaskId, caseId: CID, title: 'Deposition: Westridge Corp Rep',
        status: 'Pending', assignee: 'Alexandra H.', priority: 'High',
        dueDate: '2025-02-20', startDate: '2025-02-20', relatedModule: 'Discovery',
        dependencies: ['task-25-06' as TaskId]
    },

    // Phase 3: Expert Witness (Month 5: Mar 2025)
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-08' as TaskId, caseId: CID, title: 'Retain Forensic Accountant',
        status: 'Pending', assignee: 'Justin Saadein', priority: 'Medium',
        dueDate: '2025-03-05', startDate: '2025-02-25', relatedModule: 'War Room'
    },
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-09' as TaskId, caseId: CID, title: 'Expert Report Due',
        status: 'Pending', assignee: 'Dr. Emily Chen', priority: 'Critical',
        dueDate: '2025-03-25', startDate: '2025-03-10', relatedModule: 'Documents',
        dependencies: ['task-25-08' as TaskId]
    },

    // Phase 4: Pre-Trial Motions (Month 6: Apr 2025)
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-10' as TaskId, caseId: CID, title: 'Draft Motion for Summary Judgment',
        status: 'Pending', assignee: 'James Doe', priority: 'High',
        dueDate: '2025-04-10', startDate: '2025-03-28', relatedModule: 'Motions',
        dependencies: ['task-25-09' as TaskId]
    },
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-11' as TaskId, caseId: CID, title: 'File Motion In Limine',
        status: 'Pending', assignee: 'James Doe', priority: 'Medium',
        dueDate: '2025-04-20', startDate: '2025-04-15', relatedModule: 'Motions'
    },

    // Phase 5: Trial Prep (Month 7: May 2025)
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-12' as TaskId, caseId: CID, title: 'Final Pre-Trial Conference',
        status: 'Pending', assignee: 'Alexandra H.', priority: 'Critical',
        dueDate: '2025-05-15', startDate: '2025-05-15', relatedModule: 'Calendar'
    },
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-13' as TaskId, caseId: CID, title: 'Submit Jury Instructions',
        status: 'Pending', assignee: 'Sarah Jenkins', priority: 'Medium',
        dueDate: '2025-05-20', startDate: '2025-05-10', relatedModule: 'Documents'
    },
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-14' as TaskId, caseId: CID, title: 'Exhibit Binder Finalization',
        status: 'Pending', assignee: 'Paralegal Pool', priority: 'High',
        dueDate: '2025-05-25', startDate: '2025-05-18', relatedModule: 'Exhibits'
    },
    {
        // FIX: Cast string to branded type TaskId
        id: 'task-25-15' as TaskId, caseId: CID, title: 'TRIAL COMMENCEMENT',
        status: 'Pending', assignee: 'All Staff', priority: 'Critical',
        dueDate: '2025-06-01', startDate: '2025-06-01', relatedModule: 'War Room',
        dependencies: ['task-25-12' as TaskId, 'task-25-14' as TaskId]
    }
];