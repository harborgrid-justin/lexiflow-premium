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

  // System & Audit
  AUDIT_LOGS: "audit_logs", // Issue #7: Audit Logs

  // Discovery
  LEGAL_HOLDS: "legal_holds", // ✓ Backend: legal_holds
  PRIVILEGE_LOG: "privilege_log_entries", // ✓ Backend: privilege_log_entries (renamed)
  DISCOVERY_EXT_DEPO: "depositions", // ✓ Backend: depositions (renamed)
  DISCOVERY_EXT_ESI: "esi_sources", // ✓ Backend: esi_sources (renamed)
  DISCOVERY_EXT_PROD: "productions", // ✓ Backend: productions (renamed)
  DISCOVERY_EXT_INT: "custodian_interviews", // ✓ Backend: custodian_interviews (renamed)
  CUSTODIANS: "custodians", // Custodians for discovery
  DISCOVERY_COLLECTIONS: "discovery_collections", // ✓ Backend: discovery_collections
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
  private mode: "IndexedDB" | "LocalStorage" = "IndexedDB";
  private db: IDBDatabase | null = null; // Type compatibility

  constructor() {
    // STRICT ENFORCEMENT: Backend Only
    console.warn("DatabaseManager initialized but storage is disabled.");
  }

  getMode() {
    return this.mode;
  }

  async switchMode(_newMode: "IndexedDB" | "LocalStorage") {
    console.error("Storage switching disabled.");
  }

  async init(): Promise<void> {
    // No-op
    return Promise.resolve();
  }

  async findCaseByTitle(_title: string): Promise<unknown | null> {
    return null;
  }

  async count(_storeName: string): Promise<number> {
    return 0;
  }

  async getAll<T>(_storeName: string): Promise<T[]> {
    throw new Error(
      `Frontend storage disabled (Accessing ${_storeName}). Use Backend API.`
    );
  }

  async get<T>(_storeName: string, _id: string): Promise<T | undefined> {
    throw new Error(
      `Frontend storage disabled (Accessing ${_storeName}). Use Backend API.`
    );
  }

  async put<T>(_storeName: string, _item: T): Promise<void> {
    throw new Error(
      `Frontend storage disabled (Accessing ${_storeName}). Use Backend API.`
    );
  }

  async bulkPut<T>(_storeName: string, _items: T[]): Promise<void> {
    throw new Error(
      `Frontend storage disabled (Accessing ${_storeName}). Use Backend API.`
    );
  }

  async delete(_storeName: string, _id: string): Promise<void> {
    throw new Error(
      `Frontend storage disabled (Accessing ${_storeName}). Use Backend API.`
    );
  }

  async getByIndex<T>(
    _storeName: string,
    _indexName: string,
    _value: string | unknown[]
  ): Promise<T[]> {
    throw new Error(
      `Frontend storage disabled (Accessing ${_storeName}). Use Backend API.`
    );
  }

  async putFile(_id: string, _file: File): Promise<void> {
    throw new Error("Frontend storage disabled. Use Backend API.");
  }

  async getFile(_id: string): Promise<Blob | null> {
    return null;
  }

  async clear(_storeName: string): Promise<void> {
    throw new Error("Frontend storage disabled. Use Backend API.");
  }

  getBufferStats() {
    return {
      bufferSize: 0,
      maxBufferSize: 0,
      forceFlushThreshold: 0,
      hasPendingFlush: false,
    };
  }
}

export const db = new DatabaseManager();
