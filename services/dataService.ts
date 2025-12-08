
import { Repository } from './core/Repository';
import { STORES, db } from './db';
import { CaseRepository, PhaseService } from './domains/CaseDomain';
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
import { SystemEventType } from '../types/integrationTypes';

// Modular Repositories
import { DocumentRepository } from './repositories/DocumentRepository';
import { HRRepository } from './repositories/HRRepository';
import { EvidenceRepository } from './repositories/EvidenceRepository';
import { WorkflowRepository } from './repositories/WorkflowRepository';
import { BillingRepository } from './repositories/BillingRepository';
import { DiscoveryRepository } from './repositories/DiscoveryRepository';
import { TrialRepository } from './repositories/TrialRepository';
import { PleadingRepository } from './repositories/PleadingRepository';
import { CRMService } from './domains/CRMDomain';
import { AnalyticsService } from './domains/AnalyticsDomain';
import { OperationsService } from './domains/OperationsDomain';
import { SecurityService } from './domains/SecurityDomain';

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
import { STATE_JURISDICTIONS } from '../data/jurisdictionData';

// --- WRAPPERS FOR INTEGRATION ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class IntegratedCaseRepository extends CaseRepository {
    async add(item: Case): Promise<Case> {
        const result = await super.add(item);
        // Trigger Integration
        IntegrationOrchestrator.publish(SystemEventType.CASE_CREATED, { caseData: result });
        return result;
    }
}

class IntegratedDocketRepository extends DocketRepository {
    async add(item: DocketEntry): Promise<DocketEntry> {
        const result = await super.add(item);
        // Trigger Integration
        IntegrationOrchestrator.publish(SystemEventType.DOCKET_INGESTED, { entry: result, caseId: result.caseId });
        return result;
    }
}

class IntegratedDocumentRepository extends DocumentRepository {
    async add(item: LegalDocument): Promise<LegalDocument> {
        const result = await super.add(item);
        // Trigger Integration
        IntegrationOrchestrator.publish(SystemEventType.DOCUMENT_UPLOADED, { document: result });
        return result;
    }
}

class IntegratedBillingRepository extends BillingRepository {
    async addTimeEntry(entry: TimeEntry): Promise<TimeEntry> {
        const result = await super.addTimeEntry(entry);
        // Trigger Integration
        IntegrationOrchestrator.publish(SystemEventType.TIME_LOGGED, { entry: result });
        return result;
    }
}

// --- FACADE ---

