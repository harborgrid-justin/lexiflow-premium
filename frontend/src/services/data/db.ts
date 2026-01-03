import {
  DB_BTREE_ORDER,
  DB_FORCE_FLUSH_THRESHOLD,
  DB_MAX_BUFFER_SIZE,
  DB_NAME,
  DB_VERSION,
} from "@/config/database/indexeddb.config";
import { defaultWindowAdapter } from "@/services/infrastructure/adapters/WindowAdapter";
import { BTree } from "@/utils/datastructures/bTree";
import { StorageUtils } from "@/utils/storage";

export const STORES = {
  // Core entities (aligned with backend tables)
  CASES: "cases", // ✓ Backend: cases
  MATTERS: "matters", // ✓ Backend: matters (Matter Management)
  TASKS: "tasks", // ✓ Backend: tasks
  EVIDENCE: "evidence_items", // ✓ Backend: evidence_items (renamed for consistency)
  DOCUMENTS: "documents", // ✓ Backend: documents
  DOCKET: "docket_entries", // ✓ Backend: docket_entries (renamed for consistency)
  MOTIONS: "motions", // ✓ Backend: motions
  CLIENTS: "clients", // ✓ Backend: clients
  USERS: "users", // ✓ Backend: users
  PARTIES: "parties", // ✓ Backend: parties (added)

  // HR & Staff
  STAFF: "employees", // ✓ Backend: employees (renamed for consistency)
  TIME_OFF: "time_off_requests", // ✓ Backend: time_off_requests (added)

  // Billing & Financial
  EXPENSES: "expenses", // ✓ Backend: expenses (firm_expenses)
  INVOICES: "invoices", // ✓ Backend: invoices
  INVOICE_ITEMS: "invoice_items", // ✓ Backend: invoice_items (added)
  TIME_ENTRIES: "time_entries", // ✓ Backend: time_entries (added)
  RATES: "rate_tables", // ✓ Backend: rate_tables
  TRUST: "trust_accounts", // ✓ Backend: trust_accounts
  TRUST_TX: "trust_transactions", // ✓ Backend: trust_transactions
  FEE_AGREEMENTS: "fee_agreements", // ✓ Backend: fee_agreements (added)
  BILLING: "billing", // Frontend aggregated view

  // Discovery
  LEGAL_HOLDS: "legal_holds", // ✓ Backend: legal_holds
  PRIVILEGE_LOG: "privilege_log_entries", // ✓ Backend: privilege_log_entries (renamed)
  DISCOVERY_EXT_DEPO: "depositions", // ✓ Backend: depositions (renamed)
  DISCOVERY_EXT_ESI: "esi_sources", // ✓ Backend: esi_sources (renamed)
  DISCOVERY_EXT_PROD: "productions", // ✓ Backend: productions (renamed)
  DISCOVERY_EXT_INT: "custodian_interviews", // ✓ Backend: custodian_interviews (renamed)
  CUSTODIANS: "custodians", // Custodians for discovery
  REQUESTS: "discovery_requests", // ✓ Backend: discovery_requests
  WITNESSES: "witnesses", // ✓ Backend: witnesses
  CHAIN_OF_CUSTODY: "chain_of_custody_events", // ✓ Backend: chain_of_custody_events (added)

  // Legacy discovery stores (to be migrated)
  CONFERRALS: "conferral_sessions",
  JOINT_PLANS: "joint_plans",
  STIPULATIONS: "stipulation_requests",
  EXAMINATIONS: "discovery_examinations",
  VENDORS: "discovery_vendors",
  TRANSCRIPTS: "discovery_transcripts",
  SANCTIONS: "discovery_sanctions",

  // Litigation
  PLEADINGS: "pleadings", // ✓ Backend: pleadings (renamed from pleading_documents)
  EXHIBITS: "exhibits", // ✓ Backend: exhibits
  TRIAL_EXHIBITS: "trial_exhibits", // ✓ Backend: trial_exhibits (added)
  TRIAL_EVENTS: "trial_events", // ✓ Backend: trial_events (added)
  WITNESS_PREP: "witness_prep_sessions", // ✓ Backend: witness_prep_sessions (added)
  CITATIONS: "citations", // ✓ Backend: citations
  CLAUSES: "clauses", // ✓ Backend: clauses
  JURORS: "jurors", // Frontend-only (not in backend yet)

  // Compliance & Security
  CONFLICTS: "conflicts", // Must match frontend/db.ts store name
  WALLS: "ethical_walls", // ✓ Backend: ethical_walls
  LOGS: "audit_logs", // ✓ Backend: audit_logs
  COMPLIANCE_RULES: "compliance_rules", // ✓ Backend: compliance_rules (added)
  COMPLIANCE_CHECKS: "compliance_checks", // ✓ Backend: compliance_checks (added)

  // Organization
  ORGS: "organizations", // ✓ Backend: organizations (renamed)
  GROUPS: "groups", // Frontend-only
  PROJECTS: "projects", // ✓ Backend: projects
  RISKS: "risks", // ✓ Backend: risks
  PHASES: "case_phases", // ✓ Backend: case_phases
  CASE_TEAMS: "case_team_members", // ✓ Backend: case_team_members (added)

  // Document Management
  DOCUMENT_VERSIONS: "document_versions", // ✓ Backend: document_versions (added)
  REVIEW_BATCHES: "review_batches", // Frontend-only
  PRODUCTION_VOLS: "production_volumes", // Frontend-only
  PROCESSING_JOBS: "processing_jobs", // ✓ Backend: processing_jobs
  OCR_JOBS: "ocr_jobs", // ✓ Backend: ocr_jobs (added)

  // Knowledge & Templates
  WIKI: "knowledge_articles", // ✓ Backend: knowledge_articles (renamed)
  TEMPLATES: "workflow_templates", // ✓ Backend: workflow_templates
  PLEADING_TEMPLATES: "pleading_templates", // Frontend-only
  COMM_TEMPLATES: "templates", // ✓ Backend: templates (communications) (added)
  PRECEDENTS: "precedents", // Frontend-only

  // Communications
  COMMUNICATIONS: "communications", // ✓ Backend: communications
  CONVERSATIONS: "conversations", // ✓ Backend: conversations
  MESSAGES: "messages", // ✓ Backend: messages (added)
  NOTIFICATIONS: "notifications", // ✓ Backend: notifications
  SERVICE_JOBS: "service_jobs", // Frontend-only

  // Authentication & Security
  SESSIONS: "sessions", // ✓ Backend: sessions (added)
  REFRESH_TOKENS: "refresh_tokens", // ✓ Backend: refresh_tokens (added)
  LOGIN_ATTEMPTS: "login_attempts", // ✓ Backend: login_attempts (added)
  USER_PROFILES: "user_profiles", // ✓ Backend: user_profiles (added)
  API_KEYS: "api_keys", // ✓ Backend: api_keys (added)

  // Integrations & APIs
  INTEGRATIONS: "integrations", // ✓ Backend: integrations (added)

  // Analytics & Reporting
  REPORTS: "reports", // ✓ Backend: reports (added)
  REPORT_TEMPLATES: "report_templates", // ✓ Backend: report_templates (added)
  DASHBOARDS: "dashboards", // ✓ Backend: dashboards (added)
  DASHBOARD_SNAPSHOTS: "dashboard_snapshots", // ✓ Backend: dashboard_snapshots (added)
  ANALYTICS_EVENTS: "analytics_events", // ✓ Backend: analytics_events (added)

  // Search
  SEARCH_INDEX: "search_index", // ✓ Backend: search_index (added)
  SEARCH_QUERIES: "search_queries", // ✓ Backend: search_queries (added)

  // Calendar
  CALENDAR_EVENTS: "calendar_events", // ✓ Backend: calendar_events (added)

  // War Room / Strategy (backend entities: advisors, experts, case_strategies)
  ADVISORS: "advisors", // ✓ Backend: advisors
  EXPERTS: "experts", // ✓ Backend: experts (added)
  CASE_STRATEGIES: "case_strategies", // ✓ Backend: case_strategies (added)

  // Legacy/Frontend-only stores (no backend equivalent yet)
  WORKFLOWS: "workflows", // Frontend-only workflow instances (templates are in TEMPLATES)
  WORKFLOW_AUTOMATIONS: "workflow_automations", // Workflow automation rules (triggers, conditions, actions)
  PROCESSES: "firm_processes",
  JUDGES: "judge_profiles",
  COUNSEL: "opposing_counsel",
  OPPOSITION: "opposition",
  POLICIES: "policies",
  MAP_NODES: "map_nodes",
  QA: "qa_items",
  RULES: "rules",
  ANALYSIS: "brief_analysis",
  ENTITIES: "legal_entities",
  RELATIONSHIPS: "entity_relationships",
  COUNSEL_PROFILES: "counsel_profiles",
  JUDGE_MOTION_STATS: "judge_motion_stats",
  OUTCOME_PREDICTIONS: "outcome_predictions",
  OKRS: "okrs",
  MALWARE_SIGNATURES: "malware_signatures",
  CLE_TRACKING: "cle_tracking",
  VENDOR_CONTRACTS: "vendor_contracts",
  RFPS: "rfps",
  MAINTENANCE_TICKETS: "maintenance_tickets",
  FACILITIES: "facilities",
  ASSETS: "firm_assets", // IT assets (hardware, software, equipment)
  VENDOR_DIRECTORY: "vendor_directory",
  REPORTERS: "reporters",
  JURISDICTIONS: "jurisdictions",
  LEADS: "leads",
  CRM_ANALYTICS: "crm_analytics",
  REALIZATION_STATS: "realization_stats",
  OPERATING_SUMMARY: "operating_summary",
  DISCOVERY_FUNNEL_STATS: "discovery_funnel_stats",
  DISCOVERY_CUSTODIAN_STATS: "custodian_main",
  SLAS: "sla_configs",
  RETENTION_POLICIES: "retention_policies",
  TRANSACTIONS: "transactions", // Ledger transactions with receipt support
};

