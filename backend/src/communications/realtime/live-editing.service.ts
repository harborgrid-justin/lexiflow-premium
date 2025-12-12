import { Injectable, Logger } from '@nestjs/common';

export enum OperationType {
  INSERT = 'insert',
  DELETE = 'delete',
  REPLACE = 'replace',
  FORMAT = 'format',
}

export interface Operation {
  type: OperationType;
  position: number;
  content?: string;
  length?: number;
  attributes?: Record<string, any>;
  timestamp: Date;
  userId: string;
  version: number;
}

export interface DocumentState {
  documentId: string;
  content: string;
  version: number;
  operations: Operation[];
  participants: Set<string>;
  lastModified: Date;
  checksum?: string;
}

export interface OperationTransformResult {
  transformed: Operation;
  applied: boolean;
  conflict?: boolean;
}

@Injectable()
export class LiveEditingService {
  private readonly logger = new Logger(LiveEditingService.name);
  private documents = new Map<string, DocumentState>();
  private operationHistory = new Map<string, Operation[]>(); // documentId -> operations
  private readonly MAX_HISTORY_SIZE = 1000;

  /**
   * Initialize document for live editing
   */
  initializeDocument(
    documentId: string,
    initialContent: string = '',
  ): DocumentState {
    if (this.documents.has(documentId)) {
      return this.documents.get(documentId)!;
    }

    const state: DocumentState = {
      documentId,
      content: initialContent,
      version: 0,
      operations: [],
      participants: new Set(),
      lastModified: new Date(),
      checksum: this.calculateChecksum(initialContent),
    };

    this.documents.set(documentId, state);
    this.operationHistory.set(documentId, []);

    this.logger.log(`Initialized document ${documentId} for live editing`);

    return state;
  }

  /**
   * Apply operation to document
   */
  applyOperation(
    documentId: string,
    operation: Omit<Operation, 'version' | 'timestamp'>,
  ): OperationTransformResult {
    const state = this.documents.get(documentId);

    if (!state) {
      return {
        transformed: { ...operation, version: 0, timestamp: new Date() } as Operation,
        applied: false,
        conflict: true,
      };
    }

    // Transform operation against concurrent operations
    const transformed = this.transformOperation(state, operation);

    // Apply operation to content
    try {
      const newContent = this.applyToContent(state.content, transformed);

      // Update state
      state.content = newContent;
      state.version++;
      state.lastModified = new Date();
      state.checksum = this.calculateChecksum(newContent);

      const fullOperation: Operation = {
        ...transformed,
        version: state.version,
        timestamp: new Date(),
      };

      state.operations.push(fullOperation);

      // Add to history
      this.addToHistory(documentId, fullOperation);

      return {
        transformed: fullOperation,
        applied: true,
        conflict: false,
      };
    } catch (error) {
      this.logger.error(
        `Failed to apply operation to document ${documentId}: ${error.message}`,
      );

      return {
        transformed: { ...operation, version: state.version, timestamp: new Date() } as Operation,
        applied: false,
        conflict: true,
      };
    }
  }

  /**
   * Get document state
   */
  getDocumentState(documentId: string): DocumentState | undefined {
    return this.documents.get(documentId);
  }

  /**
   * Get operations since version
   */
  getOperationsSinceVersion(
    documentId: string,
    sinceVersion: number,
  ): Operation[] {
    const state = this.documents.get(documentId);

    if (!state) {
      return [];
    }

    return state.operations.filter((op) => op.version > sinceVersion);
  }

  /**
   * Add participant to document
   */
  addParticipant(documentId: string, userId: string): void {
    const state = this.documents.get(documentId);

    if (state) {
      state.participants.add(userId);
      this.logger.log(`User ${userId} joined editing session for ${documentId}`);
    }
  }

  /**
   * Remove participant from document
   */
  removeParticipant(documentId: string, userId: string): void {
    const state = this.documents.get(documentId);

    if (state) {
      state.participants.delete(userId);
      this.logger.log(`User ${userId} left editing session for ${documentId}`);

      // Cleanup if no participants
      if (state.participants.size === 0) {
        this.cleanupDocument(documentId);
      }
    }
  }

  /**
   * Verify document integrity
   */
  verifyIntegrity(documentId: string, clientChecksum: string): boolean {
    const state = this.documents.get(documentId);

    if (!state) {
      return false;
    }

    return state.checksum === clientChecksum;
  }

  /**
   * Resolve conflicts
   */
  resolveConflict(
    documentId: string,
    clientVersion: number,
    clientOperations: Operation[],
  ): {
    resolved: boolean;
    operations: Operation[];
    currentVersion: number;
  } {
    const state = this.documents.get(documentId);

    if (!state) {
      return {
        resolved: false,
        operations: [],
        currentVersion: 0,
      };
    }

    // Get server operations since client version
    const serverOps = this.getOperationsSinceVersion(documentId, clientVersion);

    // Transform client operations against server operations
    const transformedOps: Operation[] = [];

    for (const clientOp of clientOperations) {
      let transformed = clientOp;

      for (const serverOp of serverOps) {
        transformed = this.transformOperations(transformed, serverOp);
      }

      transformedOps.push(transformed);
    }

    return {
      resolved: true,
      operations: serverOps,
      currentVersion: state.version,
    };
  }

