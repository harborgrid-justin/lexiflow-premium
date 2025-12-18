import { Repository } from './core/Repository';
import { createRepository, repositoryRegistry } from './core/RepositoryFactory';
import { STORES, db } from './db';
import { CaseRepository, PhaseRepository } from './domains/CaseDomain';
import { ComplianceService } from './domains/ComplianceDomain';
import { AdminService } from './domains/AdminDomain';
import { CorrespondenceService } from './domains/CommunicationDomain';
import { DataQualityService } from './domains/DataQualityDomain';
import { DataCatalogService } from './domains/DataCatalogDomain';
import { BackupService } from './domains/BackupDomain';
import { DocketRepository } from './domains/DocketDomain';
import { ProfileDomain } from './domains/ProfileDomain'; 
import { MarketingService } from './domains/MarketingDomain';
import { IntegrationOrchestrator } from './integrationOrchestrator';
import { SystemEventType } from "../types/integration-types";
import { JurisdictionService } from './domains/JurisdictionDomain';
import { KnowledgeRepository } from './domains/KnowledgeDomain';
// Consolidated API services - single source of truth
import { api, legacyApi } from './api/_legacy-bridge';
import { isBackendApiEnabled } from './apiServices';
import { missingApiServices } from './api/missing-api-services';

// Modular Repositories
import { DocumentRepository } from './repositories/DocumentRepository';
import { HRRepository } from './repositories/HRRepository';
import { EvidenceRepository } from './repositories/EvidenceRepository';
import { WorkflowRepository } from './repositories/WorkflowRepository';
import { BillingRepository } from './repositories/BillingRepository';
import { DiscoveryRepository } from './repositories/DiscoveryRepository';
import { TrialRepository } from './repositories/TrialRepository';
import { PleadingRepository } from './repositories/PleadingRepository';
import { AnalysisRepository } from './repositories/AnalysisRepository';
import { MatterRepository } from './repositories/MatterRepository';
import { CRMService } from './domains/CRMDomain';
import { AnalyticsService } from './domains/AnalyticsDomain';
import { OperationsService } from './domains/OperationsDomain';
import { SecurityService } from './domains/SecurityDomain';

// ========================================
// SINGLETON REPOSITORY CACHE
// ========================================
// This prevents creating multiple repository instances
// across hot module reloads or multiple imports

const repositorySingletons = new Map<string, any>();

function getSingleton<T>(key: string, factory: () => T): T {
  if (!repositorySingletons.has(key)) {
    repositorySingletons.set(key, factory());
  }
  return repositorySingletons.get(key) as T;
}

// Types
import { 
  WorkflowTask, Motion, Project, Risk, Organization, Group,
  User, FirmExpense, TrialExhibit, Citation, BriefAnalysisSession,
  LegalEntity, EntityRelationship, Clause, WorkflowTemplateData,
  WikiArticle, Precedent, QAItem, LegalRule, SystemNotification,
  CalendarEventItem, Client, Conversation, Message, Case, LegalDocument, DocketEntry, EvidenceItem,
  WarRoomData, TimeEntry, JudgeProfile
} from '../types';

import { MOCK_JUDGES } from '../data/models/judgeProfile';
import { MOCK_RULES } from '../data/models/legalRule';
import { delay } from '../utils/async';

// --- WRAPPERS FOR INTEGRATION ---

class IntegratedCaseRepository extends CaseRepository {
    add = async (item: Case): Promise<Case> => {
        const result = await super.add(item);
        IntegrationOrchestrator.publish(SystemEventType.CASE_CREATED, { caseData: result });
        return result;
    }
}

// Singleton instances
const getIntegratedCaseRepository = () => getSingleton('IntegratedCaseRepository', () => new IntegratedCaseRepository());

class IntegratedDocketRepository extends DocketRepository {
    add = async (item: DocketEntry): Promise<DocketEntry> => {
        const result = await super.add(item);
        IntegrationOrchestrator.publish(SystemEventType.DOCKET_INGESTED, { entry: result, caseId: result.caseId });
        return result;
    }
}

const getIntegratedDocketRepository = () => getSingleton('IntegratedDocketRepository', () => new IntegratedDocketRepository());

class IntegratedDocumentRepository extends DocumentRepository {
    add = async (item: LegalDocument): Promise<LegalDocument> => {
        const result = await super.add(item);
        IntegrationOrchestrator.publish(SystemEventType.DOCUMENT_UPLOADED, { document: result });
        return result;
    }
}

const getIntegratedDocumentRepository = () => getSingleton('IntegratedDocumentRepository', () => new IntegratedDocumentRepository());

