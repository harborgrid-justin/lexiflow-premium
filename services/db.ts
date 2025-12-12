
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
  // Phase 3 Stores
  RATES: 'rate_tables',
  TRUST_TX: 'trust_transactions',
  REVIEW_BATCHES: 'review_batches',
  PRODUCTION_VOLS: 'production_volumes',
  JURORS: 'jurors',
  WITNESSES: 'witnesses',
  SLAS: 'sla_configs',
  PROCESSING_JOBS: 'processing_jobs',
  RETENTION_POLICIES: 'retention_policies',
  // Phase 4 Stores
  PLEADINGS: 'pleading_documents',
  // New Stores for Data-Driven Refactor
  COUNSEL_PROFILES: 'counsel_profiles',
  JUDGE_MOTION_STATS: 'judge_motion_stats',
  OUTCOME_PREDICTIONS: 'outcome_predictions',
  OKRS: 'okrs',
  MALWARE_SIGNATURES: 'malware_signatures',
  PLEADING_TEMPLATES: 'pleading_templates',
  CLE_TRACKING: 'cle_tracking',
  VENDOR_CONTRACTS: 'vendor_contracts',
  RFPS: 'rfps',
  MAINTENANCE_TICKETS: 'maintenance_tickets',
  FACILITIES: 'facilities',
  // Added for complete SaaS configurability
  VENDOR_DIRECTORY: 'vendor_directory',
  REPORTERS: 'reporters',
  JURISDICTIONS: 'jurisdictions',
  LEADS: 'leads',
  CRM_ANALYTICS: 'crm_analytics',
  REALIZATION_STATS: 'realization_stats',
  OPERATING_SUMMARY: 'operating_summary',
  DISCOVERY_FUNNEL_STATS: 'discovery_funnel_stats',
  DISCOVERY_CUSTODIAN_STATS: 'custodian_main',
};

export class DatabaseManager {
  private dbName = 'LexiFlowDB';
  private dbVersion = 25; // Incremented for new stores
  private db: IDBDatabase | null = null;
  private mode: 'IndexedDB' | 'LocalStorage' = 'IndexedDB';
  private initPromise: Promise<void> | null = null; 

  // Data Structure Integration: B-Tree for sorted indexes
  private titleIndex: BTree<string, string> = new BTree(5);

  // Transaction Coalescing Buffer
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
            if (storeName === STORES.TASKS && !store.indexNames.contains('caseId_status')) {
                store.createIndex('caseId_status', ['caseId', 'status'], { unique: false });
            }
          } else {
             const store = (event.target as IDBOpenDBRequest).transaction!.objectStore(storeName);
             if (!store.indexNames.contains('status')) store.createIndex('status', 'status', { unique: false });
             if (storeName === STORES.CASES && !store.indexNames.contains('client')) store.createIndex('client', 'client', { unique: false });
          }
        });
        if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files');
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;

        this.db.onversionchange = () => {
            console.warn("A new version of the database is available. Closing old connection to allow upgrade.");
            if (this.db) {
                this.db.close();
            }
            // Removed disruptive alert/reload. Application should handle reconnection or show a passive notification.
            console.log("Database version changed. Please reload at your convenience.");
        };

        this.db.onclose = () => {
            console.error("Database connection was unexpectedly closed. Future operations will attempt to re-initialize.");
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
        console.log("B-Tree index for case titles built.");
      }, 500);
  }

  async findCaseByTitle(title: string): Promise<any | null> {
      const id = this.titleIndex.search(title.toLowerCase());
      if (id) {
          return this.get(STORES.CASES, id);
      }
      return null;
  }

  async count(storeName: string): Promise<number> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          const items = StorageUtils.get<any[]>(storeName, []);
          return items.length;
      }
      return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
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

  private flushBuffer = () => {
    if (!this.db || this.writeBuffer.length === 0) return;

    const ops = [...this.writeBuffer];
    this.writeBuffer = [];
    this.flushTimer = null;

    const storeNames = Array.from(new Set(ops.map(o => o.store)));
    const transaction = this.db.transaction(storeNames, 'readwrite');
    
    transaction.oncomplete = () => {
        ops.forEach(op => op.resolve());
    };

    transaction.onerror = (e) => {
        ops.forEach(op => op.reject(e));
    };

    ops.forEach(op => {
        const store = transaction.objectStore(op.store);
        try {
            if (op.type === 'put') store.put(op.item);
            else if (op.type === 'delete') store.delete(op.item);
        } catch(e) {
            console.error("Coalesced Write Error", e);
        }
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
          this.writeBuffer.push({ store: storeName, item, type: 'put', resolve, reject });
          if (!this.flushTimer) {
              this.flushTimer = window.setTimeout(this.flushBuffer, 16);
          }
      });
  }

  async bulkPut<T>(storeName: string, items: T[]): Promise<void> {
      await this.init();
      if (this.mode === 'LocalStorage' || !this.db) {
          const currentItems = StorageUtils.get<T[]>(storeName, []);
          const newItems = [...currentItems];
          items.forEach(item => {
             const idx = newItems.findIndex((i: any) => i.id === (item as any).id);
             if (idx >= 0) newItems[idx] = item;
             else newItems.push(item);
          });
          StorageUtils.set(storeName, newItems);
          return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = (event) => reject((event.target as IDBTransaction).error);

          items.forEach(item => {
              store.put(item);
          });
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
        this.writeBuffer.push({ store: storeName, item: id, type: 'delete', resolve, reject });
        if (!this.flushTimer) {
            this.flushTimer = window.setTimeout(this.flushBuffer, 16);
        }
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
          const transaction = this.db!.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          if (!store.indexNames.contains(indexName)) {
               const request = store.getAll();
               request.onsuccess = () => {
                   const all = request.result as any[];
                   resolve(all.filter(i => i[indexName] === value)); 
               };
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
      if (this.mode === 'LocalStorage' || !this.db) {
          return; 
      }
      
      return new Promise((resolve, reject) => {
          if (!this.db) return reject("DB not ready");
          if (!this.db.objectStoreNames.contains('files')) {
              console.error("File store not found, cannot save file.");
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