  /**
   * Transform operation against document state
   */
  private transformOperation(
    state: DocumentState,
    operation: Omit<Operation, 'version' | 'timestamp'>,
  ): Omit<Operation, 'version' | 'timestamp'> {
    // Get concurrent operations (operations after the base version)
    const concurrentOps = state.operations.slice(-10); // Last 10 operations

    let transformed = operation;

    for (const concurrentOp of concurrentOps) {
      if (concurrentOp.userId !== operation.userId) {
        transformed = this.transformOperations(transformed, concurrentOp);
      }
    }

    return transformed;
  }

  /**
   * Operational Transformation (OT) algorithm
   */
  private transformOperations(
    op1: Omit<Operation, 'version' | 'timestamp'> | Operation,
    op2: Operation,
  ): Omit<Operation, 'version' | 'timestamp'> {
    const result = { ...op1 };

    // INSERT vs INSERT
    if (op1.type === OperationType.INSERT && op2.type === OperationType.INSERT) {
      if (op2.position <= op1.position) {
        result.position = op1.position + (op2.content?.length || 0);
      }
    }
    // INSERT vs DELETE
    else if (op1.type === OperationType.INSERT && op2.type === OperationType.DELETE) {
      if (op2.position < op1.position) {
        result.position = Math.max(op2.position, op1.position - (op2.length || 0));
      }
    }
    // DELETE vs INSERT
    else if (op1.type === OperationType.DELETE && op2.type === OperationType.INSERT) {
      if (op2.position <= op1.position) {
        result.position = op1.position + (op2.content?.length || 0);
      }
    }
    // DELETE vs DELETE
    else if (op1.type === OperationType.DELETE && op2.type === OperationType.DELETE) {
      if (op2.position < op1.position) {
        result.position = Math.max(op2.position, op1.position - (op2.length || 0));
      } else if (op2.position < op1.position + (op1.length || 0)) {
        // Overlapping deletes
        const overlap = Math.min(
          (op1.position + (op1.length || 0)) - op2.position,
          op2.length || 0,
        );
        result.length = (result.length || 0) - overlap;
      }
    }

    return result;
  }

  /**
   * Apply operation to content string
   */
  private applyToContent(content: string, operation: Omit<Operation, 'version' | 'timestamp'>): string {
    switch (operation.type) {
      case OperationType.INSERT:
        return (
          content.slice(0, operation.position) +
          (operation.content || '') +
          content.slice(operation.position)
        );

      case OperationType.DELETE:
        return (
          content.slice(0, operation.position) +
          content.slice(operation.position + (operation.length || 0))
        );

      case OperationType.REPLACE:
        return (
          content.slice(0, operation.position) +
          (operation.content || '') +
          content.slice(operation.position + (operation.length || 0))
        );

      default:
        return content;
    }
  }

  /**
   * Calculate checksum for content
   */
  private calculateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Add operation to history
   */
  private addToHistory(documentId: string, operation: Operation): void {
    let history = this.operationHistory.get(documentId);

    if (!history) {
      history = [];
      this.operationHistory.set(documentId, history);
    }

    history.push(operation);

    // Trim history if too large
    if (history.length > this.MAX_HISTORY_SIZE) {
      history.splice(0, history.length - this.MAX_HISTORY_SIZE);
    }
  }

  /**
   * Get operation history
   */
  getOperationHistory(
    documentId: string,
    limit?: number,
  ): Operation[] {
    const history = this.operationHistory.get(documentId) || [];

    if (limit) {
      return history.slice(-limit);
    }

    return [...history];
  }

  /**
   * Cleanup document state
   */
  private cleanupDocument(documentId: string): void {
    this.documents.delete(documentId);
    this.operationHistory.delete(documentId);
    this.logger.log(`Cleaned up document ${documentId}`);
  }

  /**
   * Force cleanup (for maintenance)
   */
  forceCleanup(documentId: string): void {
    this.cleanupDocument(documentId);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalDocuments: number;
    totalParticipants: number;
    totalOperations: number;
    documentsWithActivity: string[];
  } {
    let totalParticipants = 0;
    let totalOperations = 0;
    const documentsWithActivity: string[] = [];

    this.documents.forEach((state, documentId) => {
      totalParticipants += state.participants.size;
      totalOperations += state.operations.length;

      if (state.participants.size > 0) {
        documentsWithActivity.push(documentId);
      }
    });

    return {
      totalDocuments: this.documents.size,
      totalParticipants,
      totalOperations,
      documentsWithActivity,
    };
  }

  /**
   * Snapshot document state (for persistence)
   */
  createSnapshot(documentId: string): {
    content: string;
    version: number;
    checksum: string;
    timestamp: Date;
  } | null {
    const state = this.documents.get(documentId);

    if (!state) {
      return null;
    }

    return {
      content: state.content,
      version: state.version,
      checksum: state.checksum || '',
      timestamp: state.lastModified,
    };
  }

  /**
   * Restore from snapshot
   */
  restoreFromSnapshot(
    documentId: string,
    snapshot: {
      content: string;
      version: number;
      checksum: string;
    },
  ): void {
    const state: DocumentState = {
      documentId,
      content: snapshot.content,
      version: snapshot.version,
      operations: [],
      participants: new Set(),
      lastModified: new Date(),
      checksum: snapshot.checksum,
    };

    this.documents.set(documentId, state);
    this.logger.log(`Restored document ${documentId} from snapshot at version ${snapshot.version}`);
  }
}
