
import { PATHS } from '../constants/paths';

// Regex patterns cached for performance
const Patterns = {
    FINANCE: /money|financ|bill|revenue/i,
    TASKS: /task|todo|work/i,
    ALERTS: /alert|notif/i,
    DOCKET: /docket|calendar/i,
    INTAKE: /intake|lead|new/i,
    CONFLICTS: /conflict|check/i,
    RESOURCES: /resource|staff/i,
    TRUST: /trust|account|iolta/i,
    EXPERTS: /expert/i,
    REPORTERS: /report|steno/i,
    CLOSING: /clos|binder/i,
    ARCHIVED: /archiv|old|cold/i,
    TEMPLATES: /template|library/i,
    FIRM: /firm|process/i,
    OPS: /op|center/i,
    ANALYTICS: /anal|stat|metric/i,
    SETTINGS: /conf|setting/i,
    PROCESS: /serv|process|job/i,
    STICKER: /sticker|label|design/i,
    STATS: /stat|anal|count/i,
    COUNSEL: /counsel|oppos|firm/i,
    PREDICTION: /predict|outcome|forecast/i,
    SHEPARD: /shep|key|check|signal/i,
    BLUEBOOK: /blue|format/i,
    EVIDENCE: /evid|wall/i,
    WITNESS: /witness/i,
    BINDER: /binder|notebook/i,
    INTEL: /oppos|intel/i,
    ADVISORY: /adv|expert/i,
    REQUESTS: /request|rog|rfa/i,
    DEPOSITIONS: /depos|witnes/i,
    PRODUCTIONS: /prod/i,
    ESI: /esi|data/i,
    PRIVILEGE: /privilege/i,
    HOLD: /hold/i,
    INTERVIEW: /interview/i,
    CUSTODY: /custody|chain/i,
    INVENTORY: /invent|list/i,
    LOG: /intake|log|add/i,
    HISTORY: /his/i,
    SAVED: /sav|book/i,
    CONFIG: /set|config/i,
    STATE: /state/i,
    MAP: /map|geo/i,
    REGULATORY: /reg|admin/i,
    INTERNATIONAL: /inter|hague/i,
    ARBITRATION: /arb|adr/i,
    LOCAL: /rule|local/i,
    INVOICE: /invoice/i,
    WIP: /wip|work|time/i,
    EXPENSE: /expense|ledger|trust/i,
    HR: /hr|staff/i,
    ASSET: /asset|it/i,
    MARKETING: /market|lead/i,
    DIRECTORY: /direct|list/i,
    PIPELINE: /pipe|intake/i,
    WALL: /wall|barrier/i,
    POLICY: /policy|regulat/i,
    HIERARCHY: /user|role|hierarchy/i,
    SECURITY: /secur/i,
    DB: /db|data/i,
    LOGS: /log|audit/i,
    INTEGRATION: /integrat/i,
    SCHEMA: /schema|model|diagram/i,
    MIGRATION: /migrat|change/i,
    QUERY: /query|sql|select/i,
    QUERY_HIST: /history/i,
    PIPELINE_DAG: /pipeline|etl|job/i,
    CONNECT: /connect/i,
    LAKE: /lake|s3|store/i,
    LINEAGE: /lineage|depend/i,
    QUALITY: /quality|clean/i,
    VALIDATION: /rule|valid/i,
    GOVERNANCE: /govern|compliance/i,
    CATALOG: /catalog|diction/i,
    RLS: /secur|rls|policy/i,
    ROLES: /role|access/i,
    REPLICATION: /replic|failover/i,
    API: /api|key/i,
    BACKUP: /backup|recover|vault/i,
    COST: /cost|finops|spend/i,
    RECENT: /recent/i,
    FAVORITES: /favor/i,
    PRECEDENTS: /prec/i,
    QA: /qa|ask/i,
    USAGE: /anal|usage/i,
    CIVIL: /frcp|civ/i,
    FRE: /fre|evid/i,
    ORDER: /order|stand/i,
    SEARCH: /search|find/i,
    CONTACTS: /contact|people/i,
    FILES: /file|doc/i,
    ARCHIVED_MSG: /arch/i,
    ORDERS: /order|judgment/i
};

