import { DataService } from './dataService';
import { Case, Client, WorkflowTask, EvidenceItem, User } from '../types';

export type SearchResultType = 'case' | 'document' | 'client' | 'task' | 'evidence' | 'user';

export interface GlobalSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  data: Case | Client | WorkflowTask | EvidenceItem | User;
}

export const SearchService = {
  async search(query: string): Promise<GlobalSearchResult[]> {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();

    const results: GlobalSearchResult[] = [];

    try {
      // Use allSettled to ensure one failure doesn't brick the entire search
      const resultsSettled = await Promise.allSettled([
        DataService.cases.getAll(),
        DataService.clients.getAll(),
        DataService.tasks.getAll(),
        DataService.evidence.getAll(),
        DataService.users.getAll()
      ]);

      // 0: Cases
      if (resultsSettled[0].status === 'fulfilled') {
        for (const c of resultsSettled[0].value) {
          if (c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.client.toLowerCase().includes(q)) {
            results.push({ 
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
        for (const c of resultsSettled[1].value) {
          if (c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)) {
            results.push({ 
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
        for (const t of resultsSettled[2].value) {
          if (t.title.toLowerCase().includes(q)) {
            results.push({ 
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
        for (const e of resultsSettled[3].value) {
          if (e.title.toLowerCase().includes(q) || e.trackingUuid.toLowerCase().includes(q)) {
              results.push({
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
        for (const u of resultsSettled[4].value) {
            if (u.name.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) {
                results.push({
                    id: u.id,
                    type: 'user',
                    title: u.name,
                    subtitle: `${u.role} • ${u.office}`,
                    data: u
                });
            }
        }
      }

    } catch (error) {
      console.error("Critical Search Failure", error);
    }

    // Return top 15 results
    return results.slice(0, 15);
  }
};