export class DatabaseManager {
  private dbName = DB_NAME;
  private dbVersion = DB_VERSION;
  private db: IDBDatabase | null = null;
  private mode: "IndexedDB" | "LocalStorage" = "IndexedDB";
  private initPromise: Promise<void> | null = null;

  // Data Structure Integration: B-Tree for sorted indexes
  private titleIndex: BTree<string, string> = new BTree(DB_BTREE_ORDER);

  // Transaction Coalescing Buffer with size limits
  private writeBuffer: {
    store: string;
    item: unknown;
    type: "put" | "delete";
    resolve: (...args: unknown[]) => unknown;
    reject: (...args: unknown[]) => unknown;
  }[] = [];
  private flushTimer: number | null = null;
  private readonly MAX_BUFFER_SIZE = DB_MAX_BUFFER_SIZE;
  private readonly FORCE_FLUSH_THRESHOLD = DB_FORCE_FLUSH_THRESHOLD;

  constructor() {
    try {
      if (!window.indexedDB) this.mode = "LocalStorage";
    } catch {
      this.mode = "LocalStorage";
    }
  }

  getMode() {
    return this.mode;
  }

  async switchMode(newMode: "IndexedDB" | "LocalStorage") {
    this.mode = newMode;
    this.initPromise = null;
    this.db = null;
    window.location.reload();
  }

