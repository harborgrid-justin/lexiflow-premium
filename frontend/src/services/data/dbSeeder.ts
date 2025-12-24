import { STORES, DatabaseManager } from './db';
import { MOCK_CASES } from '@/api/data/case';
import { MOCK_TASKS } from '@/api/data/workflowTask';
import { MOCK_EVIDENCE } from '@/api/data/evidenceItem';
import { MOCK_DOCUMENTS } from '@/api/data/document';
import { MOCK_DOCKET_ENTRIES } from '@/api/data/docketEntry';
import { MOCK_MOTIONS } from '@/api/data/motion';
import { MOCK_CLIENTS } from '@/api/data/client';
import { MOCK_STAFF } from '@/api/data/staffMember';
import { MOCK_EXPENSES } from '@/api/data/firmExpense';
import { MOCK_ORGS } from '@/api/data/organization';
import { MOCK_GROUPS } from '@/api/data/group';
import { MOCK_LEGAL_HOLDS } from '@/api/data/legalHold';
import { MOCK_PRIVILEGE_LOG } from '@/api/data/privilegeLogEntry';
import { BUSINESS_PROCESSES } from '@/api/data/firmProcess';
import { MOCK_CLAUSES } from '@/api/data/clause';
import { TEMPLATE_LIBRARY } from '@/api/data/workflowTemplates';
import { MOCK_JUDGES } from '@/api/data/judgeProfile';
import { MOCK_COUNSEL } from '@/api/data/opposingCounselProfile';
import { MOCK_USERS } from '@/api/data/user';
import { ExtendedUserProfile, GranularPermission } from '../../types';
import { MOCK_CONFERRALS } from '@/api/data/conferralSession';
import { MOCK_JOINT_PLANS } from '@/api/data/jointPlan';
import { MOCK_STIPULATIONS } from '@/api/data/stipulationRequest';
import { MOCK_DEPOSITIONS, MOCK_ESI_SOURCES, MOCK_PRODUCTIONS, MOCK_INTERVIEWS } from '@/api/data/discoveryExtended';
import { MOCK_DISCOVERY } from '@/api/data/discoveryRequest';
import { MOCK_CONFLICTS } from '@/api/data/conflictCheck';
import { MOCK_WALLS } from '@/api/data/ethicalWall';
import { MOCK_RULES } from '@/api/data/legalRule';
import { LegalEntity, EntityId, CasePhase, CaseId } from '../../types';
import { MOCK_JUDGE_STATS, MOCK_OUTCOME_DATA } from '@/api/data/analyticsStats';
import { MOCK_OKRS } from '@/api/data/strategy';
import { MALWARE_SIGNATURES } from '@/api/data/security';
import { PLEADING_TEMPLATES } from '@/api/data/pleadingTemplate';
import { MOCK_CONVERSATIONS } from '@/api/data/conversation';
import { MOCK_WIKI_ARTICLES, MOCK_PRECEDENTS, MOCK_QA_ITEMS } from '@/api/data/mockKnowledge';

// New mock data imports
import { MOCK_CLE_TRACKING } from '@/api/data/cle';
import { MOCK_VENDOR_CONTRACTS } from '@/api/data/vendorContract';
import { MOCK_RFPS } from '@/api/data/rfp';
import { MOCK_MAINTENANCE_TICKETS } from '@/api/data/maintenanceTicket';
import { MOCK_FACILITIES } from '@/api/data/facility';
import { MOCK_VENDOR_DIRECTORY } from '@/api/data/vendorDirectory';
import { MOCK_REPORTERS } from '@/api/data/reporters';
import { MOCK_JURISDICTIONS } from '@/api/data/jurisdiction';
import { MOCK_INVOICES } from '@/api/data/invoice';
import { MOCK_LEADS, MOCK_CRM_ANALYTICS } from '@/api/data/crm';
import { MOCK_REALIZATION_DATA, MOCK_OPERATING_SUMMARY } from '@/api/data/billingStats';
import { MOCK_DISCOVERY_FUNNEL, MOCK_DISCOVERY_CUSTODIANS } from '@/api/data/discoveryCharts';
import { MOCK_EXHIBITS } from '@/api/data/exhibit';
import { MOCK_ADVISORS } from '@/api/data/advisor';
import { MOCK_OPPOSITION } from '@/api/data/opposition';

const MOCK_PHASES: CasePhase[] = [
    { id: 'p1', caseId: 'C-2024-001' as CaseId, name: 'Intake & Investigation', startDate: '2023-11-15', duration: 45, status: 'Completed', color: 'bg-green-500' },
    { id: 'p2', caseId: 'C-2024-001' as CaseId, name: 'Pleadings', startDate: '2024-01-01', duration: 60, status: 'Completed', color: 'bg-blue-500' },
    { id: 'p3', caseId: 'C-2025-001' as CaseId, name: 'Discovery', startDate: '2025-01-20', duration: 120, status: 'Active', color: 'bg-indigo-500' }
];

