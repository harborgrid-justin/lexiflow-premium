
export const STORAGE_KEYS = {
  CASES: 'lexiflow_cases',
  TASKS: 'lexiflow_tasks',
  EVIDENCE: 'lexiflow_evidence',
  MOTIONS: 'lexiflow_motions',
  DOCUMENTS: 'lexiflow_documents',
  BILLING: 'lexiflow_billing',
  CLIENTS: 'lexiflow_clients',
  STAFF: 'lexiflow_staff',
  DOCKET: 'lexiflow_docket',
  ORGS: 'lexiflow_orgs',
  GROUPS: 'lexiflow_groups',
  EXPENSES: 'lexiflow_expenses',
  CONFLICTS: 'lexiflow_conflicts',
  WALLS: 'lexiflow_walls',
  LOGS: 'lexiflow_logs',
  RESEARCH: 'lexiflow_research',
  CONVERSATIONS: 'lexiflow_conversations',
  RULES: 'lexiflow_rules',
  DISCOVERY: {
    DEPOSITIONS: 'lexiflow_disc_depositions',
    ESI: 'lexiflow_disc_esi',
    PRODUCTIONS: 'lexiflow_disc_productions',
    INTERVIEWS: 'lexiflow_disc_interviews',
    REQUESTS: 'lexiflow_disc_requests'
  }
};

export const StorageUtils = {
  get: <T>(key: string, defaultData: T): T => {
    try {
      if (typeof window === 'undefined') return defaultData;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultData;
    } catch (error) {
      console.error(`Error reading ${key} from storage`, error);
      return defaultData;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to storage`, error);
    }
  },

  clearAll: (): void => {
    try {
      if (typeof window === 'undefined') return;
      // Only clear keys starting with 'lexiflow_' to avoid messing with other site data
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith('lexiflow_')) {
          window.localStorage.removeItem(key);
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }
};
