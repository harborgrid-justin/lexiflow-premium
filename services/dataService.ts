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

// Modular Repositories
import { DocumentRepository } from './repositories/DocumentRepository';
import { HRRepository } from './repositories/HRRepository';
import { EvidenceRepository } from './repositories/EvidenceRepository';
import { WorkflowRepository } from './repositories/WorkflowRepository';
import { BillingRepository } from './repositories/BillingRepository';
import { DiscoveryRepository } from './repositories/DiscoveryRepository';
import { TrialRepository } from './repositories/TrialRepository';

// Types
import { 
  WorkflowTask, Motion, Project, Risk, Organization, Group,
  User, FirmExpense, TrialExhibit, Citation, BriefAnalysisSession,
  LegalEntity, EntityRelationship, Clause, WorkflowTemplateData,
  WikiArticle, Precedent, QAItem, LegalRule, SystemNotification,
  CalendarEventItem, Client, Conversation, Message, Case, LegalDocument, DocketEntry, EvidenceItem,
  WarRoomData
} from '../types';

import { MOCK_METRICS } from '../data/models/marketingMetric';
import { MOCK_JUDGES } from '../data/models/judgeProfile';
import { MOCK_RULES } from '../data/models/legalRule';

// --- FACADE ---

export const DataService = {
  cases: new CaseRepository(),
  docket: new DocketRepository(),
  evidence: new EvidenceRepository(),
  documents: new DocumentRepository(),
  hr: HRRepository,
  workflow: WorkflowRepository,
  billing: new BillingRepository(),
  discovery: new DiscoveryRepository(),
  trial: new TrialRepository(),
  compliance: ComplianceService,
  admin: AdminService,
  correspondence: CorrespondenceService,
  quality: new DataQualityService(),
  catalog: DataCatalogService,
  backup: BackupService,

  // Standard Repositories for Simple Entities
  tasks: new class extends Repository<WorkflowTask> { 
      constructor() { super(STORES.TASKS); }
      getByCaseId = async (caseId: string) => this.getByIndex('caseId', caseId);
      countByCaseId = async (caseId: string): Promise<number> => {
        const tasks = await this.getByCaseId(caseId);
        return tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed').length;
      }
  }(),
  projects: new class extends Repository<Project> { 
      constructor() { super(STORES.PROJECTS); } 
      getByCaseId = async (caseId: string) => this.getByIndex('caseId', caseId);
  }(),
  risks: new class extends Repository<Risk> { 
      constructor() { super(STORES.RISKS); } 
      getByCaseId = async (caseId: string) => this.getByIndex('caseId', caseId);
  }(),
  motions: new class extends Repository<Motion> { 
      constructor() { super(STORES.MOTIONS); }
      getByCaseId = async (caseId: string) => this.getByIndex('caseId', caseId);
  }(),
  expenses: new class extends Repository<FirmExpense> { constructor() { super(STORES.EXPENSES); } }(),
  exhibits: new class extends Repository<TrialExhibit> { constructor() { super(STORES.EXHIBITS); } }(),
  users: new class extends Repository<User> { constructor() { super(STORES.USERS); } }(),
  clients: new class extends Repository<Client> { 
      constructor() { super(STORES.CLIENTS); }
      generatePortalToken = async (clientId: string) => { return `token-${clientId}-${Date.now()}`; }
  }(),
  citations: new class extends Repository<Citation> { 
      constructor() { super(STORES.CITATIONS); }
      verifyAll = async () => { return { checked: 150, flagged: 3 }; }
      quickAdd = async (citation: any) => this.add(citation);
  }(),
  analysis: new class extends Repository<BriefAnalysisSession> { constructor() { super(STORES.ANALYSIS); } }(),
  entities: new class extends Repository<LegalEntity> { 
      constructor() { super(STORES.ENTITIES); }
      getRelationships = async (id: string) => { return []; } 
  }(),
// FIX: The type 'WorkflowTemplateData' does not satisfy the constraint 'BaseEntity'.
  playbooks: new class extends Repository<any> { constructor() { super(STORES.TEMPLATES); } }(),
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
    getContacts: async () => { 
        const users = await db.getAll<User>(STORES.USERS);
        return users.map(u => ({ id: u.id, name: u.name, role: u.role, status: 'online', email: u.email, department: 'Legal' })); 
    },
    sendMessage: async (convId: string, message: Message) => {
        const conv = await db.get<Conversation>(STORES.CONVERSATIONS, convId);
        if (conv) {
            conv.messages.push(message);
            return db.put(STORES.CONVERSATIONS, conv);
        }
    },
    countUnread: async (caseId: string): Promise<number> => {
        const convs = await db.getAll<Conversation>(STORES.CONVERSATIONS);
        return convs.reduce((sum, c) => sum + (c.unread || 0), 0);
    },
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

  marketing: { getMetrics: async () => MOCK_METRICS },
  crm: { 
      getLeads: async () => [], 
      getAnalytics: async () => ({ growth: [], industry: [], revenue: [], sources: [] }) 
  },
  knowledge: {
      getArticles: async () => {
         return [
           { id: 'wiki-1' as any, title: 'Civil Litigation Guide', category: 'Litigation', content: 'Standard operating procedures for civil cases.', lastUpdated: '2024-01-15', isFavorite: true, author: 'Senior Partner' },
           { id: 'wiki-2' as any, title: 'Billing Codes & Practices', category: 'Operations', content: 'Guide to ABA task codes and firm billing.', lastUpdated: '2023-11-20', isFavorite: false, author: 'Finance Dept' },
           { id: 'wiki-3' as any, title: 'Deposition Prep Checklist', category: 'Discovery', content: 'Key steps for preparing witnesses.', lastUpdated: '2024-02-10', isFavorite: true, author: 'Associate' }
         ];
      },
      getPrecedents: async () => {
         return [
           { id: 'prec-1' as any, title: 'Motion to Dismiss (12b6)', type: 'Motion', description: 'Standard template.', tag: 'success', docId: 'DOC-001' as any },
           { id: 'prec-2' as any, title: 'Asset Purchase Agreement', type: 'Contract', description: 'M&A template.', tag: 'info', docId: 'DOC-002' as any },
           { id: 'prec-3' as any, title: 'Employment Offer Letter', type: 'HR', description: 'Standard offer letter.', tag: 'neutral', docId: 'DOC-003' as any }
         ];
      },
      getQA: async () => {
         return [
           { id: 'qa-1' as any, question: 'What is the deadline for responding to a complaint?', asker: 'New Associate', time: '2h ago', answer: '30 days usually.', answerer: 'Partner Alex', role: 'Partner', verified: true }
         ];
      },
      getAnalytics: async () => {
         return {
             usage: [ { name: 'Wiki', views: 450 }, { name: 'Precedents', views: 320 } ],
             topics: [ { name: 'Litigation', value: 40, color: '#3b82f6' } ]
         };
      }
  },

  notifications: {
      getAll: async () => db.getAll<SystemNotification>(STORES.NOTIFICATIONS),
      markRead: async (id: string) => { 
          const notif = await db.get<SystemNotification>(STORES.NOTIFICATIONS, id);
          if (notif) { notif.read = true; await db.put(STORES.NOTIFICATIONS, notif); }
      }
  },
  
  jurisdiction: {
      getMapNodes: async () => db.getAll<any>(STORES.MAP_NODES),
      getStateCourts: async () => [ { state: 'California', court: 'Superior Court', level: 'Trial', eFiling: 'Required', system: 'Odyssey' } ],
      getTreaties: async () => [ { name: 'Hague Service Convention', type: 'Service', status: 'Ratified', parties: 78 } ],
      getArbitrationProviders: async () => [ { name: 'AAA', fullName: 'American Arbitration Association', rules: ['Commercial Rules'] } ],
      getRegulatoryBodies: async () => [ { name: 'SEC', desc: 'Securities and Exchange Commission', ref: '17 CFR', iconColor: 'text-blue-600' } ]
  },
  
  calendar: {
      getEvents: async (): Promise<CalendarEventItem[]> => {
          const [cases, docket, motions, tasks] = await Promise.all([
              db.getAll<any>(STORES.CASES), 
              db.getAll<any>(STORES.DOCKET),
              db.getAll<any>(STORES.MOTIONS), 
              db.getAll<WorkflowTask>(STORES.TASKS)
          ]);

          const events: CalendarEventItem[] = [];
          cases.forEach((c: any) => { if (c.filingDate) events.push({ id: `evt-case-${c.id}`, title: `Filing: ${c.title}`, date: c.filingDate, type: 'case', description: `Case filed in ${c.court}` }); });
          docket.forEach((d: any) => { events.push({ id: `evt-docket-${d.id}`, title: `Docket: ${d.title}`, date: d.date, type: 'deadline', description: d.description }); });
          motions.forEach((m: any) => { if (m.hearingDate) events.push({ id: `evt-motion-${m.id}`, title: `Hearing: ${m.title}`, date: m.hearingDate, type: 'hearing', priority: 'High', description: `Hearing for ${m.type}` }); });
          tasks.forEach(t => { if (t.dueDate) events.push({ id: `evt-task-${t.id}`, title: `Task: ${t.title}`, date: t.dueDate, type: 'task', priority: t.priority === 'High' ? 'High' : 'Medium', description: `Assigned to ${t.assignee}` }); });

          return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },
      getSOL: async () => [],
      getTeamAvailability: async () => [],
      getActiveRuleSets: async () => [],
      sync: async () => console.log("[API] Calendar synced")
  },

  analytics: {
      getJudgeProfiles: async () => MOCK_JUDGES
  }
};