// Create comprehensive admin permissions
const createAdminPermissions = (): GranularPermission[] => {
  const globalResources = [
    'cases', 'documents', 'pleadings', 'evidence', 'docket', 'correspondence',
    'billing', 'billing.invoices', 'billing.timesheets', 'billing.expenses', 'financials',
    'hr', 'hr.employees', 'hr.payroll', 'personnel',
    'workflow', 'operations', 'tasks', 'calendar',
    'discovery', 'trial', 'depositions', 'interrogatories',
    'compliance', 'audit', 'audit.logs', 'security', 'security.settings', 'security.access',
    'admin', 'admin.settings', 'admin.users', 'admin.roles', 'admin.permissions',
    'integrations', 'api.keys', 'webhooks', 'data.sources',
    'knowledge', 'knowledge.base', 'legal.research', 'citation.analysis',
    'crm', 'clients', 'contacts',
    'analytics', 'reports', 'dashboards', 'metrics',
    'quality', 'quality.control', 'quality.audits',
    'catalog', 'backup', 'backup.restore',
    'marketing', 'marketing.campaigns',
    'jurisdiction', 'jurisdiction.data',
    'system', 'system.admin', 'system.config', 'database', 'database.management'
  ];

  return globalResources.map((resource, index) => ({
    id: `perm-global-${index + 1}`,
    resource,
    action: '*' as const,
    effect: 'Allow' as const,
    scope: 'Global' as const,
    conditions: [],
    reason: 'Super Admin - Complete System Access'
  }));
};