export const HolographicRouting = {
  /**
   * Resolves a specific tab/view within a module based on the user's natural language context.
   * This enables "Deep Linking" via Neural Commands.
   */
  resolveTab: (moduleId: string, context: string = ''): string | undefined => {
    // Optimization: Check for empty string early
    if (!context) return undefined;
    
    // Check specific module matches
    switch (moduleId) {
        case PATHS.DASHBOARD:
            if (Patterns.FINANCE.test(context)) return 'financials';
            if (Patterns.TASKS.test(context)) return 'tasks';
            if (Patterns.ALERTS.test(context)) return 'notifications';
            return 'overview';

        case PATHS.CASES:
            if (Patterns.DOCKET.test(context)) return 'docket';
            if (Patterns.TASKS.test(context)) return 'tasks';
            if (Patterns.INTAKE.test(context)) return 'intake';
            if (Patterns.CONFLICTS.test(context)) return 'conflicts';
            if (Patterns.RESOURCES.test(context)) return 'resources';
            if (Patterns.TRUST.test(context)) return 'trust';
            if (Patterns.EXPERTS.test(context)) return 'experts';
            if (Patterns.REPORTERS.test(context)) return 'reporters';
            if (Patterns.CLOSING.test(context)) return 'closing';
            if (Patterns.ARCHIVED.test(context)) return 'archived';
            return 'active';

        case PATHS.WORKFLOWS:
            if (Patterns.TEMPLATES.test(context)) return 'templates';
            if (Patterns.FIRM.test(context)) return 'firm';
            if (Patterns.OPS.test(context)) return 'ops_center';
            if (Patterns.ANALYTICS.test(context)) return 'analytics';
            if (Patterns.SETTINGS.test(context)) return 'settings';
            return 'cases';

        case PATHS.CORRESPONDENCE:
            if (Patterns.PROCESS.test(context)) return 'process';
            return 'communications';

        case PATHS.EXHIBITS:
            if (Patterns.STICKER.test(context)) return 'sticker';
            if (Patterns.STATS.test(context)) return 'stats';
            return 'list';

        case PATHS.ANALYTICS:
            if (Patterns.COUNSEL.test(context)) return 'counsel';
            if (Patterns.PREDICTION.test(context)) return 'prediction';
            return 'judge';

        case PATHS.CITATIONS:
            if (Patterns.SHEPARD.test(context)) return 'shepard';
            if (Patterns.BLUEBOOK.test(context)) return 'bluebook';
            return 'library';

        case PATHS.WAR_ROOM:
            if (Patterns.EVIDENCE.test(context)) return 'evidence';
            if (Patterns.WITNESS.test(context)) return 'witnesses';
            if (Patterns.BINDER.test(context)) return 'binder';
            if (Patterns.INTEL.test(context)) return 'opposition';
            if (Patterns.ADVISORY.test(context)) return 'advisory';
            return 'command';

        case PATHS.DISCOVERY:
            if (Patterns.REQUESTS.test(context)) return 'requests';
            if (Patterns.DEPOSITIONS.test(context)) return 'depositions';
            if (Patterns.PRODUCTIONS.test(context)) return 'productions';
            if (Patterns.ESI.test(context)) return 'esi';
            if (Patterns.PRIVILEGE.test(context)) return 'privilege';
            if (Patterns.HOLD.test(context)) return 'holds';
            if (Patterns.INTERVIEW.test(context)) return 'interviews';
            return 'dashboard';

        case PATHS.EVIDENCE:
            if (Patterns.CUSTODY.test(context)) return 'custody';
            if (Patterns.INVENTORY.test(context)) return 'inventory';
            if (Patterns.LOG.test(context)) return 'intake';
            return 'dashboard';

        case PATHS.RESEARCH:
            if (Patterns.HISTORY.test(context)) return 'history';
            if (Patterns.SAVED.test(context)) return 'saved';
            if (Patterns.CONFIG.test(context)) return 'settings';
            return 'active';

        case PATHS.JURISDICTION:
            if (Patterns.STATE.test(context)) return 'state';
            if (Patterns.MAP.test(context)) return 'map';
            if (Patterns.REGULATORY.test(context)) return 'regulatory';
            if (Patterns.INTERNATIONAL.test(context)) return 'international';
            if (Patterns.ARBITRATION.test(context)) return 'arbitration';
            if (Patterns.LOCAL.test(context)) return 'local';
            return 'federal';

        case PATHS.BILLING:
            if (Patterns.INVOICE.test(context)) return 'invoices';
            if (Patterns.WIP.test(context)) return 'wip';
            if (Patterns.EXPENSE.test(context)) return 'expenses';
            if (Patterns.ANALYTICS.test(context)) return 'analytics';
            return 'overview';
    
        case PATHS.PRACTICE:
            if (Patterns.HR.test(context)) return 'hr';
            if (Patterns.ASSET.test(context)) return 'assets';
            if (Patterns.FINANCE.test(context)) return 'finance';
            if (Patterns.MARKETING.test(context)) return 'marketing';
            return 'hr';

        case PATHS.CRM:
            if (Patterns.DIRECTORY.test(context)) return 'directory';
            if (Patterns.PIPELINE.test(context)) return 'pipeline';
            if (Patterns.ANALYTICS.test(context)) return 'analytics';
            return 'dashboard';

        case PATHS.COMPLIANCE:
            if (Patterns.CONFLICTS.test(context)) return 'conflicts';
            if (Patterns.WALL.test(context)) return 'walls';
            if (Patterns.POLICY.test(context)) return 'policies';
            return 'overview';

        case PATHS.ADMIN:
            if (Patterns.HIERARCHY.test(context)) return 'hierarchy';
            if (Patterns.SECURITY.test(context)) return 'security';
            if (Patterns.DB.test(context)) return 'db';
            if (Patterns.LOGS.test(context)) return 'logs';
            if (Patterns.INTEGRATION.test(context)) return 'integrations';
            return 'hierarchy';

        case PATHS.DATA_PLATFORM:
            if (Patterns.SCHEMA.test(context)) return 'schema-designer';
            if (Patterns.MIGRATION.test(context)) return 'schema-migrations';
            if (Patterns.QUERY.test(context)) return 'query-editor';
            if (Patterns.QUERY_HIST.test(context) && Patterns.QUERY.test(context)) return 'query-history';
            if (Patterns.PIPELINE_DAG.test(context)) return 'pipeline-dag';
            if (Patterns.CONNECT.test(context)) return 'pipeline-connectors';
            if (Patterns.LAKE.test(context)) return 'lake';
            if (Patterns.LINEAGE.test(context)) return 'lineage-graph';
            if (Patterns.QUALITY.test(context)) return 'quality-dashboard';
            if (Patterns.VALIDATION.test(context)) return 'quality-rules';
            if (Patterns.GOVERNANCE.test(context)) return 'governance-overview';
            if (Patterns.CATALOG.test(context)) return 'catalog-dictionary';
            if (Patterns.RLS.test(context)) return 'security-policies';
            if (Patterns.ROLES.test(context)) return 'security-roles';
            if (Patterns.REPLICATION.test(context)) return 'replication';
            if (Patterns.API.test(context)) return 'api';
            if (Patterns.BACKUP.test(context)) return 'backup';
            if (Patterns.COST.test(context)) return 'cost';
            return 'overview';

        case PATHS.DOCUMENTS:
            if (Patterns.TEMPLATES.test(context)) return 'templates';
            if (Patterns.RECENT.test(context)) return 'recent';
            if (Patterns.FAVORITES.test(context)) return 'favorites';
            return 'browse';

        case PATHS.LIBRARY:
            if (Patterns.PRECEDENTS.test(context)) return 'precedents';
            if (Patterns.QA.test(context)) return 'qa';
            if (Patterns.USAGE.test(context)) return 'insights';
            return 'wiki';
    
        case PATHS.RULES_ENGINE:
            if (Patterns.CIVIL.test(context)) return 'federal_civil';
            if (Patterns.FRE.test(context)) return 'federal_evidence';
            if (Patterns.LOCAL.test(context)) return 'local';
            if (Patterns.ORDER.test(context)) return 'standing_orders';
            if (Patterns.SEARCH.test(context)) return 'search';
            return 'dashboard';

        case PATHS.CLAUSES:
            if (Patterns.FAVORITES.test(context)) return 'favorites';
            if (Patterns.ANALYTICS.test(context)) return 'analytics';
            return 'browse';

        case PATHS.MESSAGES:
            if (Patterns.CONTACTS.test(context)) return 'contacts';
            if (Patterns.FILES.test(context)) return 'files';
            if (Patterns.ARCHIVED_MSG.test(context)) return 'archived';
            return 'chats';
    
        case PATHS.DOCKET:
            if (Patterns.DOCKET.test(context)) return 'calendar';
            if (Patterns.STATS.test(context)) return 'stats';
            if (Patterns.CONFIG.test(context)) return 'sync';
            if (Patterns.ORDERS.test(context)) return 'orders';
            return 'all';

        default:
            return undefined;
    }
  }
};
