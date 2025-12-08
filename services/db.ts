
import { StorageUtils } from '../utils/storage';
import { BTree } from '../utils/datastructures/bTree';

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
  EXAMINATIONS: 'discovery_examinations',
  VENDORS: 'discovery_vendors',
  TRANSCRIPTS: 'discovery_transcripts',
  SANCTIONS: 'discovery_sanctions',
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
  RELATIONSHIPS: 'entity_relationships',
  RATES: 'rate_tables',
  TRUST_TX: 'trust_transactions',
  REVIEW_BATCHES: 'review_batches',
  PRODUCTION_VOLS: 'production_volumes',
  JURORS: 'jurors',
  WITNESSES: 'witnesses',
  SLAS: 'sla_configs',
  PROCESSING_JOBS: 'processing_jobs',
  RETENTION_POLICIES: 'retention_policies',
  PLEADINGS: 'pleading_documents',
  PLEADING_TEMPLATES: 'pleading_templates',
  COUNSEL_PROFILES: 'counsel_profiles',
  JUDGE_MOTION_STATS: 'judge_motion_stats',
  OUTCOME_PREDICTIONS: 'outcome_predictions',
  OKRS: 'okrs',
  MALWARE_SIGNATURES: 'malware_signatures',
  CLE_TRACKING: 'cle_tracking',
  VENDOR_CONTRACTS: 'vendor_contracts',
  RFPS: 'rfps',
  MAINTENANCE_TICKETS: 'maintenance_tickets',
  FACILITIES: 'facilities',
  VENDOR_DIRECTORY: 'vendor_directory',
  REPORTERS: 'reporters',
  JURISDICTIONS: 'jurisdictions',
  LEADS: 'leads',
  CRM_ANALYTICS: 'crm_analytics',
  REALIZATION_STATS: 'realization_stats',
  OPERATING_SUMMARY: 'operating_summary',
  DISCOVERY_FUNNEL_STATS: 'discovery_funnel_stats',
  DISCOVERY_CUSTODIAN_STATS: 'discovery_custodian_stats',
};

export class DatabaseManager {
  private dbName = 'LexiFlowDB';
  private dbVersion = 24; // Incremented for new stores
  private db: IDBDatabase | null = null;
  private mode: 'IndexedDB' | 'LocalStorage' = 'IndexedDB';
  private initPromise: Promise<void> | null = null; 

  private titleIndex: BTree<string, string> = new BTree(5);

  private writeBuffer: { store: string, item: any, type: 'put' | 'delete', resolve: Function, reject: Function }[] = [];
  private flushTimer: number | null = null;

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
            if (!store.indexNames.contains('status')) store.createIndex('status', 'status', { unique: false });
          }
        });
        if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files');
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.db.onversionchange = () => {
            console.warn("Database version change detected. Closing connection to allow upgrade.");
            if (this.db) this.db.close();
            window.location.reload();
        };
        this.db.onclose = () => {
            console.error("Database connection closed.");
            this.initPromise = null;
            this.db = null;
        };
        this.buildIndices();
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

  private async buildIndices() {
      setTimeout(async () => {
        const cases = await this.getAll<any>(STORES.CASES);
        cases.forEach(c => this.titleIndex.insert(c.title.toLowerCase(), c.id));
      }, 500);
  }

  async findCaseByTitle(title: string): Promise<any | null> {
      const id = this.titleIndex.search(title.toLowerCase());
      if (id) return this.get(STORES.CASES, id);
      return null;
  }

  async count(storeName: string): Promise<number> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          return StorageUtils.get<any[]>(storeName, []).length;
      }
      return new Promise((resolve, reject) => {
          const store = this.db!.transaction(storeName, 'readonly').objectStore(storeName);
          const request = store.count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
      });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          return StorageUtils.get(storeName, []);
      }
      return new Promise((resolve, reject) => {
          const store = this.db!.transaction(storeName, 'readonly').objectStore(storeName);
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result as T[]);
          request.onerror = () => reject(request.error);
      });
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          return StorageUtils.get<T[]>(storeName, []).find((i: any) => i.id === id);
      }
      return new Promise((resolve, reject) => {
          const store = this.db!.transaction(storeName, 'readonly').objectStore(storeName);
          const request = store.get(id);
          request.onsuccess = () => resolve(request.result as T);
          request.onerror = () => reject(request.error);
      });
  }

  private flushBuffer = () => {
    if (!this.db || this.writeBuffer.length === 0) return;
    const ops = [...this.writeBuffer];
    this.writeBuffer = [];
    this.flushTimer = null;
    const storeNames = Array.from(new Set(ops.map(o => o.store)));
    const transaction = this.db.transaction(storeNames, 'readwrite');
    transaction.oncomplete = () => ops.forEach(op => op.resolve());
    transaction.onerror = (e) => ops.forEach(op => op.reject(e));
    ops.forEach(op => {
        const store = transaction.objectStore(op.store);
        if (op.type === 'put') store.put(op.item);
        else if (op.type === 'delete') store.delete(op.item);
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
          return;
      }
      return new Promise((resolve, reject) => {
          this.writeBuffer.push({ store: storeName, item, type: 'put', resolve, reject });
          if (!this.flushTimer) this.flushTimer = window.setTimeout(this.flushBuffer, 16);
      });
  }

  async delete(storeName: string, id: string): Promise<void> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          StorageUtils.set(storeName, StorageUtils.get<any[]>(storeName, []).filter(i => i.id !== id));
          return;
      }
      return new Promise((resolve, reject) => {
        this.writeBuffer.push({ store: storeName, item: id, type: 'delete', resolve, reject });
        if (!this.flushTimer) this.flushTimer = window.setTimeout(this.flushBuffer, 16);
      });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: string | any[]): Promise<T[]> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          const items = StorageUtils.get<T[]>(storeName, []);
          const key = Array.isArray(value) ? indexName.split('_')[0] : indexName;
          const val = Array.isArray(value) ? value[0] : value; 
          return items.filter((i: any) => i[key] === val);
      }
      return new Promise((resolve, reject) => {
          const store = this.db!.transaction(storeName, 'readonly').objectStore(storeName);
          if (!store.indexNames.contains(indexName)) {
               const request = store.getAll();
               request.onsuccess = () => resolve((request.result as any[]).filter(i => i[indexName] === value));
               return;
          }
          const index = store.index(indexName);
          const request = index.getAll(value);
          request.onsuccess = () => resolve(request.result as T[]);
          request.onerror = () => reject(request.error);
      });
  }

  async putFile(id: string, file: File): Promise<void> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) return;
      return new Promise((resolve, reject) => {
           if (!this.db || !this.db.objectStoreNames.contains('files')) return resolve();
           const tx = this.db.transaction('files', 'readwrite');
           tx.objectStore('files').put(file, id);
           tx.oncomplete = () => resolve();
           tx.onerror = () => reject(tx.error);
      });
  }
  
  async getFile(id: string): Promise<Blob | null> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) return null;
      return new Promise((resolve) => {
           if (!this.db || !this.db.objectStoreNames.contains('files')) return resolve(null);
           const tx = this.db.transaction('files', 'readonly');
           const req = tx.objectStore('files').get(id);
           req.onsuccess = () => resolve(req.result);
           req.onerror = () => resolve(null);
      });
  }
}

export const db = new DatabaseManager();
