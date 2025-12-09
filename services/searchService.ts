
import { DataService } from './dataService';
import { Case, Client, WorkflowTask, EvidenceItem, User, LegalDocument, DocketEntry, Motion, Clause, LegalRule } from '../types';

export type SearchResultType = 'case' | 'document' | 'client' | 'task' | 'evidence' | 'user' | 'docket' | 'motion' | 'clause' | 'rule';

export interface GlobalSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  data: Case | Client | WorkflowTask | EvidenceItem | User | LegalDocument | DocketEntry | Motion | Clause | LegalRule;
}

// Helper to yield control to main thread to prevent UI freezing
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

export const SearchService = {
  async search(query: string): Promise<GlobalSearchResult[]> {
    const q = query ? query.toLowerCase() : '';
    const results: GlobalSearchResult[] = [];
    const CHUNK_SIZE = 200; // Process 200 items before yielding

    try {
      // Use allSettled to ensure one failure doesn't brick the entire search
      const resultsSettled = await Promise.allSettled([
        DataService.cases.getAll(),
        DataService.clients.getAll(),
        DataService.tasks.getAll(),
        DataService.evidence.getAll(),
        DataService.users.getAll(),
        DataService.documents.getAll(),
        DataService.docket.getAll(),
        DataService.motions.getAll(),
        DataService.clauses.getAll(),
        DataService.rules.getAll()
      ]);

      let processCount = 0;

      // Helper to push result and check yield
      const pushResult = async (item: GlobalSearchResult) => {
          results.push(item);
          processCount++;
          if (processCount % CHUNK_SIZE === 0) await yieldToMain();
      };

      // 0: Cases
      if (resultsSettled[0].status === 'fulfilled') {
        const cases = resultsSettled[0].value;
        for (const c of cases) {
          if (!q || c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.client.toLowerCase().includes(q)) {
            await pushResult({ 
              id: c.id, 
              type: 'case', 
              title: c.title, 
              subtitle: `${c.id} • ${c.client}`, 
              data: c 
            });
          }
        }
      }

      // 1: Clients
      if (resultsSettled[1].status === 'fulfilled') {
        const clients = resultsSettled[1].value;
        for (const c of clients) {
          if (!q || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)) {
            await pushResult({ 
              id: c.id, 
              type: 'client', 
              title: c.name, 
              subtitle: `Client • ${c.industry}`, 
              data: c 
            });
          }
        }
      }

      // 2: Tasks
      if (resultsSettled[2].status === 'fulfilled') {
        const tasks = resultsSettled[2].value;
        for (const t of tasks) {
          if (!q || t.title.toLowerCase().includes(q)) {
            await pushResult({ 
              id: t.id, 
              type: 'task', 
              title: t.title, 
              subtitle: `Task • Due: ${t.dueDate}`, 
              data: t 
            });
          }
        }
      }

      // 3: Evidence
      if (resultsSettled[3].status === 'fulfilled') {
        const evidence = resultsSettled[3].value;
        for (const e of evidence) {
          if (!q || e.title.toLowerCase().includes(q) || e.trackingUuid.toLowerCase().includes(q)) {
              await pushResult({
                  id: e.id,
                  type: 'evidence',
                  title: e.title,
                  subtitle: `Evidence • ${e.type} • ${e.custodian}`,
                  data: e
              });
          }
        }
      }

      // 4: Users
      if (resultsSettled[4].status === 'fulfilled') {
        const users = resultsSettled[4].value;
        for (const u of users) {
            if (!q || u.name.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) {
                await pushResult({
                    id: u.id,
                    type: 'user',
                    title: u.name,
                    subtitle: `${u.role} • ${u.office}`,
                    data: u
                });
            }
        }
      }

      // 5: Documents
      if (resultsSettled[5].status === 'fulfilled') {
        const docs = resultsSettled[5].value;
        for (const d of docs) {
            if (!q || d.title.toLowerCase().includes(q) || d.type.toLowerCase().includes(q)) {
                await pushResult({
                    id: d.id,
                    type: 'document',
                    title: d.title,
                    subtitle: `Doc • ${d.type} • ${d.status || 'Draft'}`,
                    data: d
                });
            }
        }
      }

      // 6: Docket
      if (resultsSettled[6].status === 'fulfilled') {
        const entries = resultsSettled[6].value;
        for (const d of entries) {
            if (!q || d.title.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)) {
                await pushResult({
                    id: d.id,
                    type: 'docket',
                    title: d.title,
                    subtitle: `Docket #${d.sequenceNumber} • ${d.type}`,
                    data: d
                });
            }
        }
      }

      // 7: Motions
      if (resultsSettled[7].status === 'fulfilled') {
        const motions = resultsSettled[7].value;
        for (const m of motions) {
            if (!q || m.title.toLowerCase().includes(q) || m.type.toLowerCase().includes(q)) {
                await pushResult({
                    id: m.id,
                    type: 'motion',
                    title: m.title,
                    subtitle: `Motion • ${m.status} • ${m.type}`,
                    data: m
                });
            }
        }
      }

      // 8: Clauses
      if (resultsSettled[8].status === 'fulfilled') {
        const clauses = resultsSettled[8].value;
        for (const c of clauses) {
            if (!q || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
                await pushResult({
                    id: c.id,
                    type: 'clause',
                    title: c.name,
                    subtitle: `Clause • ${c.category}`,
                    data: c
                });
            }
        }
      }

      // 9: Rules
      if (resultsSettled[9].status === 'fulfilled') {
        const rules = resultsSettled[9].value;
        for (const r of rules) {
            if (!q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)) {
                await pushResult({
                    id: r.id,
                    type: 'rule',
                    title: `${r.code} - ${r.name}`,
                    subtitle: `Rule • ${r.type}`,
                    data: r
                });
            }
        }
      }

    } catch (error) {
      console.error("Critical Search Failure", error);
    }

    // Return top 20 results
    return results.slice(0, 20);
  }
};
