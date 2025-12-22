
import { WorkflowTask, TaskId, UserId, CaseId, TaskStatusBackend, TaskPriorityBackend } from '../../types';

const CID = '1:24-cv-01442-LMB-IDD' as CaseId;

export const MOCK_TASKS: WorkflowTask[] = [
    // --- EXISTING MOCK TASKS ---
    { 
      id: 't1' as TaskId, title: 'File Motion to Dismiss', status: TaskStatusBackend.TODO, 
      assignee: 'James Doe', 
      assigneeId: 'usr-assoc-james' as UserId,
      dueDate: '2024-03-15', priority: TaskPriorityBackend.HIGH, 
      caseId: 'C-2024-001' as CaseId 
    },
    { 
      id: 't2' as TaskId, title: 'Client Intake Meeting', status: TaskStatusBackend.COMPLETED, 
      assignee: 'Justin Saadein', 
      assigneeId: 'usr-admin-justin' as UserId,
      dueDate: '2024-03-10', priority: TaskPriorityBackend.MEDIUM, 
      caseId: 'C-2024-004' as CaseId 
    },
    { 
      id: 't3' as TaskId, title: 'Discovery Deadline', status: TaskStatusBackend.IN_PROGRESS, 
      assignee: 'Sarah Jenkins', 
      assigneeId: 'usr-para-sarah' as UserId,
      dueDate: '2024-03-22', priority: TaskPriorityBackend.HIGH, 
      caseId: 'C-2024-001' as CaseId 
    },
    { 
      id: 't4' as TaskId, title: 'Settlement Conference', status: TaskStatusBackend.TODO, 
      assignee: 'Alexandra H.', 
      assigneeId: 'usr-partner-alex' as UserId,
      dueDate: '2024-03-28', priority: TaskPriorityBackend.HIGH, 
      caseId: 'C-2023-892' as CaseId 
    },
    {
      id: 't5' as TaskId, title: 'Review Expert Report', status: TaskStatusBackend.TODO,
      assignee: 'Justin Saadein', 
      assigneeId: 'usr-admin-justin' as UserId,
      dueDate: '2024-04-05', priority: TaskPriorityBackend.MEDIUM, 
      caseId: 'C-2024-001' as CaseId
    },

    // --- NEW: 7-Month Schedule for 1:24-cv-01442-LMB-IDD ---
    
    // Phase 1: Strategy & Pleadings (Month 1: Nov 2024)
    {
        id: 'task-25-01' as TaskId, caseId: CID, title: 'Initial Case Assessment & Strategy',
        status: TaskStatusBackend.COMPLETED, assignee: 'Alexandra H.', priority: TaskPriorityBackend.HIGH,
        dueDate: '2024-11-10', startDate: '2024-11-01', relatedModule: 'Strategy'
    },
    {
        id: 'task-25-02' as TaskId, caseId: CID, title: 'Draft Emergency Motion for Contempt',
        status: TaskStatusBackend.COMPLETED, assignee: 'Justin Saadein', priority: TaskPriorityBackend.CRITICAL,
        dueDate: '2024-11-14', startDate: '2024-11-11', relatedModule: 'Motions',
        dependencies: ['task-25-01' as TaskId]
    },

    // Phase 2: Discovery (Month 2-4: Dec 2024 - Feb 2025)
    {
        id: 'task-25-03' as TaskId, caseId: CID, title: 'Serve Initial Disclosures (Rule 26)',
        status: TaskStatusBackend.COMPLETED, assignee: 'James Doe', priority: TaskPriorityBackend.MEDIUM,
        dueDate: '2024-12-01', startDate: '2024-11-20', relatedModule: 'Discovery'
    },
    {
        id: 'task-25-04' as TaskId, caseId: CID, title: 'Draft First Set of Interrogatories',
        status: TaskStatusBackend.COMPLETED, assignee: 'Sarah Jenkins', priority: TaskPriorityBackend.MEDIUM,
        dueDate: '2024-12-15', startDate: '2024-12-05', relatedModule: 'Discovery'
    },
    {
        id: 'task-25-05' as TaskId, caseId: CID, title: 'Review Defendant Production Vol. 1',
        status: TaskStatusBackend.IN_PROGRESS, assignee: 'Sarah Jenkins', priority: TaskPriorityBackend.HIGH,
        dueDate: '2025-01-15', startDate: '2025-01-05', relatedModule: 'Documents',
        dependencies: ['task-25-04' as TaskId]
    },
    {
        id: 'task-25-06' as TaskId, caseId: CID, title: 'Deposition Prep: Plaintiff',
        status: TaskStatusBackend.TODO, assignee: 'Alexandra H.', priority: TaskPriorityBackend.HIGH,
        dueDate: '2025-02-10', startDate: '2025-02-01', relatedModule: 'Discovery'
    },
    {
        id: 'task-25-07' as TaskId, caseId: CID, title: 'Deposition: Westridge Corp Rep',
        status: TaskStatusBackend.TODO, assignee: 'Alexandra H.', priority: TaskPriorityBackend.HIGH,
        dueDate: '2025-02-20', startDate: '2025-02-20', relatedModule: 'Discovery',
        dependencies: ['task-25-06' as TaskId]
    },

    // Phase 3: Expert Witness (Month 5: Mar 2025)
    {
        id: 'task-25-08' as TaskId, caseId: CID, title: 'Retain Forensic Accountant',
        status: TaskStatusBackend.TODO, assignee: 'Justin Saadein', priority: TaskPriorityBackend.MEDIUM,
        dueDate: '2025-03-05', startDate: '2025-02-25', relatedModule: 'War Room'
    },
    {
        id: 'task-25-09' as TaskId, caseId: CID, title: 'Expert Report Due',
        status: TaskStatusBackend.TODO, assignee: 'Dr. Emily Chen', priority: TaskPriorityBackend.CRITICAL,
        dueDate: '2025-03-25', startDate: '2025-03-10', relatedModule: 'Documents',
        dependencies: ['task-25-08' as TaskId]
    },

    // Phase 4: Pre-Trial Motions (Month 6: Apr 2025)
    {
        id: 'task-25-10' as TaskId, caseId: CID, title: 'Draft Motion for Summary Judgment',
        status: TaskStatusBackend.TODO, assignee: 'James Doe', priority: TaskPriorityBackend.HIGH,
        dueDate: '2025-04-10', startDate: '2025-03-28', relatedModule: 'Motions',
        dependencies: ['task-25-09' as TaskId]
    },
    {
        id: 'task-25-11' as TaskId, caseId: CID, title: 'File Motion In Limine',
        status: TaskStatusBackend.TODO, assignee: 'James Doe', priority: TaskPriorityBackend.MEDIUM,
        dueDate: '2025-04-20', startDate: '2025-04-15', relatedModule: 'Motions'
    },

    // Phase 5: Trial Prep (Month 7: May 2025)
    {
        id: 'task-25-12' as TaskId, caseId: CID, title: 'Final Pre-Trial Conference',
        status: TaskStatusBackend.TODO, assignee: 'Alexandra H.', priority: TaskPriorityBackend.CRITICAL,
        dueDate: '2025-05-15', startDate: '2025-05-15', relatedModule: 'Calendar'
    },
    {
        id: 'task-25-13' as TaskId, caseId: CID, title: 'Submit Jury Instructions',
        status: TaskStatusBackend.TODO, assignee: 'Sarah Jenkins', priority: TaskPriorityBackend.MEDIUM,
        dueDate: '2025-05-20', startDate: '2025-05-10', relatedModule: 'Documents'
    },
    {
        id: 'task-25-14' as TaskId, caseId: CID, title: 'Exhibit Binder Finalization',
        status: TaskStatusBackend.TODO, assignee: 'Paralegal Pool', priority: TaskPriorityBackend.HIGH,
        dueDate: '2025-05-25', startDate: '2025-05-18', relatedModule: 'Exhibits'
    },
    {
        id: 'task-25-15' as TaskId, caseId: CID, title: 'TRIAL COMMENCEMENT',
        status: TaskStatusBackend.TODO, assignee: 'All Staff', priority: TaskPriorityBackend.CRITICAL,
        dueDate: '2025-06-01', startDate: '2025-06-01', relatedModule: 'War Room',
        dependencies: ['task-25-12' as TaskId, 'task-25-14' as TaskId]
    }
];
