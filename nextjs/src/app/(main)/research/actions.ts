'use server';

/**
 * Research Module Server Actions
 * Server-side operations for legal research functionality
 *
 * Next.js 16 Compliance:
 * - All actions are server-side only ('use server')
 * - Uses revalidateTag with profile parameter
 * - Proper error handling and type safety
 *
 * @module research/actions
 */

import { revalidateTag } from 'next/cache';
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import type {
  ResearchProject,
  CreateResearchProjectDto,
  UpdateResearchProjectDto,
  ResearchSessionEntity,
  SavedSearch,
  ResearchBookmark,
  ResearchNote,
  CitationCheckResult,
  ResearchExportResult,
  ResearchSearchFilters,
  ResearchSearchResponse,
} from '@/types/research';

// ==================== Cache Tags ====================

const RESEARCH_TAGS = {
  PROJECTS: 'research-projects',
  SESSIONS: 'research-sessions',
  BOOKMARKS: 'research-bookmarks',
  SAVED_SEARCHES: 'research-saved-searches',
  NOTES: 'research-notes',
  HISTORY: 'research-history',
} as const;

// ==================== Research Project Actions ====================

/**
 * Create a new research project
 */
export async function createResearchProject(
  data: CreateResearchProjectDto
): Promise<{ success: boolean; data?: ResearchProject; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create project: ${error}` };
    }

    const project = await response.json();
    revalidateTag(RESEARCH_TAGS.PROJECTS, 'default');
    return { success: true, data: project };
  } catch (error) {
    console.error('Create research project error:', error);
    return { success: false, error: 'Failed to create research project' };
  }
}

/**
 * Update an existing research project
 */
export async function updateResearchProject(
  id: string,
  data: UpdateResearchProjectDto
): Promise<{ success: boolean; data?: ResearchProject; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update project: ${error}` };
    }

    const project = await response.json();
    revalidateTag(RESEARCH_TAGS.PROJECTS, 'default');
    return { success: true, data: project };
  } catch (error) {
    console.error('Update research project error:', error);
    return { success: false, error: 'Failed to update research project' };
  }
}

/**
 * Delete a research project
 */
export async function deleteResearchProject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete project: ${error}` };
    }

    revalidateTag(RESEARCH_TAGS.PROJECTS, 'default');
    return { success: true };
  } catch (error) {
    console.error('Delete research project error:', error);
    return { success: false, error: 'Failed to delete research project' };
  }
}

/**
 * Archive a research project
 */
export async function archiveResearchProject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  return updateResearchProject(id, { status: 'archived' });
}

// ==================== Research Session Actions ====================

/**
 * Save a research session
 */
export async function saveResearchSession(
  data: Partial<ResearchSessionEntity>
): Promise<{ success: boolean; data?: ResearchSessionEntity; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to save session: ${error}` };
    }

    const session = await response.json();
    revalidateTag(RESEARCH_TAGS.SESSIONS, 'default');
    revalidateTag(RESEARCH_TAGS.HISTORY, 'default');
    return { success: true, data: session };
  } catch (error) {
    console.error('Save research session error:', error);
    return { success: false, error: 'Failed to save research session' };
  }
}

/**
 * Bookmark a research session
 */
export async function bookmarkSession(
  sessionId: string,
  isBookmarked: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/research/sessions/${sessionId}/bookmark`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBookmarked }),
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to update bookmark status' };
    }

    revalidateTag(RESEARCH_TAGS.SESSIONS, 'default');
    return { success: true };
  } catch (error) {
    console.error('Bookmark session error:', error);
    return { success: false, error: 'Failed to bookmark session' };
  }
}

/**
 * Delete a research session
 */
export async function deleteResearchSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/research/sessions/${sessionId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to delete session' };
    }

    revalidateTag(RESEARCH_TAGS.SESSIONS, 'default');
    revalidateTag(RESEARCH_TAGS.HISTORY, 'default');
    return { success: true };
  } catch (error) {
    console.error('Delete session error:', error);
    return { success: false, error: 'Failed to delete session' };
  }
}

// ==================== Search & Discovery Actions ====================

/**
 * Perform legal research search
 */
export async function performResearchSearch(
  query: string,
  filters?: ResearchSearchFilters,
  page: number = 1,
  limit: number = 20
): Promise<{ success: boolean; data?: ResearchSearchResponse; error?: string }> {
  try {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      limit: String(limit),
    });

    if (filters) {
      if (filters.itemTypes?.length) {
        params.set('types', filters.itemTypes.join(','));
      }
      if (filters.jurisdictions?.length) {
        params.set('jurisdictions', filters.jurisdictions.join(','));
      }
      if (filters.courts?.length) {
        params.set('courts', filters.courts.join(','));
      }
      if (filters.dateFrom) {
        params.set('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.set('dateTo', filters.dateTo);
      }
      if (filters.sources?.length) {
        params.set('sources', filters.sources.join(','));
      }
      if (filters.validCitationsOnly) {
        params.set('validOnly', 'true');
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/research/search?${params.toString()}`
    );

    if (!response.ok) {
      return { success: false, error: 'Search failed' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Research search error:', error);
    return { success: false, error: 'Failed to perform search' };
  }
}

