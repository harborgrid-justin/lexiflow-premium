
import { DataService } from './dataService';
import { Case, Client, WorkflowTask, EvidenceItem, User, LegalDocument, DocketEntry, Motion, Clause, LegalRule } from '../types';
import { StringUtils } from '../utils/stringUtils';

export type SearchResultType = 'case' | 'document' | 'client' | 'task' | 'evidence' | 'user' | 'docket' | 'motion' | 'clause' | 'rule';

export interface GlobalSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  data: Case | Client | WorkflowTask | EvidenceItem | User | LegalDocument | DocketEntry | Motion | Clause | LegalRule;
  score?: number;
}

const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

export const SearchService = {
  async search(query: string): Promise<GlobalSearchResult[]> {
    const q = query ? query.toLowerCase() : '';
    const results: GlobalSearchResult[] = [];
    const CHUNK_SIZE = 50;

    // Helper for scoring
    const calculateScore = (text: string, query: string): number => {
        const t = text.toLowerCase();
        if (t === query) return 100; // Exact match
        if (t.startsWith(query)) return 80; // Prefix match
        if (t.includes(query)) return 50; // Partial match
        // Simple fuzzy fallbacks
        const dist = StringUtils.levenshtein(t.substring(0, Math.min(t.length, query.length * 2)), query);
        if (dist <= 2) return 20; 
        return 0;
    };

    try {
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

      const pushResult = async (item: GlobalSearchResult, textToScore: string) => {
          if (!q) {
              // No query, return recent/all (score 1)
              results.push({...item, score: 1});
              return;
          }

          const score = calculateScore(textToScore, q);
          if (score > 0) {
            results.push({ ...item, score });
          }
          
          processCount++;
          if (processCount % CHUNK_SIZE === 0) await yieldToMain();
      };

      // 0: Cases
      if (resultsSettled[0].status === 'fulfilled') {
        for (const c of resultsSettled[0].value) {
            await pushResult({ 
              id: c.id, type: 'case', title: c.title, 
              subtitle: `${c.id} • ${c.client}`, data: c 
            }, c.title);
        }
      }

      // 1: Clients
      if (resultsSettled[1].status === 'fulfilled') {
        for (const c of resultsSettled[1].value) {
            await pushResult({ 
              id: c.id, type: 'client', title: c.name, 
              subtitle: `Client • ${c.industry}`, data: c 
            }, c.name);
        }
      }

      // 2: Tasks
      if (resultsSettled[2].status === 'fulfilled') {
        for (const t of resultsSettled[2].value) {
            await pushResult({ 
              id: t.id, type: 'task', title: t.title, 
              subtitle: `Task • Due: ${t.dueDate}`, data: t 
            }, t.title);
        }
      }

      // 3: Evidence
      if (resultsSettled[3].status === 'fulfilled') {
        for (const e of resultsSettled[3].value) {
           await pushResult({
              id: e.id, type: 'evidence', title: e.title,
              subtitle: `Evidence • ${e.type}`, data: e
           }, e.title);
        }
      }

      // 4: Users
      if (resultsSettled[4].status === 'fulfilled') {
        for (const u of resultsSettled[4].value) {
            await pushResult({
                id: u.id, type: 'user', title: u.name,
                subtitle: `${u.role} • ${u.office}`, data: u
            }, u.name);
        }
      }

      // 5: Documents
      if (resultsSettled[5].status === 'fulfilled') {
        for (const d of resultsSettled[5].value) {
            await pushResult({
                id: d.id, type: 'document', title: d.title,
                subtitle: `Doc • ${d.type}`, data: d
            }, d.title);
        }
      }

      // 6: Docket
      if (resultsSettled[6].status === 'fulfilled') {
        for (const d of resultsSettled[6].value) {
             await pushResult({
                id: d.id, type: 'docket', title: d.title,
                subtitle: `Docket #${d.sequenceNumber}`, data: d
            }, d.title);
        }
      }

      // 7: Motions
      if (resultsSettled[7].status === 'fulfilled') {
        for (const m of resultsSettled[7].value) {
             await pushResult({
                id: m.id, type: 'motion', title: m.title,
                subtitle: `Motion • ${m.status}`, data: m
            }, m.title);
        }
      }

      // 8: Clauses
      if (resultsSettled[8].status === 'fulfilled') {
        for (const c of resultsSettled[8].value) {
            await pushResult({
                id: c.id, type: 'clause', title: c.name,
                subtitle: `Clause • ${c.category}`, data: c
            }, c.name);
        }
      }

      // 9: Rules
      if (resultsSettled[9].status === 'fulfilled') {
        for (const r of resultsSettled[9].value) {
             await pushResult({
                id: r.id, type: 'rule', title: `${r.code} - ${r.name}`,
                subtitle: `Rule • ${r.type}`, data: r
            }, r.name + ' ' + r.code);
        }
      }

    } catch (error) {
      console.error("Critical Search Failure", error);
    }

    // Sort by score descending
    return results.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 15);
  }
};