class IntegratedBillingRepository extends BillingRepository {
    addTimeEntry = async (entry: TimeEntry): Promise<TimeEntry> => {
        const result = await super.addTimeEntry(entry);
        IntegrationOrchestrator.publish(SystemEventType.TIME_LOGGED, { entry: result });
        return result;
    }
}

const getIntegratedBillingRepository = () => getSingleton('IntegratedBillingRepository', () => new IntegratedBillingRepository());
const getEvidenceRepository = () => getSingleton('EvidenceRepository', () => new EvidenceRepository());
const getDiscoveryRepository = () => getSingleton('DiscoveryRepository', () => new DiscoveryRepository());
const getTrialRepository = () => getSingleton('TrialRepository', () => new TrialRepository());
const getPleadingRepository = () => getSingleton('PleadingRepository', () => new PleadingRepository());
const getKnowledgeRepository = () => getSingleton('KnowledgeRepository', () => new KnowledgeRepository());
const getAnalysisRepository = () => getSingleton('AnalysisRepository', () => new AnalysisRepository());
const getPhaseRepository = () => getSingleton('PhaseRepository', () => new PhaseRepository());
const getDataQualityService = () => getSingleton('DataQualityService', () => new DataQualityService());
const getHRRepository = () => getSingleton('HRRepository', () => HRRepository);
const getWorkflowRepository = () => getSingleton('WorkflowRepository', () => WorkflowRepository);

// Matter Management
class IntegratedMatterRepository extends MatterRepository {
    add = async (item: any): Promise<any> => {
        const result = await super.add(item);
        IntegrationOrchestrator.publish(SystemEventType.MATTER_CREATED, { matter: result });
        return result;
    }
}

const getIntegratedMatterRepository = () => getSingleton('IntegratedMatterRepository', () => new IntegratedMatterRepository());

// Extended repositories with custom logic
const getTasksRepository = () => getSingleton('TasksRepository', () => 
  new class extends Repository<WorkflowTask> { 
    constructor() { super(STORES.TASKS); }
    getByCaseId = async (caseId: string) => { return this.getByIndex('caseId', caseId); }
    countByCaseId = async (caseId: string): Promise<number> => {
      const tasks = await this.getByCaseId(caseId);
      return tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed').length;
    }
    add = async (item: WorkflowTask): Promise<WorkflowTask> => {
      const result = await super.add(item as any);
      return result;
    }
    update = async (id: string, updates: Partial<WorkflowTask>): Promise<WorkflowTask> => {
      const result = await super.update(id, updates as any);
      if (updates.status === 'Done' || updates.status === 'Completed') {
        IntegrationOrchestrator.publish(SystemEventType.TASK_COMPLETED, { task: result });
      }
      return result;
    }
  }()
);

const getProjectsRepository = () => getSingleton('ProjectsRepository', () =>
  new class extends Repository<Project> { 
    constructor() { super(STORES.PROJECTS); } 
    getByCaseId = async (caseId: string) => { return this.getByIndex('caseId', caseId); }
  }()
);

const getRisksRepository = () => getSingleton('RisksRepository', () =>
  new class extends Repository<Risk> { 
    constructor() { super(STORES.RISKS); } 
    getByCaseId = async (caseId: string) => { return this.getByIndex('caseId', caseId); }
    add = async (item: Risk): Promise<Risk> => {
      const result = await super.add(item);
      if (result.impact === 'High' && result.probability === 'High') {
        IntegrationOrchestrator.publish(SystemEventType.RISK_ESCALATED, { risk: result });
      }
      return result;
    }
  }()
);

const getMotionsRepository = () => getSingleton('MotionsRepository', () =>
  new class extends Repository<Motion> { 
    constructor() { super(STORES.MOTIONS); }
    getByCaseId = async (caseId: string) => { return this.getByIndex('caseId', caseId); }
  }()
);

const getClientsRepository = () => getSingleton('ClientsRepository', () =>
  new class extends Repository<Client> { 
    constructor() { super(STORES.CLIENTS); }
    generatePortalToken = async (clientId: string) => { return `token-${clientId}-${Date.now()}`; }
  }()
);

const getCitationsRepository = () => getSingleton('CitationsRepository', () =>
  new class extends Repository<Citation> { 
    constructor() { super(STORES.CITATIONS); }
    verifyAll = async () => { return { checked: 150, flagged: 3 }; }
    quickAdd = async (citation: any) => { return this.add(citation); }
  }()
);

const getEntitiesRepository = () => getSingleton('EntitiesRepository', () =>
  new class extends Repository<LegalEntity> { 
    constructor() { super(STORES.ENTITIES); }
    getRelationships = async (id: string) => { return []; } 
    add = async (item: LegalEntity): Promise<LegalEntity> => {
      const result = await super.add(item);
      IntegrationOrchestrator.publish(SystemEventType.ENTITY_CREATED, { entity: result });
      return result;
    }
  }()
);

