/**
 * @module services/documents/redactionService
 * @category Document Services
 * @description Production document redaction service supporting PDF, DOCX, and text
 * formats. Handles PII removal, audit trails, and compliance with legal standards.
 *
 * @example
 * ```typescript
 * const result = await RedactionService.redactDocument(documentId, entities);
 * const audit = await RedactionService.getRedactionAudit(documentId);
 * ```
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

import type { PIIEntity } from "../ai/piiDetectionService";

export interface RedactionRequest {
  documentId: string;
  entities: PIIEntity[];
  reason?: string;
  performedBy: string;
  preserveFormatting?: boolean;
  createNewVersion?: boolean;
}

export interface RedactionResult {
  success: boolean;
  documentId: string;
  newVersionId?: string;
  redactedCount: number;
  timestamp: Date;
  error?: Error;
}

export interface RedactionAuditEntry {
  id: string;
  documentId: string;
  timestamp: Date;
  performedBy: string;
  reason?: string;
  entityTypes: string[];
  entityCount: number;
  preservedOriginal: boolean;
}

export interface RedactionOptions {
  redactionChar?: string;
  preserveLength?: boolean;
  preserveFormat?: boolean;
  annotateRedactions?: boolean;
  generateAuditLog?: boolean;
}

export interface RedactionMetadata {
  totalRedactions: number;
  byType: Record<string, number>;
  timestamp: Date;
  version: string;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class RedactionServiceClass {
  private readonly REDACTION_CHAR = "█";
  private readonly AUDIT_STORAGE_KEY = "lexiflow_redaction_audit";
  private auditLog: RedactionAuditEntry[] = [];

  constructor() {
    this.loadAuditLog();
  }

  /**
   * Redacts a document by removing PII entities
   */
  async redactDocument(request: RedactionRequest): Promise<RedactionResult> {
    try {
      const {
        documentId,
        entities,
        reason,
        performedBy,
        preserveFormatting = true,
        createNewVersion = true,
      } = request;

      // Filter out ignored entities
      const entitiesToRedact = entities.filter((e) => !e.ignored);

      if (entitiesToRedact.length === 0) {
        return {
          success: true,
          documentId,
          redactedCount: 0,
          timestamp: new Date(),
        };
      }

      // Fetch document content
      const content = await this.fetchDocumentContent(documentId);

      // Apply redactions
      const redactedContent = this.applyRedactions(content, entitiesToRedact, {
        preserveFormat: preserveFormatting,
      });

      // Create new version or update existing
      const newVersionId = createNewVersion
        ? await this.createDocumentVersion(documentId, redactedContent)
        : await this.updateDocumentContent(documentId, redactedContent);

      // Generate audit entry
      await this.logRedaction({
        documentId,
        entities: entitiesToRedact,
        reason,
        performedBy,
        preservedOriginal: createNewVersion,
      });

      return {
        success: true,
        documentId,
        newVersionId: createNewVersion ? newVersionId : undefined,
        redactedCount: entitiesToRedact.length,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        documentId: request.documentId,
        redactedCount: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error : new Error("Redaction failed"),
      };
    }
  }

  /**
   * Applies redactions to text content
   */
  applyRedactions(
    content: string,
    entities: PIIEntity[],
    options: RedactionOptions = {}
  ): string {
    const {
      redactionChar = this.REDACTION_CHAR,
      preserveLength = true,
      preserveFormat = true,
    } = options;

    // Sort entities by index in reverse to maintain correct positions
    const sortedEntities = [...entities].sort((a, b) => b.index - a.index);

    let redacted = content;

    for (const entity of sortedEntities) {
      const { index, length, value } = entity;

      let replacement: string;

      if (preserveLength) {
        if (preserveFormat && /[-\s().]/.test(value)) {
          // Preserve formatting characters like dashes, spaces, parentheses
          replacement = value.replace(/[^\s\-().]/g, redactionChar);
        } else {
          replacement = redactionChar.repeat(length);
        }
      } else {
        replacement = `[${entity.type} REDACTED]`;
      }

      redacted =
        redacted.substring(0, index) +
        replacement +
        redacted.substring(index + length);
    }

    return redacted;
  }

  /**
   * Redacts specific text patterns (manual redaction)
   */
  async redactPattern(
    documentId: string,
    pattern: RegExp,
    reason: string,
    performedBy: string
  ): Promise<RedactionResult> {
    try {
      const content = await this.fetchDocumentContent(documentId);
      let redacted = content;
      let matchCount = 0;

      // Replace all matches
      redacted = content.replace(pattern, (match) => {
        matchCount++;
        return this.REDACTION_CHAR.repeat(match.length);
      });

      if (matchCount > 0) {
        await this.updateDocumentContent(documentId, redacted);
        await this.logManualRedaction(
          documentId,
          pattern.toString(),
          matchCount,
          reason,
          performedBy
        );
      }

      return {
        success: true,
        documentId,
        redactedCount: matchCount,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        documentId,
        redactedCount: 0,
        timestamp: new Date(),
        error:
          error instanceof Error
            ? error
            : new Error("Pattern redaction failed"),
      };
    }
  }

  /**
   * Bulk redact multiple documents
   */
  async bulkRedact(
    requests: RedactionRequest[],
    onProgress?: (current: number, total: number) => void
  ): Promise<RedactionResult[]> {
    const results: RedactionResult[] = [];

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      if (!request) continue;
      const result = await this.redactDocument(request);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, requests.length);
      }

      // Yield to main thread every 5 documents
      if (i % 5 === 0) {
        await this.yieldToMain();
      }
    }

    return results;
  }

  /**
   * Gets redaction audit log for a document
   */
  async getRedactionAudit(documentId: string): Promise<RedactionAuditEntry[]> {
    return this.auditLog.filter((entry) => entry.documentId === documentId);
  }

  /**
   * Gets all redaction audits
   */
  async getAllRedactionAudits(): Promise<RedactionAuditEntry[]> {
    return [...this.auditLog];
  }

  /**
   * Exports redaction audit as JSON
   */
  exportAuditLog(): string {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        totalEntries: this.auditLog.length,
        entries: this.auditLog,
      },
      null,
      2
    );
  }

  /**
   * Clears redaction audit log (use with caution)
   */
  clearAuditLog(): void {
    this.auditLog = [];
    this.saveAuditLog();
  }

  /**
   * Previews redactions without saving
   */
  previewRedactions(content: string, entities: PIIEntity[]): string {
    return this.applyRedactions(
      content,
      entities.filter((e) => !e.ignored)
    );
  }

  /**
   * Generates redaction metadata for reporting
   */
  generateMetadata(entities: PIIEntity[]): RedactionMetadata {
    const byType: Record<string, number> = {};

    for (const entity of entities) {
      if (!entity.ignored) {
        byType[entity.type] = (byType[entity.type] || 0) + 1;
      }
    }

    return {
      totalRedactions: entities.filter((e) => !e.ignored).length,
      byType,
      timestamp: new Date(),
      version: "1.0",
    };
  }

  /**
   * Validates redaction completeness
   */
  async validateRedaction(
    originalContent: string,
    redactedContent: string,
    entities: PIIEntity[]
  ): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check if original entities still appear in redacted content
    for (const entity of entities) {
      if (!entity.ignored && redactedContent.includes(entity.value)) {
        issues.push(
          `Entity "${entity.type}" at index ${entity.index} not fully redacted`
        );
      }
    }

    // Check length preservation if required
    if (originalContent.length !== redactedContent.length) {
      issues.push("Document length changed during redaction");
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Fetches document content from backend or cache
   */
  private async fetchDocumentContent(documentId: string): Promise<string> {
    // In production, this would fetch from backend API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const url = `${baseUrl}/api/documents/${documentId}/content`;

    const response = await fetch(url, {
      credentials: "include",
      headers: {
        Authorization: this.getAuthToken() || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * Creates a new document version with redacted content
   */
  private async createDocumentVersion(
    documentId: string,
    content: string
  ): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const url = `${baseUrl}/api/documents/${documentId}/versions`;

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.getAuthToken() || "",
      },
      body: JSON.stringify({
        content,
        versionNote: "Redacted version - PII removed",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create version: ${response.statusText}`);
    }

    const data = await response.json();
    return data.versionId;
  }

  /**
   * Updates existing document content
   */
  private async updateDocumentContent(
    documentId: string,
    content: string
  ): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const url = `${baseUrl}/api/documents/${documentId}`;

    const response = await fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.getAuthToken() || "",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`);
    }

    return documentId;
  }

  /**
   * Logs redaction to audit trail
   */
  private async logRedaction(params: {
    documentId: string;
    entities: PIIEntity[];
    reason?: string;
    performedBy: string;
    preservedOriginal: boolean;
  }): Promise<void> {
    const { documentId, entities, reason, performedBy, preservedOriginal } =
      params;

    const entry: RedactionAuditEntry = {
      id: `red-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      timestamp: new Date(),
      performedBy,
      reason,
      entityTypes: [...new Set(entities.map((e) => e.type))],
      entityCount: entities.length,
      preservedOriginal,
    };

    this.auditLog.push(entry);
    this.saveAuditLog();
  }

  /**
   * Logs manual pattern redaction
   */
  private async logManualRedaction(
    documentId: string,
    pattern: string,
    matchCount: number,
    reason: string,
    performedBy: string
  ): Promise<void> {
    const entry: RedactionAuditEntry = {
      id: `red-manual-${Date.now()}`,
      documentId,
      timestamp: new Date(),
      performedBy,
      reason: `Manual pattern redaction: ${pattern}. ${reason}`,
      entityTypes: ["Manual Pattern"],
      entityCount: matchCount,
      preservedOriginal: false,
    };

    this.auditLog.push(entry);
    this.saveAuditLog();
  }

  /**
   * Loads audit log from localStorage
   */
  private loadAuditLog(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.AUDIT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        this.auditLog = parsed.map(
          (entry: { timestamp: string; [key: string]: unknown }) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          })
        );
      }
    } catch (error) {
      console.error("Failed to load redaction audit log:", error);
      this.auditLog = [];
    }
  }

  /**
   * Saves audit log to localStorage
   */
  private saveAuditLog(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        this.AUDIT_STORAGE_KEY,
        JSON.stringify(this.auditLog)
      );
    } catch (error) {
      console.error("Failed to save redaction audit log:", error);
    }
  }

  /**
   * Gets authentication token
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      return (
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token")
      );
    } catch {
      return null;
    }
  }

  /**
   * Yields to main thread
   */
  private async yieldToMain(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const RedactionService = new RedactionServiceClass();
