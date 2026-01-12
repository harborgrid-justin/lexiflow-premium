'use server';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║             LEXIFLOW DATA MUTATION SERVER ACTIONS                         ║
 * ║          Secure Server-Side CRUD Operations for All Entities             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * All data mutations must be server-side to ensure proper authorization,
 * validation, and audit logging.
 *
 * @module app/actions/data/mutations
 * @security Critical - Data integrity and authorization
 * @author LexiFlow Engineering Team
 * @since 2026-01-12 (Architecture Refactoring)
 */

import { cookies } from 'next/headers';
import { api } from '@/services/api';
import type { Case, Document, Party, TimeEntry, Invoice } from '@/types';

/**
 * Verify authentication
 */
async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return token;
}

/**
 * Create new case
 */
export async function createCase(
  data: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Case> {
  await requireAuth();
  
  try {
    const newCase = await api.cases.create(data);
    return newCase;
  } catch (error) {
    console.error('[Data] Create case error:', error);
    throw new Error('Failed to create case');
  }
}

/**
 * Update existing case
 */
export async function updateCase(
  id: string,
  updates: Partial<Case>
): Promise<Case> {
  await requireAuth();
  
  try {
    const updatedCase = await api.cases.update(id, updates);
    return updatedCase;
  } catch (error) {
    console.error('[Data] Update case error:', error);
    throw new Error('Failed to update case');
  }
}

/**
 * Delete case
 */
export async function deleteCase(id: string): Promise<void> {
  await requireAuth();
  
  try {
    await api.cases.delete(id);
  } catch (error) {
    console.error('[Data] Delete case error:', error);
    throw new Error('Failed to delete case');
  }
}

/**
 * Create new document
 */
export async function createDocument(
  data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Document> {
  await requireAuth();
  
  try {
    const newDoc = await api.documents.create(data);
    return newDoc;
  } catch (error) {
    console.error('[Data] Create document error:', error);
    throw new Error('Failed to create document');
  }
}

/**
 * Update existing document
 */
export async function updateDocument(
  id: string,
  updates: Partial<Document>
): Promise<Document> {
  await requireAuth();
  
  try {
    const updatedDoc = await api.documents.update(id, updates);
    return updatedDoc;
  } catch (error) {
    console.error('[Data] Update document error:', error);
    throw new Error('Failed to update document');
  }
}

/**
 * Delete document
 */
export async function deleteDocument(id: string): Promise<void> {
  await requireAuth();
  
  try {
    await api.documents.delete(id);
  } catch (error) {
    console.error('[Data] Delete document error:', error);
    throw new Error('Failed to delete document');
  }
}

/**
 * Create new party
 */
export async function createParty(
  data: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Party> {
  await requireAuth();
  
  try {
    const newParty = await api.parties.create(data);
    return newParty;
  } catch (error) {
    console.error('[Data] Create party error:', error);
    throw new Error('Failed to create party');
  }
}

/**
 * Update existing party
 */
export async function updateParty(
  id: string,
  updates: Partial<Party>
): Promise<Party> {
  await requireAuth();
  
  try {
    const updatedParty = await api.parties.update(id, updates);
    return updatedParty;
  } catch (error) {
    console.error('[Data] Update party error:', error);
    throw new Error('Failed to update party');
  }
}

/**
 * Delete party
 */
export async function deleteParty(id: string): Promise<void> {
  await requireAuth();
  
  try {
    await api.parties.delete(id);
  } catch (error) {
    console.error('[Data] Delete party error:', error);
    throw new Error('Failed to delete party');
  }
}

/**
 * Create time entry
 */
export async function createTimeEntry(
  data: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TimeEntry> {
  await requireAuth();
  
  try {
    const entry = await api.billing.createTimeEntry(data);
    return entry;
  } catch (error) {
    console.error('[Data] Create time entry error:', error);
    throw new Error('Failed to create time entry');
  }
}

/**
 * Update time entry
 */
export async function updateTimeEntry(
  id: string,
  updates: Partial<TimeEntry>
): Promise<TimeEntry> {
  await requireAuth();
  
  try {
    const updatedEntry = await api.billing.updateTimeEntry(id, updates);
    return updatedEntry;
  } catch (error) {
    console.error('[Data] Update time entry error:', error);
    throw new Error('Failed to update time entry');
  }
}

/**
 * Delete time entry
 */
export async function deleteTimeEntry(id: string): Promise<void> {
  await requireAuth();
  
  try {
    await api.billing.deleteTimeEntry(id);
  } catch (error) {
    console.error('[Data] Delete time entry error:', error);
    throw new Error('Failed to delete time entry');
  }
}

/**
 * Create invoice
 */
export async function createInvoice(
  data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Invoice> {
  await requireAuth();
  
  try {
    const invoice = await api.billing.createInvoice(data);
    return invoice;
  } catch (error) {
    console.error('[Data] Create invoice error:', error);
    throw new Error('Failed to create invoice');
  }
}

/**
 * Update invoice
 */
export async function updateInvoice(
  id: string,
  updates: Partial<Invoice>
): Promise<Invoice> {
  await requireAuth();
  
  try {
    const updatedInvoice = await api.billing.updateInvoice(id, updates);
    return updatedInvoice;
  } catch (error) {
    console.error('[Data] Update invoice error:', error);
    throw new Error('Failed to update invoice');
  }
}

/**
 * Delete invoice
 */
export async function deleteInvoice(id: string): Promise<void> {
  await requireAuth();
  
  try {
    await api.billing.deleteInvoice(id);
  } catch (error) {
    console.error('[Data] Delete invoice error:', error);
    throw new Error('Failed to delete invoice');
  }
}

/**
 * Update discovery request status
 */
export async function updateDiscoveryRequestStatus(
  requestId: string,
  status: string
): Promise<void> {
  await requireAuth();
  
  try {
    await api.discovery.updateRequestStatus(requestId, status);
  } catch (error) {
    console.error('[Data] Update discovery status error:', error);
    throw new Error('Failed to update discovery status');
  }
}

/**
 * Add document annotation
 */
export async function addDocumentAnnotation(
  documentId: string,
  annotation: any
): Promise<void> {
  await requireAuth();
  
  try {
    await api.documents.addAnnotation(documentId, annotation);
  } catch (error) {
    console.error('[Data] Add annotation error:', error);
    throw new Error('Failed to add annotation');
  }
}

/**
 * Delete document annotation
 */
export async function deleteDocumentAnnotation(
  documentId: string,
  annotationId: string
): Promise<void> {
  await requireAuth();
  
  try {
    await api.documents.deleteAnnotation(documentId, annotationId);
  } catch (error) {
    console.error('[Data] Delete annotation error:', error);
    throw new Error('Failed to delete annotation');
  }
}

/**
 * Batch create multiple entities
 */
export async function batchCreateCases(
  cases: Array<Omit<Case, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Case[]> {
  await requireAuth();
  
  try {
    const created = await Promise.all(
      cases.map(caseData => api.cases.create(caseData))
    );
    return created;
  } catch (error) {
    console.error('[Data] Batch create cases error:', error);
    throw new Error('Failed to batch create cases');
  }
}

/**
 * Batch update multiple entities
 */
export async function batchUpdateDocuments(
  updates: Array<{ id: string; updates: Partial<Document> }>
): Promise<Document[]> {
  await requireAuth();
  
  try {
    const updated = await Promise.all(
      updates.map(({ id, updates: data }) => api.documents.update(id, data))
    );
    return updated;
  } catch (error) {
    console.error('[Data] Batch update documents error:', error);
    throw new Error('Failed to batch update documents');
  }
}

/**
 * Batch delete multiple entities
 */
export async function batchDeleteCases(ids: string[]): Promise<void> {
  await requireAuth();
  
  try {
    await Promise.all(ids.map(id => api.cases.delete(id)));
  } catch (error) {
    console.error('[Data] Batch delete cases error:', error);
    throw new Error('Failed to batch delete cases');
  }
}
