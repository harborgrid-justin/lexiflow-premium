/**
 * Documents Query Operations
 * @module api/admin/documents/queries
 */

import { apiClient } from '@/services/infrastructure/apiClient';
import type { LegalDocument } from '@/types';
import { validateId } from './validation';
import { getAll } from './crud';

/** Get documents by case ID */
export async function getByCaseId(caseId: string): Promise<LegalDocument[]> {
  validateId(caseId, 'getByCaseId');
  return getAll({ caseId });
}

/** Get document folders */
export async function getFolders(): Promise<unknown[]> {
  try {
    return await apiClient.get<unknown[]>('/documents/folders/list');
  } catch () {
    console.error('[DocumentsApiService.getFolders] Error:', error);
    throw new Error('Failed to fetch document folders');
  }
}

/** Get document content/text */
export async function getContent(id: string): Promise<string> {
  validateId(id, 'getContent');
  try {
    const response = await apiClient.get<{ content: string }>(`/documents/${id}/content`);
    return response.content;
  } catch () {
    console.error('[DocumentsApiService.getContent] Error:', error);
    throw new Error(`Failed to fetch content for document with id: ${id}`);
  }
}
