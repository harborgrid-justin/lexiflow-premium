import { STORES, DatabaseManager } from './db';
import { MOCK_CASES } from '../data/models/case';
import { MOCK_TASKS } from '../data/models/workflowTask';
import { MOCK_EVIDENCE } from '../data/models/evidenceItem';
import { MOCK_DOCUMENTS } from '../data/models/document';
import { MOCK_DOCKET_ENTRIES } from '../data/models/docketEntry';
import { MOCK_MOTIONS } from '../data/models/motion';
import { MOCK_CLIENTS } from '../data/models/client';
import { MOCK_STAFF } from '../data/models/staffMember';
import { MOCK_EXPENSES } from '../data/models/firmExpense';
import { MOCK_ORGS } from '../data/models/organization';
import { MOCK_GROUPS } from '../data/models/group';
import { MOCK_LEGAL_HOLDS } from '../data/models/legalHold';
import { MOCK_PRIVILEGE_LOG } from '../data/models/privilegeLogEntry';
import { BUSINESS_PROCESSES } from '../data/models/firmProcess';
import { MOCK_CLAUSES } from '../data/models/clause';
import { TEMPLATE_LIBRARY } from '../data/models/workflowTemplates';
import { MOCK_JUDGES } from '../data/models/judgeProfile';
import { MOCK_COUNSEL } from '../data/models/opposingCounselProfile';
import { MOCK_USERS } from '../data/models/user';
import { MOCK_CONFERRALS } from '../data/models/conferralSession';
import { MOCK_JOINT_PLANS } from '../data/models/jointPlan';
import { MOCK_STIPULATIONS } from '../data/models/stipulationRequest';
import { MOCK_DEPOSITIONS, MOCK_ESI_SOURCES, MOCK_PRODUCTIONS, MOCK_INTERVIEWS } from '../data/models/discoveryExtended';
import { MOCK_DISCOVERY } from '../data/models/discoveryRequest';
import { MOCK_CONFLICTS } from '../data/models/conflictCheck';
import { MOCK_WALLS } from '../data/models/ethicalWall';
import { MOCK_RULES } from '../data/models/legalRule';
import { LegalEntity, EntityId } from '../types';
import { MOCK_JUDGE_STATS, MOCK_OUTCOME_DATA } from '../data/models/analyticsStats';
import { MOCK_OKRS } from '../data/models/strategy';
import { MALWARE_SIGNATURES } from '../data/models/security';
import { PLEADING_TEMPLATES } from '../data/models/pleadingTemplate';
import { MOCK_CONVERSATIONS } from '../data/models/conversation';
import { MOCK_WIKI_ARTICLES, MOCK_PRECEDENTS, MOCK_QA_ITEMS } from '../data/mockKnowledge';

// New mock data imports
import { MOCK_CLE_TRACKING } from '../data/models/cle';
import { MOCK_VENDOR_CONTRACTS } from '../data/models/vendorContract';
import { MOCK_RFPS } from '../data/models/rfp';
import { MOCK_MAINTENANCE_TICKETS } from '../data/models/maintenanceTicket';
import { MOCK_FACILITIES } from '../data/models/facility';
import { MOCK_VENDOR_DIRECTORY } from '../data/models/vendorDirectory';
import { MOCK_REPORTERS } from '../data/models/reporters';
import { MOCK_JURISDICTIONS } from '../data/models/jurisdiction';
import { MOCK_INVOICES } from '../data/models/invoice';
import { MOCK_LEADS, MOCK_CRM_ANALYTICS } from '../data/models/crm';
import { MOCK_REALIZATION_DATA, MOCK_OPERATING_SUMMARY } from '../data/models/billingStats';
import { MOCK_DISCOVERY_FUNNEL, MOCK_DISCOVERY_CUSTODIANS } from '../data/models/discoveryCharts';
import { MOCK_EXHIBITS } from '../data/models/exhibit';
import { MOCK_ADVISORS } from '../data/models/advisor';
import { MOCK_OPPOSITION } from '../data/models/opposition';

export const Seeder = {
  async seed(db: DatabaseManager) {
      console.log("Seeding Initial Data...");
      
      const batchPut = async (store: string, data: any[]) => {
          for (const item of data) {
              await db.put(store, item);
          }
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
          batchPut(STORES.USERS, MOCK_USERS),
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
      ]);
      console.log("Seeding Complete.");
  }
};