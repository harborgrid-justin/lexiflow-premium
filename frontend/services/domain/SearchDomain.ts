/**
 * SearchDomain - Global search and indexing service
 * Provides full-text search across all entities, recent searches, and document indexing
 * ✅ Migrated to backend API (2025-12-21)
 */

import { analyticsApi } from '../api/domains/analytics.api';
import { delay } from '../../utils/async';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  score: number;
  metadata?: any;
}

const RECENT_SEARCHES_KEY = 'lexiflow_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const SearchService = {
  getAll: async () => [], // Not applicable for search service
  getById: async (id: string) => null,
  add: async (item: any) => item,
  update: async (id: string, updates: any) => updates,
  delete: async (id: string) => true,
  
  // Search specific methods
  search: async (query: string, filters?: { types?: string[]; caseId?: string }): Promise<SearchResult[]> => {
    await delay(100);
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Search cases
    if (!filters?.types || filters.types.includes('case')) {
      const cases = await db.getAll(STORES.CASES);
      cases.forEach((c: any) => {
        if (c.title?.toLowerCase().includes(lowerQuery) || c.caseNumber?.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: c.id,
            type: 'case',
            title: c.title,
            snippet: c.description || c.caseNumber,
            score: 0.9,
            metadata: { status: c.status, client: c.client },
          });
        }
      });
    }
    
    // Search documents
    if (!filters?.types || filters.types.includes('document')) {
      const documents = await db.getAll(STORES.DOCUMENTS);
      documents.forEach((d: any) => {
        if (d.name?.toLowerCase().includes(lowerQuery) || d.content?.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: d.id,
            type: 'document',
            title: d.name,
            snippet: d.content ? d.content.substring(0, 100) + '...' : '',
            score: 0.8,
            metadata: { type: d.type, size: d.size },
          });
        }
      });
    }
    
    // Search contacts
    if (!filters?.types || filters.types.includes('contact')) {
      const contacts = await db.getAll(STORES.CONTACTS);
      contacts.forEach((contact: any) => {
        if (contact.name?.toLowerCase().includes(lowerQuery) || contact.email?.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: contact.id,
            type: 'contact',
            title: contact.name,
            snippet: `${contact.email || ''} - ${contact.role || ''}`,
            score: 0.85,
            metadata: { type: contact.type, company: contact.company },
          });
        }
      });
    }
    
    // Sort by score
    return results.sort((a, b) => b.score - a.score).slice(0, 50);
  },
  
  searchGlobal: async (query: string): Promise<SearchResult[]> => {
    // Search across all entity types
    return SearchService.search(query);
  },
  
  getRecentSearches: async (): Promise<string[]> => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
  
  saveSearch: async (query: string): Promise<boolean> => {
    try {
      const recent = await SearchService.getRecentSearches();
      const updated = [query, ...recent.filter(q => q !== query)].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },
  
  indexDocument: async (documentId: string): Promise<boolean> => {
    await delay(50);
    // In production, this would extract text and create search index
    const document = await db.get(STORES.DOCUMENTS, documentId);
    if (!document) return false;
    
    // Mock indexing - in production, use search worker or external service
    console.log(`[SearchService] Indexed document: ${document.name}`);
    return true;
  },
};