/**
 * Search case law specifically
 */
export async function searchCaseLaw(
  query: string,
  jurisdiction?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{ success: boolean; data?: ResearchSearchResponse; error?: string }> {
  return performResearchSearch(query, {
    itemTypes: ['case_law'],
    jurisdictions: jurisdiction ? [jurisdiction] : undefined,
    dateFrom,
    dateTo,
  });
}

/**
 * Search statutes
 */
export async function searchStatutes(
  query: string,
  jurisdiction?: string
): Promise<{ success: boolean; data?: ResearchSearchResponse; error?: string }> {
  return performResearchSearch(query, {
    itemTypes: ['statute', 'regulation'],
    jurisdictions: jurisdiction ? [jurisdiction] : undefined,
  });
}

/**
 * Search secondary sources
 */
export async function searchSecondarySources(
  query: string
): Promise<{ success: boolean; data?: ResearchSearchResponse; error?: string }> {
  return performResearchSearch(query, {
    itemTypes: ['secondary_source', 'treatise', 'law_review', 'practice_guide'],
    includeSecondary: true,
  });
}

// ==================== Saved Search Actions ====================

/**
 * Save a search for later use
 */
export async function saveSearch(
  data: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>
): Promise<{ success: boolean; data?: SavedSearch; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/saved-searches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        executionCount: 0,
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to save search' };
    }

    const savedSearch = await response.json();
    revalidateTag(RESEARCH_TAGS.SAVED_SEARCHES, 'default');
    return { success: true, data: savedSearch };
  } catch (error) {
    console.error('Save search error:', error);
    return { success: false, error: 'Failed to save search' };
  }
}

/**
 * Update a saved search
 */
export async function updateSavedSearch(
  id: string,
  data: Partial<SavedSearch>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/research/saved-searches/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to update saved search' };
    }

    revalidateTag(RESEARCH_TAGS.SAVED_SEARCHES, 'default');
    return { success: true };
  } catch (error) {
    console.error('Update saved search error:', error);
    return { success: false, error: 'Failed to update saved search' };
  }
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/research/saved-searches/${id}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to delete saved search' };
    }

    revalidateTag(RESEARCH_TAGS.SAVED_SEARCHES, 'default');
    return { success: true };
  } catch (error) {
    console.error('Delete saved search error:', error);
    return { success: false, error: 'Failed to delete saved search' };
  }
}

/**
 * Execute a saved search
 */
export async function executeSavedSearch(
  id: string
): Promise<{ success: boolean; data?: ResearchSearchResponse; error?: string }> {
  try {
    // Get the saved search first
    const searchResponse = await fetch(
      `${API_BASE_URL}/research/saved-searches/${id}`
    );

    if (!searchResponse.ok) {
      return { success: false, error: 'Saved search not found' };
    }

    const savedSearch: SavedSearch = await searchResponse.json();

    // Execute the search
    const result = await performResearchSearch(
      savedSearch.query,
      savedSearch.filters
    );

    if (result.success) {
      // Update execution count
      await updateSavedSearch(id, {
        executionCount: savedSearch.executionCount + 1,
        lastExecuted: new Date().toISOString(),
      });
    }

    return result;
  } catch (error) {
    console.error('Execute saved search error:', error);
    return { success: false, error: 'Failed to execute saved search' };
  }
}

/**
 * Toggle alert for a saved search
 */
export async function toggleSearchAlert(
  id: string,
  enabled: boolean,
  frequency?: 'daily' | 'weekly' | 'monthly'
): Promise<{ success: boolean; error?: string }> {
  return updateSavedSearch(id, {
    alertEnabled: enabled,
    alertFrequency: enabled ? frequency : undefined,
  });
}

// ==================== Bookmark Actions ====================

/**
 * Create a bookmark
 */
export async function createBookmark(
  data: Omit<ResearchBookmark, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; data?: ResearchBookmark; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to create bookmark' };
    }

    const bookmark = await response.json();
    revalidateTag(RESEARCH_TAGS.BOOKMARKS, 'default');
    revalidateTag(RESEARCH_TAGS.HISTORY, 'default');
    return { success: true, data: bookmark };
  } catch (error) {
    console.error('Create bookmark error:', error);
    return { success: false, error: 'Failed to create bookmark' };
  }
}

/**
 * Update a bookmark
 */
export async function updateBookmark(
  id: string,
  data: Partial<ResearchBookmark>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/bookmarks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to update bookmark' };
    }

    revalidateTag(RESEARCH_TAGS.BOOKMARKS, 'default');
    return { success: true };
  } catch (error) {
    console.error('Update bookmark error:', error);
    return { success: false, error: 'Failed to update bookmark' };
  }
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/bookmarks/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to delete bookmark' };
    }

    revalidateTag(RESEARCH_TAGS.BOOKMARKS, 'default');
    revalidateTag(RESEARCH_TAGS.HISTORY, 'default');
    return { success: true };
  } catch (error) {
    console.error('Delete bookmark error:', error);
    return { success: false, error: 'Failed to delete bookmark' };
  }
}