  async init(): Promise<void> {
    if (this.mode === "LocalStorage") return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        Object.values(STORES).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "id" });
            if (!store.indexNames.contains("caseId"))
              store.createIndex("caseId", "caseId", { unique: false });
            if (!store.indexNames.contains("status"))
              store.createIndex("status", "status", { unique: false });
            if (
              storeName === STORES.TASKS &&
              !store.indexNames.contains("caseId_status")
            ) {
              store.createIndex("caseId_status", ["caseId", "status"], {
                unique: false,
              });
            }
          } else {
            const store = (
              event.target as IDBOpenDBRequest
            ).transaction!.objectStore(storeName);
            if (!store.indexNames.contains("status"))
              store.createIndex("status", "status", { unique: false });
            if (
              storeName === STORES.CASES &&
              !store.indexNames.contains("client")
            )
              store.createIndex("client", "client", { unique: false });
          }
        });
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files");
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;

        this.db.onversionchange = () => {
          console.warn(
            "A new version of the database is available. Closing old connection to allow upgrade."
          );
          if (this.db) {
            this.db.close();
          }
          alert(
            "A new version of the application is available. The page will now reload to apply updates."
          );
          window.location.reload();
        };

        this.db.onclose = () => {
          console.error(
            "Database connection was unexpectedly closed. Future operations will attempt to re-initialize."
          );
          this.initPromise = null;
          this.db = null;
        };

        this.buildIndices();
        resolve();
      };

      request.onerror = (event) => {
        console.error("IDB Error:", (event.target as IDBOpenDBRequest).error);
        this.mode = "LocalStorage";
        resolve();
      };
    });

    return this.initPromise;
  }

  private async buildIndices() {
    setTimeout(async () => {
      const cases = await this.getAll<{ id: string; title: string }>(
        STORES.CASES
      );
      cases.forEach((c) => {
        if (c && typeof c === "object" && "title" in c && "id" in c) {
          this.titleIndex.insert(c.title.toLowerCase(), c.id);
        }
      });
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
    if (this.mode === "LocalStorage" || !this.db) {
      const items = StorageUtils.get<unknown[]>(storeName, []);
      return items.length;
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    await this.init();
    if (this.mode === "LocalStorage" || !this.db) {
      return StorageUtils.get(storeName, []);
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    await this.init();
    if (this.mode === "LocalStorage" || !this.db) {
      const items = StorageUtils.get<T[]>(storeName, []);
      return items.find((i: unknown) => (i as { id: string }).id === id);
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
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

    const storeNames = Array.from(new Set(ops.map((o) => o.store)));
    const transaction = this.db.transaction(storeNames, "readwrite");

    transaction.oncomplete = () => {
      ops.forEach((op) => op.resolve());
    };

    transaction.onerror = (e) => {
      ops.forEach((op) => op.reject(e));
    };

    ops.forEach((op) => {
      const store = transaction.objectStore(op.store);
      try {
        if (op.type === "put") store.put(op.item);
        else if (op.type === "delete") store.delete(op.item as IDBValidKey);
      } catch (e) {
        console.error("Coalesced Write Error", e);
      }
    });
  };

  async put<T>(storeName: string, item: T): Promise<void> {
    await this.init();
    if (this.mode === "LocalStorage" || !this.db) {
      const items = StorageUtils.get<T[]>(storeName, []);
      const idx = items.findIndex(
        (i: unknown) =>
          (i as { id: string }).id === (item as Record<string, unknown>).id
      );
      if (idx >= 0) items[idx] = item;
      else items.push(item);
      StorageUtils.set(storeName, items);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Safety check: prevent unbounded buffer growth
      if (this.writeBuffer.length >= this.MAX_BUFFER_SIZE) {
        console.warn(
          `[DB] Write buffer at maximum capacity (${this.MAX_BUFFER_SIZE}), forcing immediate flush`
        );
        this.flushBuffer();
      }

      this.writeBuffer.push({
        store: storeName,
        item,
        type: "put",
        resolve,
        reject,
      });

      // Force flush if buffer is getting large
      if (this.writeBuffer.length >= this.FORCE_FLUSH_THRESHOLD) {
        if (this.flushTimer) {
          clearTimeout(this.flushTimer);
          this.flushTimer = null;
        }
        this.flushBuffer();
      } else if (!this.flushTimer) {
        this.flushTimer = defaultWindowAdapter.setTimeout(this.flushBuffer, 16);
      }
    });
  }

  async bulkPut<T>(storeName: string, items: T[]): Promise<void> {
    await this.init();
    if (this.mode === "LocalStorage" || !this.db) {
      const currentItems = StorageUtils.get<T[]>(storeName, []);
      const newItems = [...currentItems];
      items.forEach((item) => {
        const idx = newItems.findIndex(
          (i: unknown) =>
            (i as { id: string }).id === (item as Record<string, unknown>).id
        );
        if (idx >= 0) newItems[idx] = item;
        else newItems.push(item);
      });
      StorageUtils.set(storeName, newItems);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) =>
        reject((event.target as IDBTransaction).error);

      items.forEach((item) => {
        store.put(item);
      });
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    await this.init();
    if (this.mode === "LocalStorage" || !this.db) {
      const items = StorageUtils.get<unknown[]>(storeName, []);
      StorageUtils.set(
        storeName,
        items.filter((i: unknown) => (i as { id: string }).id !== id)
      );
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Safety check: prevent unbounded buffer growth
      if (this.writeBuffer.length >= this.MAX_BUFFER_SIZE) {
        console.warn(
          `[DB] Write buffer at maximum capacity (${this.MAX_BUFFER_SIZE}), forcing immediate flush`
        );
        this.flushBuffer();
      }

      this.writeBuffer.push({
        store: storeName,
        item: id,
        type: "delete",
        resolve,
        reject,
      });

      // Force flush if buffer is getting large
      if (this.writeBuffer.length >= this.FORCE_FLUSH_THRESHOLD) {
        if (this.flushTimer) {
          clearTimeout(this.flushTimer);
          this.flushTimer = null;
        }
        this.flushBuffer();
      } else if (!this.flushTimer) {
        this.flushTimer = defaultWindowAdapter.setTimeout(this.flushBuffer, 16);
      }
    });
  }

  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: string | unknown[]
  ): Promise<T[]> {
    await this.init();
    if (this.mode === "LocalStorage" || !this.db) {
      const items = StorageUtils.get<T[]>(storeName, []);
      const key = Array.isArray(value) ? indexName.split("_")[0] : indexName;
      const val = Array.isArray(value) ? value[0] : value;
      return items.filter(
        (i: unknown) => (i as Record<string, unknown>)[key] === val
      );
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      if (!store.indexNames.contains(indexName)) {
        const request = store.getAll();
        request.onsuccess = () => {
          const all = request.result as Record<string, unknown>[];
          resolve(all.filter((i) => i[indexName] === value) as T[]);
        };
        return;
      }
      const index = store.index(indexName);
      const request = index.getAll(value as IDBValidKey | IDBKeyRange);
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async putFile(id: string, file: File): Promise<void> {
    await this.init();
    if (this.mode === "LocalStorage" || !this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("DB not ready");
      if (!this.db.objectStoreNames.contains("files")) {
        console.error("File store not found, cannot save file.");
        return resolve();
      }
      const tx = this.db.transaction(["files"], "readwrite");
      tx.objectStore("files").put(file, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getFile(id: string): Promise<Blob | null> {
    await this.init();
    if (this.mode === "LocalStorage" || !this.db) {
      return null;
    }
    return new Promise((resolve) => {
      if (!this.db || !this.db.objectStoreNames.contains("files"))
        return resolve(null);
      const tx = this.db.transaction(["files"], "readonly");
      const req = tx.objectStore("files").get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  // Get buffer stats for monitoring
  getBufferStats() {
    return {
      bufferSize: this.writeBuffer.length,
      maxBufferSize: this.MAX_BUFFER_SIZE,
      forceFlushThreshold: this.FORCE_FLUSH_THRESHOLD,
      hasPendingFlush: this.flushTimer !== null,
    };
  }
}

export const db = new DatabaseManager();
