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
import { TEMPLATE_LIBRARY } from '../data/workflowTemplates';
import { MOCK_JUDGES } from '../data/models/judgeProfile';
import { MOCK_COUNSEL } from '../data/models/opposingCounselProfile';
import { MOCK_USERS } from '../data/models/user';
import { MOCK_CONFERRALS } from '../data/models/conferralSession';
import { MOCK_JOINT_PLANS } from '../data/models/jointPlan';
import { MOCK_STIPULATIONS } from '../data/models/stipulationRequest';
import { MOCK_DEPOSITIONS, MOCK_ESI_SOURCES, MOCK_PRODUCTIONS, MOCK_INTERVIEWS } from '../data/models/discoveryExtended';
import { MOCK_DISCOVERY } from '../data/models/discoveryRequest';
import { MOCK_CONFLICTS, MOCK_WALLS } from '../data/mockCompliance';
import { MOCK_RULES } from '../data/models/legalRule';
import { LegalEntity } from '../types';

export const Seeder = {
  async seed(db: DatabaseManager) {
      console.log("Seeding Initial Data...");
      
      const batchPut = async (store: string, data: any[]) => {
          for (const item of data) {
              await db.put(store, item);
          }
      };
      
      // Centralize Entities
      const allEntities: LegalEntity[] = [];
      const seen = new Set<string>();

      const addEntity = (entity: LegalEntity) => {
          if (!seen.has(entity.id)) {
              allEntities.push(entity);
              seen.add(entity.id);
          }
      };
      
      // From Users
      MOCK_USERS.forEach(u => addEntity({ ...u, type: 'Individual', roles: [u.role as any], status: 'Active', riskScore: 10, tags: ['Internal'] }));
      // From Clients
      MOCK_CLIENTS.forEach(c => addEntity({ id: `ent-cli-${c.id}`, name: c.name, type: 'Corporation', roles: ['Client'], status: c.status as any, riskScore: 30, tags: [c.industry] }));
      // From Case Parties
      MOCK_CASES.forEach(c => c.parties?.forEach(p => addEntity({ id: `ent-pty-${p.id}`, name: p.name, type: p.type, roles: [p.role as any, 'Party'], status: 'Active', riskScore: 50, tags: [] })));
      // From Judges
      MOCK_JUDGES.forEach(j => addEntity({ id: `ent-jdg-${j.id}`, name: j.name, type: 'Individual', roles: ['Judge'], status: 'Active', riskScore: 5, tags: [j.court] }));
      // From Counsel
      MOCK_COUNSEL.forEach(c => addEntity({ id: `ent-cnsl-${c.id}`, name: c.name, type: 'Law Firm', roles: ['Opposing Counsel'], status: 'Active', riskScore: 60, tags: [] }));


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
          batchPut(STORES.ENTITIES, allEntities)
      ]);
      console.log("Seeding Complete.");
  }
};