/**
 * Add a highlight to a bookmark
 */
export async function addBookmarkHighlight(
  bookmarkId: string,
  highlight: { text: string; annotation?: string; color?: string; position?: { start: number; end: number; page?: number } }
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/research/bookmarks/${bookmarkId}/highlights`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...highlight,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to add highlight' };
    }

    revalidateTag(RESEARCH_TAGS.BOOKMARKS, 'default');
    return { success: true };
  } catch (error) {
    console.error('Add highlight error:', error);
    return { success: false, error: 'Failed to add highlight' };
  }
}

// ==================== Citation Checking Actions ====================

/**
 * Check citation validity (Shepardize)
 */
export async function checkCitation(
  citation: string,
  options?: {
    depth?: 'basic' | 'standard' | 'comprehensive';
    includeNegativeTreatment?: boolean;
    includeCitingReferences?: boolean;
  }
): Promise<{ success: boolean; data?: CitationCheckResult; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/citations/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        citation,
        ...options,
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Citation check failed' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Check citation error:', error);
    return { success: false, error: 'Failed to check citation' };
  }
}

/**
 * Check multiple citations
 */
export async function checkMultipleCitations(
  citations: string[]
): Promise<{ success: boolean; data?: CitationCheckResult[]; error?: string }> {
  try {
    const results = await Promise.all(
      citations.map((citation) => checkCitation(citation))
    );

    const validResults = results
      .filter((r) => r.success && r.data)
      .map((r) => r.data as CitationCheckResult);

    return { success: true, data: validResults };
  } catch (error) {
    console.error('Check multiple citations error:', error);
    return { success: false, error: 'Failed to check citations' };
  }
}

// ==================== Research Notes Actions ====================

/**
 * Create a research note
 */
export async function createResearchNote(
  data: Omit<ResearchNote, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; data?: ResearchNote; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to create note' };
    }

    const note = await response.json();
    revalidateTag(RESEARCH_TAGS.NOTES, 'default');
    return { success: true, data: note };
  } catch (error) {
    console.error('Create note error:', error);
    return { success: false, error: 'Failed to create note' };
  }
}

/**
 * Update a research note
 */
export async function updateResearchNote(
  id: string,
  data: Partial<ResearchNote>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to update note' };
    }

    revalidateTag(RESEARCH_TAGS.NOTES, 'default');
    return { success: true };
  } catch (error) {
    console.error('Update note error:', error);
    return { success: false, error: 'Failed to update note' };
  }
}

/**
 * Delete a research note
 */
export async function deleteResearchNote(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/notes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to delete note' };
    }

    revalidateTag(RESEARCH_TAGS.NOTES, 'default');
    return { success: true };
  } catch (error) {
    console.error('Delete note error:', error);
    return { success: false, error: 'Failed to delete note' };
  }
}

// ==================== Export Actions ====================

/**
 * Export research to document
 */
export async function exportResearch(
  itemIds: string[],
  format: 'pdf' | 'docx' | 'rtf' | 'txt' | 'csv',
  options?: {
    includeAnnotations?: boolean;
    includeCitations?: boolean;
    includeTableOfAuthorities?: boolean;
    templateId?: string;
  }
): Promise<{ success: boolean; data?: ResearchExportResult; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemIds,
        format,
        destination: 'download',
        ...options,
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Export failed' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Export research error:', error);
    return { success: false, error: 'Failed to export research' };
  }
}

/**
 * Export research to document management system
 */
export async function exportToDocuments(
  itemIds: string[],
  targetDocumentId: string,
  format: 'pdf' | 'docx' = 'docx'
): Promise<{ success: boolean; data?: ResearchExportResult; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemIds,
        format,
        destination: 'documents',
        targetDocumentId,
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Export to documents failed' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Export to documents error:', error);
    return { success: false, error: 'Failed to export to documents' };
  }
}

/**
 * Generate table of authorities
 */
export async function generateTableOfAuthorities(
  projectId: string
): Promise<{ success: boolean; data?: ResearchExportResult; error?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/research/projects/${projectId}/table-of-authorities`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to generate table of authorities' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Generate TOA error:', error);
    return { success: false, error: 'Failed to generate table of authorities' };
  }
}

// ==================== History Actions ====================

/**
 * Clear research history
 */
export async function clearResearchHistory(
  options?: {
    before?: string; // ISO date string
    sessionIds?: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/history/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {}),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to clear history' };
    }

    revalidateTag(RESEARCH_TAGS.HISTORY, 'default');
    revalidateTag(RESEARCH_TAGS.SESSIONS, 'default');
    return { success: true };
  } catch (error) {
    console.error('Clear history error:', error);
    return { success: false, error: 'Failed to clear history' };
  }
}
