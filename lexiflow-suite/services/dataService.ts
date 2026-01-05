
import { Case, CasePhase, Project, WorkflowTask, DocketEntry } from '../types.ts';
import { MOCK_CASES } from '../data/mockCases.ts';
import { MOCK_TASKS } from '../data/mockWorkflow.ts';
import { MOCK_DOCKET_ENTRIES } from '../data/mockDocket.ts';

// In-memory store initialized with Mocks (mimicking a DB)
let dbCases: Case[] = [...MOCK_CASES];
let dbTasks: WorkflowTask[] = [...MOCK_TASKS];
let dbDocket: DocketEntry[] = [...MOCK_DOCKET_ENTRIES];

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}`;

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const DataService = {
  cases: {
    getAll: async (): Promise<Case[]> => {
      await delay(200);
      return [...dbCases];
    },
    getById: async (id: string): Promise<Case | undefined> => {
      await delay(100);
      // Case-insensitive ID matching for PACER sync
      return dbCases.find(c => c.id.toLowerCase() === id.toLowerCase());
    },
    create: async (caseData: Partial<Case>): Promise<Case> => {
      await delay(300);
      const newCase = { ...caseData, id: caseData.id || generateId('C') } as Case;
      dbCases = [newCase, ...dbCases];
      return newCase;
    },
    update: async (id: string, updates: Partial<Case>): Promise<Case> => {
      await delay(200);
      dbCases = dbCases.map(c => c.id === id ? { ...c, ...updates } : c);
      return dbCases.find(c => c.id === id) as Case;
    }
  },

  docket: {
    bulkInsert: async (entries: DocketEntry[]): Promise<void> => {
      await delay(400);
      // Step 15: Storage and de-duplication
      const existingIds = new Set(dbDocket.map(e => `${e.caseId}-${e.sequenceNumber}`));
      const newEntries = entries.filter(e => !existingIds.has(`${e.caseId}-${e.sequenceNumber}`));
      dbDocket = [...newEntries, ...dbDocket];
    }
  },

  projects: {
    getByCaseId: async (caseId: string): Promise<Project[]> => {
      await delay(100);
      const c = dbCases.find(c => c.id === caseId);
      return c?.projects || [];
    },
    create: async (caseId: string, project: Project): Promise<Project> => {
      await delay(200);
      const c = dbCases.find(c => c.id === caseId);
      if (c) {
        const newProject = { ...project, id: project.id || generateId('proj') };
        const updatedProjects = [...(c.projects || []), newProject];
        dbCases = dbCases.map(cse => cse.id === caseId ? { ...cse, projects: updatedProjects } : cse);
        return newProject;
      }
      throw new Error('Case not found');
    }
  },

  phases: {
    getByCaseId: async (caseId: string): Promise<CasePhase[]> => {
      await delay(100);
      const c = dbCases.find(c => c.id === caseId);
      if (!c?.phases || c.phases.length === 0) {
        const defaultPhases = _generateDefaultPhases(c?.filingDate || new Date().toISOString());
        if (c) {
            dbCases = dbCases.map(cse => cse.id === caseId ? { ...cse, phases: defaultPhases } : cse);
        }
        return defaultPhases;
      }
      return c.phases;
    },
    update: async (caseId: string, phases: CasePhase[]): Promise<CasePhase[]> => {
      await delay(200);
      dbCases = dbCases.map(c => c.id === caseId ? { ...c, phases } : c);
      return phases;
    }
  }
};

const _generateDefaultPhases = (filingDate: string): CasePhase[] => {
  const start = new Date(filingDate);
  return [
    { id: generateId('ph'), caseId: 'temp', name: 'Pleadings', startDate: start.toISOString(), duration: 60, status: 'Completed', color: 'bg-blue-500' },
    { id: generateId('ph'), caseId: 'temp', name: 'Discovery', startDate: new Date(start.getTime() + 60*86400000).toISOString(), duration: 120, status: 'Active', color: 'bg-indigo-500' },
    { id: generateId('ph'), caseId: 'temp', name: 'Pre-Trial Motions', startDate: new Date(start.getTime() + 180*86400000).toISOString(), duration: 90, status: 'Pending', color: 'bg-purple-500' },
    { id: generateId('ph'), caseId: 'temp', name: 'Trial', startDate: new Date(start.getTime() + 270*86400000).toISOString(), duration: 30, status: 'Pending', color: 'bg-red-500' },
    { id: generateId('ph'), caseId: 'temp', name: 'Appeal', startDate: new Date(start.getTime() + 300*86400000).toISOString(), duration: 180, status: 'Pending', color: 'bg-amber-500' },
  ];
};