// --- FACADE WITH LAZY GETTERS ---
// Using getters to ensure repositories are recreated after cleanup

const DataServiceBase: any = {};

// Define getters for all properties to ensure they're recreated after cleanup
Object.defineProperties(DataServiceBase, {
  cases: { get: () => isBackendApiEnabled() ? api.cases : getIntegratedCaseRepository(), enumerable: true },  matters: { get: () => getIntegratedMatterRepository(), enumerable: true },  docket: { get: () => isBackendApiEnabled() ? api.docket : getIntegratedDocketRepository(), enumerable: true },
  evidence: { get: () => isBackendApiEnabled() ? api.evidence : getEvidenceRepository(), enumerable: true },
  documents: { get: () => isBackendApiEnabled() ? api.documents : getIntegratedDocumentRepository(), enumerable: true },
  pleadings: { get: () => isBackendApiEnabled() ? legacyApi.pleadings : getPleadingRepository(), enumerable: true },
  hr: { get: () => isBackendApiEnabled() ? legacyApi.hr : getHRRepository(), enumerable: true },
  workflow: { get: () => isBackendApiEnabled() ? legacyApi.workflowTemplates : getWorkflowRepository(), enumerable: true },
  billing: { get: () => isBackendApiEnabled() ? api.billing : getIntegratedBillingRepository(), enumerable: true },
  discovery: { get: () => getDiscoveryRepository(), enumerable: true },
  trial: { get: () => isBackendApiEnabled() ? legacyApi.trial : getTrialRepository(), enumerable: true },
  compliance: { get: () => ComplianceService, enumerable: true },
  
  // Extended backend API services - Using RepositoryFactory with singleton cache
  trustAccounts: { get: () => isBackendApiEnabled() ? legacyApi.trustAccounts : repositoryRegistry.getOrCreate<any>('trustAccounts'), enumerable: true },
  billingAnalytics: { get: () => isBackendApiEnabled() ? legacyApi.billingAnalytics : repositoryRegistry.getOrCreate<any>('billingAnalytics'), enumerable: true },
  reports: { get: () => isBackendApiEnabled() ? legacyApi.reports : repositoryRegistry.getOrCreate<any>(STORES.REPORTERS), enumerable: true },
  processingJobs: { get: () => isBackendApiEnabled() ? api.processingJobs : repositoryRegistry.getOrCreate<any>(STORES.PROCESSING_JOBS), enumerable: true },
  casePhases: { get: () => isBackendApiEnabled() ? legacyApi.casePhases : repositoryRegistry.getOrCreate<any>(STORES.PHASES), enumerable: true },
  caseTeams: { get: () => isBackendApiEnabled() ? legacyApi.caseTeams : repositoryRegistry.getOrCreate<any>('caseTeams'), enumerable: true },
  parties: { get: () => isBackendApiEnabled() ? legacyApi.parties : repositoryRegistry.getOrCreate<any>('parties'), enumerable: true },

  // Discovery backend API services - Using RepositoryFactory with singleton cache
  legalHolds: { get: () => isBackendApiEnabled() ? legacyApi.legalHolds : repositoryRegistry.getOrCreate<any>(STORES.LEGAL_HOLDS), enumerable: true },
  depositions: { get: () => isBackendApiEnabled() ? legacyApi.depositions : repositoryRegistry.getOrCreate<any>('depositions'), enumerable: true },
  discoveryRequests: { get: () => isBackendApiEnabled() ? legacyApi.discoveryRequests : repositoryRegistry.getOrCreate<any>('discoveryRequests'), enumerable: true },
  esiSources: { get: () => isBackendApiEnabled() ? legacyApi.esiSources : repositoryRegistry.getOrCreate<any>('esiSources'), enumerable: true },
  privilegeLog: { get: () => isBackendApiEnabled() ? legacyApi.privilegeLog : repositoryRegistry.getOrCreate<any>(STORES.PRIVILEGE_LOG), enumerable: true },
  productions: { get: () => isBackendApiEnabled() ? legacyApi.productions : repositoryRegistry.getOrCreate<any>('productions'), enumerable: true },
  custodianInterviews: { get: () => isBackendApiEnabled() ? legacyApi.custodianInterviews : repositoryRegistry.getOrCreate<any>('custodianInterviews'), enumerable: true },

  // Compliance backend API services - Using RepositoryFactory with singleton cache
  conflictChecks: { get: () => isBackendApiEnabled() ? legacyApi.conflictChecks : repositoryRegistry.getOrCreate<any>('conflictChecks'), enumerable: true },
  ethicalWalls: { get: () => isBackendApiEnabled() ? legacyApi.ethicalWalls : repositoryRegistry.getOrCreate<any>('ethicalWalls'), enumerable: true },
  auditLogs: { get: () => isBackendApiEnabled() ? legacyApi.auditLogs : repositoryRegistry.getOrCreate<any>('auditLogs'), enumerable: true },
  permissions: { get: () => isBackendApiEnabled() ? legacyApi.permissions : repositoryRegistry.getOrCreate<any>('permissions'), enumerable: true },
  rlsPolicies: { get: () => isBackendApiEnabled() ? legacyApi.rlsPolicies : repositoryRegistry.getOrCreate<any>(STORES.POLICIES), enumerable: true },
  complianceReports: { get: () => isBackendApiEnabled() ? legacyApi.complianceReports : repositoryRegistry.getOrCreate<any>('complianceReports'), enumerable: true },
  admin: { get: () => AdminService, enumerable: true },
  correspondence: { get: () => CorrespondenceService, enumerable: true },
  quality: { get: () => getDataQualityService(), enumerable: true },
  catalog: { get: () => DataCatalogService, enumerable: true },
  backup: { get: () => BackupService, enumerable: true },
  profile: { get: () => ProfileDomain, enumerable: true },
  crm: { get: () => CRMService, enumerable: true },
  analytics: { get: () => AnalyticsService, enumerable: true },
  operations: { get: () => OperationsService, enumerable: true },
  security: { get: () => SecurityService, enumerable: true },
  marketing: { get: () => MarketingService, enumerable: true },
  jurisdiction: { get: () => JurisdictionService, enumerable: true },
  knowledge: { get: () => isBackendApiEnabled() ? legacyApi.knowledgeBase : getKnowledgeRepository(), enumerable: true },
  
  analysis: { get: () => getAnalysisRepository(), enumerable: true },

  // Strategy Management (Arguments, Defenses, Citations)
  strategy: { 
    get: () => ({
      getAll: async (caseId: string, type?: 'Argument' | 'Defense' | 'Citation') => {
        const [args, defs, cits] = await Promise.all([
          db.getAll<any>(STORES.CASE_STRATEGIES),
          db.getAll<any>(STORES.CASE_STRATEGIES),
          db.getAll<Citation>(STORES.CITATIONS)
        ]);
        if (type === 'Argument') return args.filter((s: any) => s.type === 'Argument' && s.caseId === caseId);
        if (type === 'Defense') return defs.filter((s: any) => s.type === 'Defense' && s.caseId === caseId);
        if (type === 'Citation') return cits.filter((c: any) => c.caseId === caseId);
        return [...args, ...defs, ...cits].filter((s: any) => s.caseId === caseId);
      },
      add: async (item: any) => {
        const newItem = { ...item, id: item.id || crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        await db.put(item.type === 'Citation' ? STORES.CITATIONS : STORES.CASE_STRATEGIES, newItem);
        return newItem;
      },
      update: async (id: string, updates: any) => {
        const store = updates.type === 'Citation' ? STORES.CITATIONS : STORES.CASE_STRATEGIES;
        const item = await db.get<any>(store, id);
        if (!item) throw new Error('Strategy item not found');
        const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
        await db.put(store, updated);
        return updated;
      },
      delete: async (id: string, type: 'Argument' | 'Defense' | 'Citation') => {
        const store = type === 'Citation' ? STORES.CITATIONS : STORES.CASE_STRATEGIES;
        await db.delete(store, id);
        return { success: true, id };
      }
    }), 
    enumerable: true 
  },

  // Billing Transactions
  transactions: { 
    get: () => ({
      getAll: async (accountType?: 'Operating' | 'Trust') => {
        const txs = await db.getAll<any>('transactions');
        return accountType ? txs.filter((t: any) => t.account === accountType) : txs;
      },
      add: async (transaction: any) => {
        const newTx = { ...transaction, id: transaction.id || crypto.randomUUID(), createdAt: new Date().toISOString() };
        await db.put('transactions', newTx);
        return newTx;
      }
    }), 
    enumerable: true 
  },

  tasks: { get: () => isBackendApiEnabled() ? legacyApi.tasks : getTasksRepository(), enumerable: true },
  
  projects: { get: () => isBackendApiEnabled() ? legacyApi.projects : getProjectsRepository(), enumerable: true },
  risks: { get: () => isBackendApiEnabled() ? legacyApi.risks : getRisksRepository(), enumerable: true },
  motions: { get: () => isBackendApiEnabled() ? legacyApi.motions : getMotionsRepository(), enumerable: true },
  expenses: { get: () => isBackendApiEnabled() ? api.expenses : repositoryRegistry.getOrCreate<FirmExpense>(STORES.EXPENSES), enumerable: true },
  timeEntries: { get: () => isBackendApiEnabled() ? api.timeEntries : repositoryRegistry.getOrCreate<TimeEntry>(STORES.BILLING), enumerable: true },
  invoices: { get: () => isBackendApiEnabled() ? api.invoices : repositoryRegistry.getOrCreate<any>('invoices'), enumerable: true },
  communications: { get: () => isBackendApiEnabled() ? legacyApi.communications : repositoryRegistry.getOrCreate<any>('communications'), enumerable: true },
  exhibits: { get: () => isBackendApiEnabled() ? legacyApi.exhibits : repositoryRegistry.getOrCreate<TrialExhibit>(STORES.EXHIBITS), enumerable: true },
  users: { get: () => isBackendApiEnabled() ? api.users : repositoryRegistry.getOrCreate<User>(STORES.USERS), enumerable: true },
  rateTables: { get: () => isBackendApiEnabled() ? api.rateTables : repositoryRegistry.getOrCreate<any>('rateTables'), enumerable: true },
  feeAgreements: { get: () => isBackendApiEnabled() ? api.feeAgreements : repositoryRegistry.getOrCreate<any>('feeAgreements'), enumerable: true },
  custodians: { get: () => isBackendApiEnabled() ? api.custodians : repositoryRegistry.getOrCreate<any>('custodians'), enumerable: true },
  examinations: { get: () => isBackendApiEnabled() ? api.examinations : repositoryRegistry.getOrCreate<any>('examinations'), enumerable: true },
  clients: { get: () => isBackendApiEnabled() ? legacyApi.clients : getClientsRepository(), enumerable: true },
  citations: { get: () => isBackendApiEnabled() ? legacyApi.citations : getCitationsRepository(), enumerable: true },
  entities: { get: () => getEntitiesRepository(), enumerable: true },
  playbooks: { get: () => repositoryRegistry.getOrCreate<WorkflowTemplateData>(STORES.TEMPLATES), enumerable: true },
  clauses: { get: () => isBackendApiEnabled() ? legacyApi.clauses : repositoryRegistry.getOrCreate<Clause>(STORES.CLAUSES), enumerable: true },
  rules: { get: () => repositoryRegistry.getOrCreate<LegalRule>(STORES.RULES), enumerable: true },

  phases: { get: () => getPhaseRepository(), enumerable: true },
  
  organization: { 
    get: () => ({
      getOrgs: async () => db.getAll<Organization>(STORES.ORGS),
      getGroups: async () => db.getAll<Group>(STORES.GROUPS)
    }), 
    enumerable: true 
  },

  messenger: { get: () => isBackendApiEnabled() ? legacyApi.messenger : {
    getConversations: async () => db.getAll<Conversation>(STORES.CONVERSATIONS),
    getConversationById: async (id: string): Promise<Conversation | undefined> => db.get<Conversation>(STORES.CONVERSATIONS, id),
    getContacts: async () => { 
        const users = await db.getAll<User>(STORES.USERS);
        return users.map(u => ({ id: u.id, name: u.name, role: u.role, status: 'online', email: u.email, department: 'Legal' })); 
    },
    sendMessage: async (convId: string, message: Message) => {
        const conv = await db.get<Conversation>(STORES.CONVERSATIONS, convId);
        if (conv) {
            conv.messages.push(message);
            await db.put(STORES.CONVERSATIONS, conv);
        }
    },
    countUnread: async (caseId: string): Promise<number> => {
        const convs = await db.getAll<Conversation>(STORES.CONVERSATIONS);
        const targetConv = convs.find(c => c.id === `conv-case-${caseId}`);
        return targetConv?.unread || 0;
    },
  }, enumerable: true },
  calendar: { get: () => isBackendApiEnabled() ? legacyApi.calendar : {
    getEvents: async (): Promise<CalendarEventItem[]> => {
        const tasks = await db.getAll<WorkflowTask>(STORES.TASKS);
        return tasks.filter(t => t.dueDate).map(t => ({
            id: t.id,
            title: t.title,
            date: t.dueDate,
            type: 'task',
            priority: t.priority
        }));
    },
    getTeamAvailability: async (): Promise<any[]> => { await delay(50); return [ { name: 'James Doe', role: 'Associate', schedule: [1,1,0,1,1,0,0] } ]; },
    getSOL: async (): Promise<any[]> => { await delay(50); return []; },
    getActiveRuleSets: async (): Promise<string[]> => { await delay(50); return ["FRCP", "FRE", "CA Local Rules"] },
    sync: async (): Promise<void> => { await delay(500); console.log('Calendar synced'); }
  }, enumerable: true },
  notifications: { 
    get: () => ({
      getAll: async (): Promise<SystemNotification[]> => db.getAll<SystemNotification>(STORES.NOTIFICATIONS),
      markRead: async (id: string) => {
          const notif = await db.get<SystemNotification>(STORES.NOTIFICATIONS, id);
          if (notif) {
              await db.put(STORES.NOTIFICATIONS, { ...notif, read: true });
          }
      }
    }), 
    enumerable: true 
  },
  
  collaboration: { 
    get: () => ({
      getConferrals: async (caseId: string) => {
          const all = await db.getAll<any>(STORES.CONFERRALS);
          return all.filter((c: any) => c.caseId === caseId);
      },
      addConferral: async (session: any) => db.put(STORES.CONFERRALS, { ...session, id: session.id || crypto.randomUUID() }),
      getPlans: async (caseId: string) => {
          const all = await db.getAll<any>(STORES.JOINT_PLANS);
          return all.filter((p: any) => p.caseId === caseId);
      },
      updatePlan: async (plan: any) => db.put(STORES.JOINT_PLANS, plan),
      getStipulations: async () => db.getAll<any>(STORES.STIPULATIONS)
    }), 
    enumerable: true 
  },

  warRoom: { get: () => isBackendApiEnabled() ? legacyApi.warRoom : {
      getData: async (caseId: string): Promise<WarRoomData> => {
          const c = await db.get<Case>(STORES.CASES, caseId);
          if (!c) throw new Error('Case not found');
          const [documents, motions, docket, evidence, tasks] = await Promise.all([
               db.getByIndex<LegalDocument>(STORES.DOCUMENTS, 'caseId', caseId),
               db.getByIndex<Motion>(STORES.MOTIONS, 'caseId', caseId),
               db.getByIndex<DocketEntry>(STORES.DOCKET, 'caseId', caseId),
               db.getByIndex<EvidenceItem>(STORES.EVIDENCE, 'caseId', caseId),
               db.getByIndex<WorkflowTask>(STORES.TASKS, 'caseId', caseId)
          ]);
          return { case: c, witnesses: c.parties || [], documents, motions, docket, evidence, tasks };
      },
      getAdvisors: async (caseId?: string) => {
          const all = await db.getAll<any>(STORES.ADVISORS);
          // Ensure all advisors have required filter fields
          const enriched = all.map((a: any) => ({
            ...a,
            role: a.role || 'Consultant',
            specialty: a.specialty || 'General',
            status: a.status || 'Potential',
            rate: a.rate || 0,
            email: a.email || '',
            phone: a.phone || '',
            readiness: a.readiness || 0,
            reports: a.reports || 0
          }));
          return caseId ? enriched.filter((a: any) => a.caseId === caseId) : enriched;
      },
      getExperts: async () => {
          const all = await db.getAll<any>(STORES.ADVISORS);
          return all.filter((a: any) => a.role === 'Expert Witness');
      },
      getOpposition: async (caseId?: string) => {
          const all = await db.getAll<any>(STORES.OPPOSITION);
          // Ensure all opposition entities have required filter fields
          const enriched = all.map((o: any) => ({
            ...o,
            role: o.role || 'Lead Counsel',
            firm: o.firm || 'Unknown Firm',
            status: o.status || 'Active',
            aggression: o.aggression || 'Medium',
            winRate: o.winRate || 0,
            tendency: o.tendency || 'Unknown',
            email: o.email || '',
            phone: o.phone || '',
            notes: o.notes || ''
          }));
          return caseId ? enriched.filter((o: any) => o.caseId === caseId) : enriched;
      }
  }, enumerable: true },

  research: { 
    get: () => ({
      getHistory: async () => [],
      saveSession: async (session: any) => session,
      getSavedAuthorities: async () => []
    }), 
    enumerable: true 
  },

  dashboard: { get: () => isBackendApiEnabled() ? legacyApi.analyticsDashboard : {
      getStats: async () => {
          const [cases, motions, timeEntries, risks] = await Promise.all([ 
              db.getAll<Case>(STORES.CASES), 
              db.getAll<Motion>(STORES.MOTIONS),
              db.getAll<TimeEntry>(STORES.BILLING),
              db.getAll<Risk>(STORES.RISKS),
          ]);

          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const billableHours = timeEntries
              .filter(e => {
                  const entryDate = new Date(e.date);
                  return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
              })
              .reduce((sum, e) => sum + (e.duration / 60), 0);
              
          const highRisks = risks.filter(r => r.impact === 'High' || r.probability === 'High').length;
          
          return { 
              activeCases: cases.filter((c: any) => c.status !== 'Closed' && c.status !== 'Settled').length, 
              pendingMotions: motions.filter(m => m.status === 'Draft' || m.status === 'Filed').length, 
              billableHours: Math.round(billableHours), 
              highRisks: highRisks
          };
      },
      getChartData: async () => { 
          const cases = await db.getAll<any>(STORES.CASES);
          const stats = cases.reduce((acc: any, curr: any) => { acc[curr.status] = (acc[curr.status] || 0) + 1; return acc; }, {});
          return Object.keys(stats).map(key => ({ name: key, count: stats[key] }));
      },
      getRecentAlerts: async () => { 
          const tasks = await db.getAll<WorkflowTask>(STORES.TASKS);
          return tasks.filter(t => t.priority === 'High' && t.status !== 'Done').slice(0, 3).map(t => ({
              id: t.id, message: `High Priority Task: ${t.title}`, detail: `Due: ${t.dueDate}`, time: 'Today', caseId: t.caseId
          }));
      }
  }, enumerable: true },

  assets: { 
    get: () => ({
      getAll: async () => db.getAll<any>(STORES.ASSETS),
      add: async (asset: any) => db.put(STORES.ASSETS, asset),
      delete: async (id: string) => db.delete(STORES.ASSETS, id)
    }), 
    enumerable: true 
  },

  sources: { 
    get: () => ({
      getConnections: async () => {
          try {
            // Fetch from backend API endpoint
            const response = await fetch('/api/v1/integrations/data-sources', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
              },
            });
            
            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
              const connections = await response.json();
              return connections;
            }
          } catch (error) {
            // Silently fail - backend not available
          }
          
          // Fallback to IndexedDB
          const connections = await db.getAll<any>('dataSources');
          if (connections.length > 0) return connections;
          
          // When backend is not connected, show all sources as disconnected
          return [
              { id: '1', name: 'Primary Warehouse', type: 'Snowflake', status: 'disconnected', lastSync: null, region: 'us-west-2' },
              { id: '2', name: 'Legacy Archive', type: 'PostgreSQL', status: 'disconnected', lastSync: null, region: 'us-east-1' }
          ];
      },
      testConnection: async (config: any) => {
          // Simulate connection test with timeout
          await delay(1000);
          const isValid = config.host && config.name && config.type;
          return { 
              success: isValid, 
              message: isValid ? 'Connection test successful' : 'Invalid configuration',
              timestamp: new Date().toISOString()
          };
      },
      addConnection: async (connection: any) => {
          const newConnection = {
              ...connection,
              id: `conn-${Date.now()}`,
              status: 'active',
              lastSync: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
          };
          await db.put('dataSources', newConnection);

          // Publish integration event
          await IntegrationOrchestrator.publish(SystemEventType.DATA_SOURCE_CONNECTED, {
              connectionId: newConnection.id,
              provider: newConnection.type,
              name: newConnection.name
          });

          return newConnection;
      },
      syncConnection: async (id: string) => {
          const connection = await db.get<any>('dataSources', id);
          if (!connection) throw new Error('Connection not found');
          
          await delay(2000);
          
          connection.lastSync = new Date().toISOString();
          connection.status = 'active';
          await db.put('dataSources', connection);
          
          return { success: true, timestamp: connection.lastSync, connectionId: id };
      },
      deleteConnection: async (id: string) => {
          await db.delete('dataSources', id);
          return { success: true, deletedId: id, timestamp: new Date().toISOString() };
      }
    }), 
    enumerable: true 
  },

  // ========================================
  // MISSING API SERVICES
  // ========================================

  discoveryMain: {
    get: () => isBackendApiEnabled() ? missingApiServices.discovery : repositoryRegistry.getOrCreate('discovery'), // TODO: Migrate to api.discovery
    enumerable: true
  },

  search: {
    get: () => isBackendApiEnabled() ? api.search : {
      fullText: async (query: string) => {
        // Fallback: search across multiple stores
        const results: any[] = [];
        const stores = ['cases', 'documents', 'pleadings', 'docket'];
        for (const store of stores) {
          const items = await db.getAll<any>(store);
          const matches = items.filter((item: any) => 
            JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
          );
          results.push(...matches.map(item => ({ ...item, _store: store })));
        }
        return results;
      },
      advanced: async (params: any) => {
        const items = await db.getAll<any>(params.entity || 'cases');
        return items.filter((item: any) => {
          for (const [key, value] of Object.entries(params.filters || {})) {
            if (item[key] !== value) return false;
          }
          return true;
        });
      }
    },
    enumerable: true
  },

  ocr: {
    get: () => isBackendApiEnabled() ? missingApiServices.ocr : { // TODO: Migrate to api.ocr
      processDocument: async (documentId: string) => ({
        success: false,
        message: 'OCR processing requires backend',
        jobId: null
      }),
      getStatus: async (jobId: string) => ({
        status: 'unavailable',
        progress: 0
      })
    },
    enumerable: true
  },

  serviceJobs: {
    get: () => isBackendApiEnabled() ? missingApiServices.serviceJobs : repositoryRegistry.getOrCreate('serviceJobs'), // TODO: Migrate to api.serviceJobs
    enumerable: true
  },

  messaging: {
    get: () => isBackendApiEnabled() ? missingApiServices.messaging : repositoryRegistry.getOrCreate('messages'), // TODO: Migrate to api.messaging
    enumerable: true
  },

  complianceMain: {
    get: () => isBackendApiEnabled() ? missingApiServices.compliance : repositoryRegistry.getOrCreate('complianceReports'), // TODO: Migrate to api.compliance
    enumerable: true
  },

  tokenBlacklist: {
    get: () => isBackendApiEnabled() ? missingApiServices.tokenBlacklist : { // TODO: Migrate to api.tokenBlacklist
      getAll: async () => [],
      add: async () => ({ success: false, message: 'Requires backend' }),
      remove: async () => ({ success: false })
    },
    enumerable: true
  },

  judgeStats: {
    get: () => isBackendApiEnabled() ? missingApiServices.judgeStats : { // TODO: Migrate to api.judgeStats
      getAll: async () => MOCK_JUDGES,
      getById: async (id: string) => MOCK_JUDGES.find(j => j.id === id),
      search: async (query: string) => MOCK_JUDGES.filter(j => 
        j.name.toLowerCase().includes(query.toLowerCase())
      )
    },
    enumerable: true
  },

  outcomePredictions: {
    get: () => isBackendApiEnabled() ? missingApiServices.outcomePredictions : { // TODO: Migrate to api.outcomePredictions
      predict: async (caseId: string) => ({
        caseId,
        prediction: 'unavailable',
        confidence: 0,
        factors: []
      }),
      getHistory: async (caseId: string) => []
    },
    enumerable: true
  },

  documentVersions: {
    get: () => isBackendApiEnabled() ? missingApiServices.documentVersions : repositoryRegistry.getOrCreate('documentVersions'), // TODO: Migrate to api.documentVersions
    enumerable: true
  },

  dataSourcesIntegration: {
    get: () => isBackendApiEnabled() ? missingApiServices.dataSources : repositoryRegistry.getOrCreate('dataSources'), // TODO: Migrate to api.dataSources
    enumerable: true
  },

  metrics: {
    get: () => isBackendApiEnabled() ? missingApiServices.metrics : { // TODO: Migrate to api.metrics
      getSystem: async () => ({
        cpu: 0,
        memory: 0,
        disk: 0,
        network: 0
      }),
      getApplication: async () => ({
        requests: 0,
        errors: 0,
        responseTime: 0
      })
    },
    enumerable: true
  },

  production: {
    get: () => isBackendApiEnabled() ? missingApiServices.production : { // TODO: Migrate to api.production
      getStatus: async () => ({
        environment: 'development',
        version: '1.0.0',
        healthy: true
      }),
      deploy: async () => ({
        success: false,
        message: 'Deployment requires backend'
      })
    },
    enumerable: true
  },
});

