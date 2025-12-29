// =============================================================================
// LEGAL-SPECIFIC FEATURE CONFIGURATION
// =============================================================================
// Domain-specific settings for legal practice management

// Case Management
export const CASE_NUMBER_FORMAT = 'auto'; // 'auto' | 'manual'
export const CASE_ENABLE_CONFLICT_CHECK = true;
export const CASE_AUTO_CREATE_FOLDERS = true;

// Docket Management
export const DOCKET_AUTO_REFRESH_ENABLED = false;
export const DOCKET_AUTO_REFRESH_INTERVAL_MINUTES = 60;
export const DOCKET_PACER_INTEGRATION_ENABLED = false;

// Discovery
export const DISCOVERY_ENABLE_PRIVILEGE_LOG = true;
export const DISCOVERY_ENABLE_CHAIN_OF_CUSTODY = true;
export const DISCOVERY_AUTO_NUMBER_EXHIBITS = true;
export const DISCOVERY_EXHIBIT_PREFIX = 'EX-';

// Billing
export const BILLING_DEFAULT_CURRENCY = 'USD';
export const BILLING_TIME_INCREMENT_MINUTES = 6; // 0.1 hour increments
export const BILLING_ROUND_TO_INCREMENT = true;
export const BILLING_ENABLE_TIMER = true;
export const BILLING_AUTO_STOP_TIMER_HOURS = 8;

// Pleadings
export const PLEADING_DEFAULT_FONT = 'Times New Roman';
export const PLEADING_DEFAULT_FONT_SIZE = 12;
export const PLEADING_DEFAULT_LINE_SPACING = 2.0;
export const PLEADING_DEFAULT_MARGIN_INCHES = 1.0;

// Citations
export const CITATION_FORMAT = 'bluebook'; // 'bluebook' | 'alwd'
export const CITATION_AUTO_COMPLETE = true;
export const CITATION_VALIDATE_ON_PASTE = true;

// Document Viewer
export const DOCUMENT_VIEWER_ENABLE_ANNOTATIONS = true;
export const DOCUMENT_VIEWER_ENABLE_REDACTIONS = true;
export const DOCUMENT_VIEWER_ENABLE_SEARCH = true;
export const DOCUMENT_VIEWER_DEFAULT_ZOOM = 1.0;
export const DOCUMENT_VIEWER_MIN_ZOOM = 0.5;
export const DOCUMENT_VIEWER_MAX_ZOOM = 3.0;
export const DOCUMENT_VIEWER_ZOOM_STEP = 0.25;

// PDF.js Settings
export const PDFJS_WORKER_SRC = '/pdf.worker.min.js';
export const PDFJS_CMAP_URL = '/cmaps/';
export const PDFJS_CMAP_PACKED = true;
export const PDFJS_MAX_IMAGE_SIZE = 1048576; // 1MB

// Graph/Visualization
export const GRAPH_MAX_NODES = 1000;
export const GRAPH_MAX_EDGES = 5000;
export const GRAPH_PHYSICS_ENABLED = true;
export const GRAPH_PHYSICS_WORKER = true;
export const GRAPH_LAYOUT_ALGORITHM = 'force-directed';
export const GRAPH_NODE_COLLISION_RADIUS = 50;
export const GRAPH_EDGE_BUNDLING = false;

// Nexus Graph
export const NEXUS_GRAPH_ENABLED = true;
export const NEXUS_GRAPH_MAX_DEPTH = 3;
export const NEXUS_GRAPH_MIN_RELEVANCE = 0.3;

// Date/Time
export const DEFAULT_DATE_FORMAT = 'MM/dd/yyyy';
export const DEFAULT_TIME_FORMAT = 'hh:mm a';
export const DEFAULT_DATETIME_FORMAT = 'MM/dd/yyyy hh:mm a';
export const DEFAULT_TIMEZONE = 'America/New_York';
export const ENABLE_RELATIVE_TIME = true;
export const RELATIVE_TIME_THRESHOLD_HOURS = 24; // Show relative time if < 24 hours