export const DataService = {
  cases: new IntegratedCaseRepository(),
  docket: new IntegratedDocketRepository(),
  evidence: new EvidenceRepository(),
  documents: new IntegratedDocumentRepository(),
  pleadings: new PleadingRepository(),
  hr: HRRepository,
  workflow: WorkflowRepository,
  billing: new IntegratedBillingRepository(),
  discovery: new DiscoveryRepository(),
  trial: new TrialRepository(),
  compliance: ComplianceService,
  admin: AdminService,
  correspondence: CorrespondenceService, 
  quality: new DataQualityService(),
  catalog: DataCatalogService,
  backup: BackupService,
  profile: ProfileDomain,
  crm: CRMService,
  analytics: AnalyticsService,
  operations: OperationsService,
  security: SecurityService,
  marketing: MarketingService,

  // Standard Repositories for Simple Entities
  tasks: new class extends Repository<WorkflowTask> { 
      constructor() { super(STORES.TASKS); }
      async getByCaseId(caseId: string) { return this.getByIndex('caseId', caseId); }
      async countByCaseId(caseId: string): Promise<number> {
        const tasks = await this.getByCaseId(caseId);
        return tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed').length;
      }
      async add(item: WorkflowTask): Promise<WorkflowTask> {
          const result = await super.add(item);
          return result;
      }
      
      async update(id: string, updates: Partial<WorkflowTask>): Promise<WorkflowTask> {
          const result = await super.update(id, updates);
          if (updates.status === 'Done' || updates.status === 'Completed') {
               IntegrationOrchestrator.publish(SystemEventType.TASK_COMPLETED, { task: result });
          }
          return result;
      }
  }(),
  
  projects: new class extends Repository<Project> { 
      constructor() { super(STORES.PROJECTS); } 
      async getByCaseId(caseId: string) { return this.getByIndex('caseId', caseId); }
  }(),
  risks: new class extends Repository<Risk> { 
      constructor() { super(STORES.RISKS); } 
      async getByCaseId(caseId: string) { return this.getByIndex('caseId', caseId); }
      
      async add(item: Risk): Promise<Risk> {
          const result = await super.add(item);
          if (result.impact === 'High' && result.probability === 'High') {
               IntegrationOrchestrator.publish(SystemEventType.RISK_ESCALATED, { risk: result });
          }
          return result;
      }
  }(),
  motions: new class extends Repository<Motion> { 
      constructor() { super(STORES.MOTIONS); }
      async getByCaseId(caseId: string) { return this.getByIndex('caseId', caseId); }
  }(),
  expenses: new class extends Repository<FirmExpense> { constructor() { super(STORES.EXPENSES); } }(),
  exhibits: new class extends Repository<TrialExhibit> { constructor() { super(STORES.EXHIBITS); } }(),
  users: new class extends Repository<User> { constructor() { super(STORES.USERS); } }(),
  clients: new class extends Repository<Client> { 
      constructor() { super(STORES.CLIENTS); }
      async generatePortalToken(clientId: string) { return `token-${clientId}-${Date.now()}`; }
  }(),
  citations: new class extends Repository<Citation> { 
      constructor() { super(STORES.CITATIONS); }
      async verifyAll() { return { checked: 150, flagged: 3 }; }
      async quickAdd(citation: any) { return this.add(citation); }
  }(),
  analysis: new class extends Repository<BriefAnalysisSession> { 
      constructor() { super(STORES.ANALYSIS); }
      async getJudgeProfiles(): Promise<JudgeProfile[]> {
          await delay(100);
          return db.getAll<JudgeProfile>(STORES.JUDGES);
      }
  }(),
  entities: new class extends Repository<LegalEntity> { 
      constructor() { super(STORES.ENTITIES); }
      async getRelationships(id: string) { return []; } 
      
      async add(item: LegalEntity): Promise<LegalEntity> {
          const result = await super.add(item);
          IntegrationOrchestrator.publish(SystemEventType.ENTITY_CREATED, { entity: result });
          return result;
      }
  }(),
  playbooks: new class extends Repository<WorkflowTemplateData> { constructor() { super(STORES.TEMPLATES); } }(),
  clauses: new class extends Repository<Clause> { constructor() { super(STORES.CLAUSES); } }(),
  rules: new class extends Repository<LegalRule> { 
      constructor() { super(STORES.RULES); } 
  }(),

  // Simple Services
  phases: PhaseService,
  
  organization: {
    getOrgs: async () => db.getAll<Organization>(STORES.ORGS),
    getGroups: async () => db.getAll<Group>(STORES.GROUPS)
  },

  messenger: {
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
            if (message.senderId === 'me') {
            }
        }
    },
    countUnread: async (caseId: string): Promise<number> => {
        const convs = await db.getAll<Conversation>(STORES.CONVERSATIONS);
        const targetConv = convs.find(c => c.id === `conv-case-${caseId}`);
        return targetConv?.unread || 0;
    },
  },
  calendar: {
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
  },
  jurisdiction: {
    getStateCourts: async (): Promise<any[]> => {
        await delay(100);
        return Object.values(STATE_JURISDICTIONS).flatMap(s => s.levels.map(l => ({ state: s.name, court: l.courts[0], level: l.name, eFiling: 'Optional', system: 'CourtPortal' })));
    },
    getRegulatoryBodies: async (): Promise<any[]> => { await delay(100); return []; },
    getTreaties: async (): Promise<any[]> => { await delay(100); return []; },
    getArbitrationProviders: async (): Promise<any[]> => { await delay(100); return []; },
    getMapNodes: async (): Promise<any[]> => { await delay(100); return []; },
  },
  notifications: {
      getAll: async (): Promise<SystemNotification[]> => db.getAll<SystemNotification>(STORES.NOTIFICATIONS),
      markRead: async (id: string) => {
          const notif = await db.get<SystemNotification>(STORES.NOTIFICATIONS, id);
          if (notif) {
              await db.put(STORES.NOTIFICATIONS, { ...notif, read: true });
          }
      }
  },
  knowledge: {
      getPrecedents: async (): Promise<Precedent[]> => db.getAll<Precedent>(STORES.PRECEDENTS),
      getQA: async (): Promise<QAItem[]> => db.getAll<QAItem>(STORES.QA),
      getAnalytics: async (): Promise<any> => {
          await delay(100);
          return { usage: [], topics: [] };
      }
  },
  collaboration: {
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
  },

  warRoom: {
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
          return caseId ? all.filter((a: any) => a.caseId === caseId) : all;
      },
      getExperts: async () => {
          const all = await db.getAll<any>(STORES.ADVISORS);
          return all.filter((a: any) => a.role === 'Expert Witness');
      },
      getOpposition: async (caseId?: string) => {
          const all = await db.getAll<any>(STORES.OPPOSITION);
          return caseId ? all.filter((o: any) => o.caseId === caseId) : all;
      }
  },

  research: {
      getHistory: async () => [],
      saveSession: async (session: any) => session,
      getSavedAuthorities: async () => []
  },

  dashboard: {
      getStats: async () => {
          const [cases, motions] = await Promise.all([ db.getAll<any>(STORES.CASES), db.getAll<Motion>(STORES.MOTIONS) ]);
          return { 
              activeCases: cases.filter((c: any) => c.status !== 'Closed').length, 
              pendingMotions: motions.filter(m => m.status === 'Draft' || m.status === 'Filed').length, 
              billableHours: 1240, highRisks: 3 
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
  },

  assets: {
      getAll: async () => db.getAll<any>('assets'),
      add: async (asset: any) => db.put('assets', asset),
      delete: async (id: string) => db.delete('assets', id)
  },
};
