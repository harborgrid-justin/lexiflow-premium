/**
 * Documents Annotations API
 * @module api/admin/documents/annotations
 */

import { apiClient } from '@/services/infrastructure/apiClient';
import type { Annotation } from '@/components/features/documents/components';
import { validateId, validateObject } from './validation';

/** Get annotations for a document */
export async function getAnnotations(documentId: string): Promise<Annotation[]> {
  validateId(documentId, 'getAnnotations');
  try {
    return await apiClient.get<Annotation[]>(`/documents/${documentId}/annotations`);
  } catch () {
    console.error('[DocumentsApiService.getAnnotations] Error:', error);
    throw new Error(`Failed to fetch annotations for document: ${documentId}`);
  }
}

/** Add annotation to a document */
export async function addAnnotation(documentId: string, annotation: Omit<Annotation, 'id' | 'createdAt'>): Promise<Annotation> {
  validateId(documentId, 'addAnnotation');
  validateObject(annotation, 'annotation', 'addAnnotation');

  try {
    return await apiClient.post<Annotation>(`/documents/${documentId}/annotations`, annotation);
  } catch () {
    console.error('[DocumentsApiService.addAnnotation] Error:', error);
    throw new Error(`Failed to add annotation to document: ${documentId}`);
  }
}

/** Delete annotation */
export async function deleteAnnotation(documentId: string, annotationId: string): Promise<void> {
  validateId(documentId, 'deleteAnnotation');
  validateId(annotationId, 'deleteAnnotation');

  try {
    await apiClient.delete(`/documents/${documentId}/annotations/${annotationId}`);
  } catch () {
    console.error('[DocumentsApiService.deleteAnnotation] Error:', error);
    throw new Error(`Failed to delete annotation: ${annotationId}`);
  }
}

/** Update annotation */
export async function updateAnnotation(documentId: string, annotationId: string, updates: Partial<Annotation>): Promise<Annotation> {
  validateId(documentId, 'updateAnnotation');
  validateId(annotationId, 'updateAnnotation');
  validateObject(updates, 'updates', 'updateAnnotation');

  try {
    return await apiClient.put<Annotation>(`/documents/${documentId}/annotations/${annotationId}`, updates);
  } catch () {
    console.error('[DocumentsApiService.updateAnnotation] Error:', error);
    throw new Error(`Failed to update annotation: ${annotationId}`);
  }
}