// Calendar
export const CALENDAR_FIRST_DAY_OF_WEEK = 0; // Sunday
export const CALENDAR_DEFAULT_VIEW = 'month';
export const CALENDAR_ENABLE_WEEKEND = true;

// AI/ML
export const AI_ENABLED = true;
export const AI_PROVIDER = 'gemini'; // 'gemini' | 'openai' | 'custom'
export const AI_MAX_TOKENS = 2048;
export const AI_TEMPERATURE = 0.7;
export const AI_TIMEOUT_MS = 60000; // 1 minute
export const AI_RETRY_ATTEMPTS = 2;
export const AI_LEGAL_RESEARCH_ENABLED = true;
export const AI_CITATION_ANALYSIS_ENABLED = true;
export const AI_DOCUMENT_SUMMARY_ENABLED = true;
export const AI_BRIEF_GENERATION_ENABLED = true;

// Analytics
export const ANALYTICS_ENABLED = false; // Set to true when backend analytics ready
export const ANALYTICS_TRACK_PAGEVIEWS = true;
export const ANALYTICS_TRACK_EVENTS = true;
export const ANALYTICS_BATCH_SIZE = 10;
export const ANALYTICS_FLUSH_INTERVAL_MS = 30000; // 30 seconds
export const ANALYTICS_ANONYMIZE_IP = true;

// Compliance & Regulations
export const COMPLIANCE_HIPAA_MODE = false;
export const COMPLIANCE_GDPR_MODE = false;
export const COMPLIANCE_CCPA_MODE = false;
export const COMPLIANCE_SOC2_MODE = false;

// Data Retention
export const DATA_RETENTION_ENABLED = true;
export const DATA_RETENTION_DAYS = 2555; // 7 years (legal requirement)
export const DATA_SOFT_DELETE = true;
export const DATA_PURGE_SCHEDULE_CRON = '0 2 * * 0'; // 2 AM every Sunday

// Integration Endpoints - Lazy evaluation (only call when needed, not at module load)
export const getPacerUrl = () => import.meta.env.VITE_PACER_URL || '';
export const getWestlawUrl = () => import.meta.env.VITE_WESTLAW_URL || '';
export const getLexisUrl = () => import.meta.env.VITE_LEXIS_URL || '';
export const getGoogleClientId = () => import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const getOutlookClientId = () => import.meta.env.VITE_OUTLOOK_CLIENT_ID || '';

// Backup & Recovery
export const BACKUP_AUTO_ENABLED = true;
export const BACKUP_INTERVAL_MS = 3600000; // 1 hour
export const BACKUP_MAX_BACKUPS = 10;
export const BACKUP_COMPRESSION_ENABLED = true;
export const BACKUP_INCLUDE_FILES = false; // Files are stored separately

// Accessibility
export const A11Y_ENABLE_HIGH_CONTRAST = false;
export const A11Y_ENABLE_SCREEN_READER = true;
export const A11Y_ENABLE_KEYBOARD_NAVIGATION = true;
export const A11Y_FOCUS_VISIBLE = true;
export const A11Y_SKIP_LINK_ENABLED = true;

// Performance Optimization
export const ENABLE_CODE_SPLITTING = true;
export const PRELOAD_ROUTES = ['dashboard', 'cases'];
export const LAZY_LOAD_IMAGES = true;
export const LAZY_LOAD_THRESHOLD = '200px';
export const VIRTUAL_SCROLL_ENABLED = true;
export const VIRTUAL_SCROLL_ITEM_HEIGHT = 48;
export const VIRTUAL_SCROLL_BUFFER_SIZE = 5;
export const ENABLE_WEB_WORKERS = true;
export const WEB_WORKER_MAX_THREADS = 4;
export const ENABLE_SERVICE_WORKER = false; // Set true for PWA
export const SERVICE_WORKER_UPDATE_INTERVAL_MS = 3600000; // 1 hour