// Export DataService
export const DataService = DataServiceBase;

// ========================================
// MEMORY MANAGEMENT UTILITIES
// ========================================

/**
 * Clear all repository caches and listeners.
 * Call this on app unmount or when switching users.
 */
export function cleanupDataService(): void {
  repositoryRegistry.clear();
  repositorySingletons.clear();
  console.log('[DataService] All repositories and listeners cleared');
}

/**
 * Get memory usage statistics for debugging.
 * @returns Object with repository and listener counts
 */
export function getDataServiceMemoryStats() {
  const registryStats = repositoryRegistry.getMemoryStats();
  const singletonCount = repositorySingletons.size;
  
  return {
    ...registryStats,
    singletonCount,
    singletonKeys: Array.from(repositorySingletons.keys()),
  };
}

/**
 * Log memory usage to console (useful for debugging).
 */
export function logDataServiceMemory(): void {
  const stats = getDataServiceMemoryStats();
  console.group('[DataService] Memory Usage');
  console.log(`Total Repositories: ${stats.repositoryCount + stats.singletonCount}`);
  console.log(`Registry Repositories: ${stats.repositoryCount}`);
  console.log(`Singleton Repositories: ${stats.singletonCount}`);
  console.log(`Total Listeners: ${stats.totalListeners}`);
  if (stats.repositories.length > 0) {
    console.table(stats.repositories);
  }
  console.groupEnd();
}
