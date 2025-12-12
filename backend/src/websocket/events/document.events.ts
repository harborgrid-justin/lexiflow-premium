/**
 * Document Event Handlers
 * Real-time event handlers for document-related operations
 */

import { Injectable, Logger } from '@nestjs/common';
import { WebSocketService } from '../websocket.service';
import type {
  DocumentUploadedEvent,
  DocumentUpdatedEvent,
  DocumentDeletedEvent,
  DocumentProcessingEvent,
  DocumentSharedEvent,
} from './event-types';

/**
 * Document Event Emitter
 * Handles broadcasting of document-related events
 */
@Injectable()
export class DocumentEventEmitter {
  private logger = new Logger('DocumentEventEmitter');

  constructor(private websocketService: WebSocketService) {}

  /**
   * Emit document uploaded event
   */
  emitDocumentUploaded(event: DocumentUploadedEvent): void {
    this.logger.log(`Emitting document uploaded: ${event.documentId}`);
    this.websocketService.broadcastDocumentUploaded(event);
  }

  /**
   * Emit document updated event
   */
  emitDocumentUpdated(event: DocumentUpdatedEvent): void {
    this.logger.log(`Emitting document updated: ${event.documentId}`);
    this.websocketService.broadcastDocumentUpdated(event);
  }

  /**
   * Emit document deleted event
   */
  emitDocumentDeleted(event: DocumentDeletedEvent): void {
    this.logger.log(`Emitting document deleted: ${event.documentId}`);
    this.websocketService.broadcastDocumentDeleted(event);
  }

  /**
   * Emit document processing status
   */
  emitDocumentProcessing(event: DocumentProcessingEvent): void {
    this.logger.log(
      `Emitting document processing: ${event.documentId} - ${event.status}`,
    );
    this.websocketService.broadcastDocumentProcessing(event);
  }

  /**
   * Emit document shared event
   */
  emitDocumentShared(event: DocumentSharedEvent): void {
    this.logger.log(
      `Emitting document shared: ${event.documentId} with ${event.sharedWith.length} users`,
    );
    this.websocketService.sendToDocument(
      event.documentId,
      'document:shared',
      event,
    );

    // Notify each user who received access
    event.sharedWith.forEach((userId) => {
      this.websocketService.sendToUser(userId, 'document:shared', event);
    });
  }

  /**
   * Emit document OCR complete event
   */
  emitDocumentOcrComplete(data: {
    documentId: string;
    text: string;
    confidence: number;
  }): void {
    this.logger.log(`Emitting document OCR complete: ${data.documentId}`);
    this.websocketService.broadcastDocumentOcrComplete({
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit document version created event
   */
  emitDocumentVersionCreated(data: {
    documentId: string;
    versionId: string;
    versionNumber: number;
    createdBy: string;
  }): void {
    this.logger.log(
      `Emitting document version created: ${data.documentId} v${data.versionNumber}`,
    );
    this.websocketService.sendToDocument(
      data.documentId,
      'document:version_created',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Emit document annotation added event
   */
  emitDocumentAnnotationAdded(data: {
    documentId: string;
    annotationId: string;
    type: string;
    content: string;
    position: any;
    createdBy: string;
  }): void {
    this.logger.log(`Emitting document annotation added: ${data.documentId}`);
    this.websocketService.sendToDocument(
      data.documentId,
      'document:annotation_added',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Emit collaborative editing change
   */
  emitCollaborativeChange(data: {
    documentId: string;
    userId: string;
    changeType: 'insert' | 'delete' | 'update';
    changes: any;
  }): void {
    this.websocketService.sendToDocument(
      data.documentId,
      'document:collab_change',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }
}
