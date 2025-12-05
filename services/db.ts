
import { StorageUtils } from '../utils/storage';
import { Seeder } from './dbSeeder';

export const STORES = {
  CASES: 'cases',
  TASKS: 'tasks',
  EVIDENCE: 'evidence',
  DOCUMENTS: 'documents',
  DOCKET: 'docket',
  MOTIONS: 'motions',
  CLIENTS: 'clients',
  STAFF: 'staff',
  EXPENSES: 'expenses',
  ORGS: 'orgs',
  GROUPS: 'groups',
  LEGAL_HOLDS: 'legal_holds',
  PRIVILEGE_LOG: 'privilege_log',
  PROCESSES: 'firm_processes',
  CLAUSES: 'clauses',
  TEMPLATES: 'workflow_templates',
  JUDGES: 'judge_profiles',
  COUNSEL: 'opposing_counsel',
  USERS: 'users',
  CONFERRALS: 'conferral_sessions',
  JOINT_PLANS: 'joint_plans',
  STIPULATIONS: 'stipulation_requests',
  DISCOVERY_EXT_DEPO: 'discovery_depositions',
  DISCOVERY_EXT_ESI: 'discovery_esi',
  DISCOVERY_EXT_PROD: 'discovery_productions',
  DISCOVERY_EXT_INT: 'discovery_interviews',
  REQUESTS: 'discovery_requests',
  CONFLICTS: 'conflicts',
  WALLS: 'ethical_walls',
  LOGS: 'audit_logs',
  PROJECTS: 'projects',
  RISKS: 'risks',
  ADVISORS: 'advisors',
  OPPOSITION: 'opposition',
  POLICIES: 'policies',
  TRUST: 'trust_accounts',
  CITATIONS: 'citations',
  MAP_NODES: 'map_nodes',
  WIKI: 'wiki_articles',
  PRECEDENTS: 'precedents',
  QA: 'qa_items',
  EXHIBITS: 'exhibits',
  NOTIFICATIONS: 'notifications',
  COMMUNICATIONS: 'communications',
  SERVICE_JOBS: 'service_jobs',
  CONVERSATIONS: 'conversations',
  RULES: 'rules',
  BILLING: 'billing',
  INVOICES: 'invoices',
  ANALYSIS: 'brief_analysis',
  ENTITIES: 'legal_entities',
  RELATIONSHIPS: 'entity_relationships'
};

export class DatabaseManager {
  private dbName = 'LexiFlowDB';
  private dbVersion = 10;
  private db: IDBDatabase | null = null;
  private mode: 'IndexedDB' | 'LocalStorage' = 'IndexedDB';
  private initPromise: Promise<void> | null = null; 

  constructor() {
      try {
          if (!window.indexedDB) this.mode = 'LocalStorage';
      } catch (e) {
          this.mode = 'LocalStorage';
      }
  }

  getMode() { return this.mode; }

  async switchMode(newMode: 'IndexedDB' | 'LocalStorage') {
      this.mode = newMode;
      this.initPromise = null;
      this.db = null;
      window.location.reload();
  }

  async init(): Promise<void> {
    if (this.mode === 'LocalStorage') return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            if (!store.indexNames.contains('caseId')) store.createIndex('caseId', 'caseId', { unique: false });
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error("IDB Error:", (event.target as IDBOpenDBRequest).error);
        this.mode = 'LocalStorage'; 
        resolve();
      };
    });

    return this.initPromise;
  }

  async seedData(): Promise<void> {
      await this.init();
      const existing = await this.getAll(STORES.CASES);
      if (existing.length > 0) return;
      await Seeder.seed(this);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          return StorageUtils.get(storeName, []);
      }
      return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result as T[]);
          request.onerror = () => reject(request.error);
      });
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          const items = StorageUtils.get<T[]>(storeName, []);
          return items.find((i: any) => i.id === id);
      }
      return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(id);
          request.onsuccess = () => resolve(request.result as T);
          request.onerror = () => reject(request.error);
      });
  }

  async put<T>(storeName: string, item: T): Promise<void> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          const items = StorageUtils.get<T[]>(storeName, []);
          const idx = items.findIndex((i: any) => i.id === (item as any).id);
          if (idx >= 0) items[idx] = item;
          else items.push(item);
          StorageUtils.set(storeName, items);
          return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.put(item);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
      });
  }

  async delete(storeName: string, id: string): Promise<void> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          const items = StorageUtils.get<any[]>(storeName, []);
          StorageUtils.set(storeName, items.filter(i => i.id !== id));
          return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
      });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          const items = StorageUtils.get<T[]>(storeName, []);
          return items.filter((i: any) => i[indexName] === value);
      }
      return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const index = store.index(indexName);
          const request = index.getAll(value);
          request.onsuccess = () => resolve(request.result as T[]);
          request.onerror = () => reject(request.error);
      });
  }

  async putFile(id: string, file: File): Promise<void> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          return; 
      }
      
      return new Promise((resolve, reject) => {
          if (!this.db) return reject("DB not ready");
          if (!this.db.objectStoreNames.contains('files')) {
              return resolve();
          }
          const tx = this.db.transaction(['files'], 'readwrite');
          tx.objectStore('files').put(file, id);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
      });
  }
  
  async getFile(id: string): Promise<Blob | null> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          return null;
      }
      return new Promise((resolve) => {
           if (!this.db || !this.db.objectStoreNames.contains('files')) return resolve(null);
           const tx = this.db.transaction(['files'], 'readonly');
           const req = tx.objectStore('files').get(id);
           req.onsuccess = () => resolve(req.result);
           req.onerror = () => resolve(null);
      });
  }
}

export const db = new DatabaseManager();