export const Seeder = {
  async seed(db: DatabaseManager) {
      console.log("Seeding Initial Data...");
      
      const batchPut = async (store: string, data: unknown[]) => {
          await db.bulkPut(store, data);
      };
      
      const allEntities: LegalEntity[] = [];
      const seen = new Set<string>();

      const addEntity = (entity: LegalEntity) => {
          if (!seen.has(entity.id)) {
              allEntities.push(entity);
              seen.add(entity.id);
          }
      };
      
      MOCK_USERS.forEach(u => addEntity({ ...u, id: u.id as any, type: 'Individual', roles: [u.role as any], status: 'Active', riskScore: 10, tags: ['Internal'] }));
      MOCK_CLIENTS.forEach(c => addEntity({ id: `ent-cli-${c.id}` as EntityId, name: c.name, type: 'Corporation', roles: ['Client'], status: c.status as any, riskScore: 30, tags: [c.industry] }));
      MOCK_CASES.forEach(c => c.parties?.forEach(p => addEntity({ id: `ent-pty-${p.id}` as EntityId, name: p.name, type: p.type, roles: [p.role as any, 'Party'], status: 'Active', riskScore: 50, tags: [] })));
      MOCK_JUDGES.forEach(j => addEntity({ id: `ent-jdg-${j.id}` as EntityId, name: j.name, type: 'Individual', roles: ['Judge'], status: 'Active', riskScore: 5, tags: [j.court] }));
      MOCK_COUNSEL.forEach(c => addEntity({ id: `ent-cnsl-${c.id}` as EntityId, name: c.name, type: 'Law Firm', roles: ['Opposing Counsel'], status: 'Active', riskScore: 60, tags: [] }));

      // Create extended user profiles with permissions
      const adminPermissions = createAdminPermissions();
      const extendedUsers: ExtendedUserProfile[] = MOCK_USERS.map(user => ({
        ...user,
        entityId: user.id as any,
        title: user.id === 'usr-admin-justin' ? 'System Administrator' : user.role === 'Senior Partner' ? 'Senior Partner' : user.role,
        department: user.id === 'usr-admin-justin' ? 'Administration' : 'Litigation',
        accessMatrix: user.id === 'usr-admin-justin' ? adminPermissions : [
          { id: 'perm-basic-1', resource: 'cases', action: 'read', effect: 'Allow', scope: 'Personal' },
          { id: 'perm-basic-2', resource: 'documents', action: 'read', effect: 'Allow', scope: 'Personal' }
        ],
        preferences: {
          theme: 'system',
          notifications: { email: true, push: true, slack: false, digestFrequency: 'Daily' },
          dashboardLayout: ['metrics', 'tasks', 'calendar'],
          density: 'comfortable',
          locale: 'en-US',
          timezone: 'America/New_York'
        },
        security: {
          mfaEnabled: user.id === 'usr-admin-justin',
          mfaMethod: 'App',
          lastPasswordChange: new Date().toISOString().split('T')[0],
          passwordExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          activeSessions: [
            { id: 'sess-1', device: 'Current Device', ip: '127.0.0.1', lastActive: 'Just now', current: true }
          ]
        },
        skills: user.id === 'usr-admin-justin' 
          ? ['System Administration', 'Legal Operations', 'Security Management']
          : ['Legal Research', 'Case Management'],
        barAdmissions: user.id === 'usr-admin-justin' 
          ? [{ state: 'VA', number: '99823', status: 'Active' }, { state: 'DC', number: '445210', status: 'Active' }]
          : []
      }));

      await Promise.all([
          batchPut(STORES.CASES, MOCK_CASES),
          batchPut(STORES.TASKS, MOCK_TASKS),
          batchPut(STORES.EVIDENCE, MOCK_EVIDENCE),
          batchPut(STORES.DOCUMENTS, MOCK_DOCUMENTS),
          batchPut(STORES.DOCKET, MOCK_DOCKET_ENTRIES),
          batchPut(STORES.MOTIONS, MOCK_MOTIONS),
          batchPut(STORES.CLIENTS, MOCK_CLIENTS),
          batchPut(STORES.STAFF, MOCK_STAFF),
          batchPut(STORES.EXPENSES, MOCK_EXPENSES),
          batchPut(STORES.ORGS, MOCK_ORGS),
          batchPut(STORES.GROUPS, MOCK_GROUPS),
          batchPut(STORES.LEGAL_HOLDS, MOCK_LEGAL_HOLDS),
          batchPut(STORES.PRIVILEGE_LOG, MOCK_PRIVILEGE_LOG),
          batchPut(STORES.PROCESSES, BUSINESS_PROCESSES),
          batchPut(STORES.CLAUSES, MOCK_CLAUSES),
          batchPut(STORES.TEMPLATES, TEMPLATE_LIBRARY),
          batchPut(STORES.JUDGES, MOCK_JUDGES),
          batchPut(STORES.COUNSEL, MOCK_COUNSEL),
          batchPut(STORES.USERS, extendedUsers),
          batchPut(STORES.CONFERRALS, MOCK_CONFERRALS),
          batchPut(STORES.JOINT_PLANS, MOCK_JOINT_PLANS),
          batchPut(STORES.STIPULATIONS, MOCK_STIPULATIONS),
          batchPut(STORES.DISCOVERY_EXT_DEPO, MOCK_DEPOSITIONS),
          batchPut(STORES.DISCOVERY_EXT_ESI, MOCK_ESI_SOURCES),
          batchPut(STORES.DISCOVERY_EXT_PROD, MOCK_PRODUCTIONS),
          batchPut(STORES.DISCOVERY_EXT_INT, MOCK_INTERVIEWS),
          batchPut(STORES.REQUESTS, MOCK_DISCOVERY),
          batchPut(STORES.CONFLICTS, MOCK_CONFLICTS),
          batchPut(STORES.WALLS, MOCK_WALLS),
          batchPut(STORES.RULES, MOCK_RULES),
          batchPut(STORES.ENTITIES, allEntities),
          batchPut(STORES.CONVERSATIONS, MOCK_CONVERSATIONS),
          batchPut(STORES.COUNSEL_PROFILES, MOCK_COUNSEL),
          batchPut(STORES.JUDGE_MOTION_STATS, MOCK_JUDGE_STATS.map((stat, i) => ({...stat, id: `jms-${i}`}))),
          batchPut(STORES.OUTCOME_PREDICTIONS, MOCK_OUTCOME_DATA.map((d, i) => ({...d, id: `op-${i}`}))),
          batchPut(STORES.OKRS, MOCK_OKRS),
          batchPut(STORES.MALWARE_SIGNATURES, MALWARE_SIGNATURES.map((sig, i) => ({id: `sig-${i}`, signature: sig}))),
          batchPut(STORES.PLEADING_TEMPLATES, PLEADING_TEMPLATES),
          batchPut(STORES.CLE_TRACKING, MOCK_CLE_TRACKING),
          batchPut(STORES.VENDOR_CONTRACTS, MOCK_VENDOR_CONTRACTS),
          batchPut(STORES.RFPS, MOCK_RFPS),
          batchPut(STORES.MAINTENANCE_TICKETS, MOCK_MAINTENANCE_TICKETS),
          batchPut(STORES.FACILITIES, MOCK_FACILITIES),
          batchPut(STORES.VENDOR_DIRECTORY, MOCK_VENDOR_DIRECTORY),
          batchPut(STORES.REPORTERS, MOCK_REPORTERS),
          batchPut(STORES.JURISDICTIONS, MOCK_JURISDICTIONS),
          batchPut(STORES.INVOICES, MOCK_INVOICES),
          batchPut(STORES.LEADS, MOCK_LEADS),
          db.put(STORES.CRM_ANALYTICS, MOCK_CRM_ANALYTICS),
          db.put(STORES.REALIZATION_STATS, MOCK_REALIZATION_DATA),
          db.put(STORES.OPERATING_SUMMARY, MOCK_OPERATING_SUMMARY),
          db.put(STORES.DISCOVERY_FUNNEL_STATS, MOCK_DISCOVERY_FUNNEL),
          db.put(STORES.DISCOVERY_CUSTODIAN_STATS, MOCK_DISCOVERY_CUSTODIANS),
          // Knowledge Base
          batchPut(STORES.WIKI, MOCK_WIKI_ARTICLES),
          batchPut(STORES.PRECEDENTS, MOCK_PRECEDENTS),
          batchPut(STORES.QA, MOCK_QA_ITEMS),
          // War Room
          batchPut(STORES.EXHIBITS, MOCK_EXHIBITS),
          batchPut(STORES.ADVISORS, MOCK_ADVISORS),
          batchPut(STORES.OPPOSITION, MOCK_OPPOSITION),
          // New
          batchPut(STORES.PHASES, MOCK_PHASES),
      ]);
      console.log("Seeding Complete.");
  }
};