// Export as consolidated object
export const LEGAL_CONFIG = {
  case: {
    numberFormat: CASE_NUMBER_FORMAT,
    enableConflictCheck: CASE_ENABLE_CONFLICT_CHECK,
    autoCreateFolders: CASE_AUTO_CREATE_FOLDERS,
  },
  docket: {
    autoRefreshEnabled: DOCKET_AUTO_REFRESH_ENABLED,
    autoRefreshIntervalMinutes: DOCKET_AUTO_REFRESH_INTERVAL_MINUTES,
    pacerIntegrationEnabled: DOCKET_PACER_INTEGRATION_ENABLED,
  },
  discovery: {
    enablePrivilegeLog: DISCOVERY_ENABLE_PRIVILEGE_LOG,
    enableChainOfCustody: DISCOVERY_ENABLE_CHAIN_OF_CUSTODY,
    autoNumberExhibits: DISCOVERY_AUTO_NUMBER_EXHIBITS,
    exhibitPrefix: DISCOVERY_EXHIBIT_PREFIX,
  },
  billing: {
    defaultCurrency: BILLING_DEFAULT_CURRENCY,
    timeIncrementMinutes: BILLING_TIME_INCREMENT_MINUTES,
    roundToIncrement: BILLING_ROUND_TO_INCREMENT,
    enableTimer: BILLING_ENABLE_TIMER,
    autoStopTimerHours: BILLING_AUTO_STOP_TIMER_HOURS,
  },
  pleadings: {
    defaultFont: PLEADING_DEFAULT_FONT,
    defaultFontSize: PLEADING_DEFAULT_FONT_SIZE,
    defaultLineSpacing: PLEADING_DEFAULT_LINE_SPACING,
    defaultMarginInches: PLEADING_DEFAULT_MARGIN_INCHES,
  },
  citations: {
    format: CITATION_FORMAT,
    autoComplete: CITATION_AUTO_COMPLETE,
    validateOnPaste: CITATION_VALIDATE_ON_PASTE,
  },
  documentViewer: {
    enableAnnotations: DOCUMENT_VIEWER_ENABLE_ANNOTATIONS,
    enableRedactions: DOCUMENT_VIEWER_ENABLE_REDACTIONS,
    enableSearch: DOCUMENT_VIEWER_ENABLE_SEARCH,
    defaultZoom: DOCUMENT_VIEWER_DEFAULT_ZOOM,
    minZoom: DOCUMENT_VIEWER_MIN_ZOOM,
    maxZoom: DOCUMENT_VIEWER_MAX_ZOOM,
    zoomStep: DOCUMENT_VIEWER_ZOOM_STEP,
  },
  pdfjs: {
    workerSrc: PDFJS_WORKER_SRC,
    cmapUrl: PDFJS_CMAP_URL,
    cmapPacked: PDFJS_CMAP_PACKED,
    maxImageSize: PDFJS_MAX_IMAGE_SIZE,
  },
  graph: {
    maxNodes: GRAPH_MAX_NODES,
    maxEdges: GRAPH_MAX_EDGES,
    physicsEnabled: GRAPH_PHYSICS_ENABLED,
    physicsWorker: GRAPH_PHYSICS_WORKER,
    layoutAlgorithm: GRAPH_LAYOUT_ALGORITHM,
    nodeCollisionRadius: GRAPH_NODE_COLLISION_RADIUS,
    edgeBundling: GRAPH_EDGE_BUNDLING,
  },
  nexusGraph: {
    enabled: NEXUS_GRAPH_ENABLED,
    maxDepth: NEXUS_GRAPH_MAX_DEPTH,
    minRelevance: NEXUS_GRAPH_MIN_RELEVANCE,
  },
  dateTime: {
    dateFormat: DEFAULT_DATE_FORMAT,
    timeFormat: DEFAULT_TIME_FORMAT,
    datetimeFormat: DEFAULT_DATETIME_FORMAT,
    timezone: DEFAULT_TIMEZONE,
    enableRelativeTime: ENABLE_RELATIVE_TIME,
    relativeTimeThresholdHours: RELATIVE_TIME_THRESHOLD_HOURS,
  },
  calendar: {
    firstDayOfWeek: CALENDAR_FIRST_DAY_OF_WEEK,
    defaultView: CALENDAR_DEFAULT_VIEW,
    enableWeekend: CALENDAR_ENABLE_WEEKEND,
  },
  ai: {
    enabled: AI_ENABLED,
    provider: AI_PROVIDER,
    maxTokens: AI_MAX_TOKENS,
    temperature: AI_TEMPERATURE,
    timeoutMs: AI_TIMEOUT_MS,
    retryAttempts: AI_RETRY_ATTEMPTS,
    legalResearchEnabled: AI_LEGAL_RESEARCH_ENABLED,
    citationAnalysisEnabled: AI_CITATION_ANALYSIS_ENABLED,
    documentSummaryEnabled: AI_DOCUMENT_SUMMARY_ENABLED,
    briefGenerationEnabled: AI_BRIEF_GENERATION_ENABLED,
  },
  analytics: {
    enabled: ANALYTICS_ENABLED,
    trackPageviews: ANALYTICS_TRACK_PAGEVIEWS,
    trackEvents: ANALYTICS_TRACK_EVENTS,
    batchSize: ANALYTICS_BATCH_SIZE,
    flushIntervalMs: ANALYTICS_FLUSH_INTERVAL_MS,
    anonymizeIp: ANALYTICS_ANONYMIZE_IP,
  },
  compliance: {
    hipaaMode: COMPLIANCE_HIPAA_MODE,
    gdprMode: COMPLIANCE_GDPR_MODE,
    ccpaMode: COMPLIANCE_CCPA_MODE,
    soc2Mode: COMPLIANCE_SOC2_MODE,
  },
  dataRetention: {
    enabled: DATA_RETENTION_ENABLED,
    days: DATA_RETENTION_DAYS,
    softDelete: DATA_SOFT_DELETE,
    purgeScheduleCron: DATA_PURGE_SCHEDULE_CRON,
  },
  integrations: {
    pacerUrl: INTEGRATION_PACER_URL,
    westlawUrl: INTEGRATION_WESTLAW_URL,
    lexisUrl: INTEGRATION_LEXIS_URL,
    googleCalendarClientId: INTEGRATION_GOOGLE_CALENDAR_CLIENT_ID,
    outlookClientId: INTEGRATION_OUTLOOK_CLIENT_ID,
  },
  backup: {
    autoEnabled: BACKUP_AUTO_ENABLED,
    intervalMs: BACKUP_INTERVAL_MS,
    maxBackups: BACKUP_MAX_BACKUPS,
    compressionEnabled: BACKUP_COMPRESSION_ENABLED,
    includeFiles: BACKUP_INCLUDE_FILES,
  },
  accessibility: {
    enableHighContrast: A11Y_ENABLE_HIGH_CONTRAST,
    enableScreenReader: A11Y_ENABLE_SCREEN_READER,
    enableKeyboardNavigation: A11Y_ENABLE_KEYBOARD_NAVIGATION,
    focusVisible: A11Y_FOCUS_VISIBLE,
    skipLinkEnabled: A11Y_SKIP_LINK_ENABLED,
  },
  performance: {
    codeSplitting: ENABLE_CODE_SPLITTING,
    preloadRoutes: PRELOAD_ROUTES,
    lazyLoadImages: LAZY_LOAD_IMAGES,
    lazyLoadThreshold: LAZY_LOAD_THRESHOLD,
    virtualScrollEnabled: VIRTUAL_SCROLL_ENABLED,
    virtualScrollItemHeight: VIRTUAL_SCROLL_ITEM_HEIGHT,
    virtualScrollBufferSize: VIRTUAL_SCROLL_BUFFER_SIZE,
    webWorkersEnabled: ENABLE_WEB_WORKERS,
    webWorkerMaxThreads: WEB_WORKER_MAX_THREADS,
    serviceWorkerEnabled: ENABLE_SERVICE_WORKER,
    serviceWorkerUpdateIntervalMs: SERVICE_WORKER_UPDATE_INTERVAL_MS,
  },
} as const;
