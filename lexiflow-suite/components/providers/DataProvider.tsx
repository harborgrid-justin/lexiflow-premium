
import React, { createContext, useCallback, useEffect, useMemo } from 'react';
import { 
  Case, LegalDocument, WorkflowTask, User, AuditLogEntry, 
  Client, StaffMember, FirmExpense 
} from '../../types.ts';

// Mock Data Imports
import { MOCK_CASES } from '../../data/mockCases.ts';
import { MOCK_DOCUMENTS } from '../../data/mockDocuments.ts';
import { MOCK_TASKS } from '../../data/mockWorkflow.ts';
import { MOCK_USERS } from '../../data/mockUsers.ts';
import { MOCK_CLIENTS } from '../../data/mockClients.ts';
import { MOCK_AUDIT_LOGS } from '../../data/mockAdmin.ts';
import { MOCK_STAFF } from '../../data/models/staffMember.ts';
import { MOCK_EXPENSES } from '../../data/models/firmExpense.ts';

export interface DataState {
  cases: Case[];
  documents: LegalDocument[];
  tasks: WorkflowTask[];
  users: User[];
  clients: Client[];
  staff: StaffMember[];
  expenses: FirmExpense[];
  auditLogs: AuditLogEntry[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSynced: string;
  error: string | null;
}

const initialState: DataState = {
  cases: [],
  documents: [],
  tasks: [],
  users: [],
  clients: [],
  staff: [],
  expenses: [],
  auditLogs: [],
  isLoading: true,
  isSyncing: false,
  lastSynced: new Date().toLocaleTimeString(),
  error: null,
};

class EnterpriseStore {
  private state: DataState = initialState;
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;

  setState(updates: Partial<DataState>) {
    this.state = { ...this.state, ...updates };
    this.emit();
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  dispatch(action: any) {
    switch (action.type) {
      case 'INITIALIZE':
        this.setState({ ...action.payload, isLoading: false, lastSynced: new Date().toLocaleTimeString() });
        break;
      case 'SET_SYNCING':
        this.setState({ isSyncing: action.payload });
        break;
      case 'UPDATE_TASK':
        this.setState({
          tasks: this.state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t)
        });
        break;
      case 'ADD_CASE':
        this.setState({ cases: [action.payload, ...this.state.cases] });
        break;
      case 'ADD_AUDIT':
        this.setState({ auditLogs: [action.payload, ...this.state.auditLogs] });
        break;
    }
  }
}

export const store = new EnterpriseStore();

interface DataActions {
  syncData: () => Promise<void>;
  createCase: (newCase: Case) => void;
  updateTask: (id: string, updates: Partial<WorkflowTask>) => void;
  logAudit: (action: string, resource: string) => void;
}

export const ActionContext = createContext<DataActions | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const hydrate = async () => {
      await new Promise(r => setTimeout(r, 800));
      store.dispatch({
        type: 'INITIALIZE',
        payload: {
          cases: MOCK_CASES,
          documents: MOCK_DOCUMENTS,
          tasks: MOCK_TASKS,
          users: MOCK_USERS,
          clients: MOCK_CLIENTS,
          staff: MOCK_STAFF,
          expenses: MOCK_EXPENSES,
          auditLogs: MOCK_AUDIT_LOGS
        }
      });
    };
    hydrate();
  }, []);

  const logAudit = useCallback((action: string, resource: string) => {
    const entry: AuditLogEntry = {
      id: `audit-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'Current User',
      action,
      resource,
      ip: '127.0.0.1'
    };
    store.dispatch({ type: 'ADD_AUDIT', payload: entry });
  }, []);

  const syncData = useCallback(async () => {
    store.dispatch({ type: 'SET_SYNCING', payload: true });
    logAudit('SYNC_DATA', 'Firm Database Master');
    await new Promise(r => setTimeout(r, 1500));
    store.dispatch({ type: 'SET_SYNCING', payload: false });
  }, [logAudit]);

  const createCase = useCallback((newCase: Case) => {
    store.dispatch({ type: 'ADD_CASE', payload: newCase });
    logAudit('CREATE_CASE', newCase.title);
  }, [logAudit]);

  const updateTask = useCallback((id: string, updates: Partial<WorkflowTask>) => {
    store.dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    logAudit('UPDATE_TASK', id);
  }, [logAudit]);

  const actions = useMemo(() => ({
    syncData,
    createCase,
    updateTask,
    logAudit
  }), [syncData, createCase, updateTask, logAudit]);

  return (
    <ActionContext.Provider value={actions}>
      {children}
    </ActionContext.Provider>
  );
};
