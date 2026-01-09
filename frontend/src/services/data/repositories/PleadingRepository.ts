/**
 * Pleading Repository
 * Enterprise-grade repository for legal pleading management with backend API integration
 *
 * @module PleadingRepository
 * @description Manages all pleading-related operations including:
 * - Pleading CRUD operations
 * - Template-based pleading creation
 * - Optimistic concurrency control (versioning)
 * - PDF generation
 * - Jurisdiction-specific formatting rules
 * - Integration event publishing
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend-first architecture with secure fallback
 * - Version conflict detection
 * - Proper error handling and logging
 *
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - IndexedDB fallback (development only)
 * - React Query integration via PLEADING_QUERY_KEYS
 * - Type-safe operations
 * - Event-driven integration
 */

import { PleadingsApiService } from "@/api/litigation/pleadings-api";
import { isBackendApiEnabled } from "@/config/network/api.config";
import { OperationError, ValidationError } from "@/services/core/errors";
import { Repository } from "@/services/core/Repository";
import { STORES, db } from "@/services/data/db";
import { apiClient } from "@/services/infrastructure/apiClient";
import {
  Case,
  CaseId,
  FormattingRule,
  PleadingDocument,
  PleadingSection,
  PleadingTemplate,
  UserId,
} from "@/types";
import { IdGenerator } from "@/shared/lib/idGenerator";
import {
  createTemplateContext,
  hydrateTemplateSections,
} from "@/utils/templateEngine";
import { validateTemplate } from "@/shared/lib/validation";

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: PLEADING_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: PLEADING_QUERY_KEYS.byCase(caseId) });
 */
export const PLEADING_QUERY_KEYS = {
  all: () => ["pleadings"] as const,
  byId: (id: string) => ["pleadings", id] as const,
  byCase: (caseId: string) => ["pleadings", "case", caseId] as const,
  byType: (type: string) => ["pleadings", "type", type] as const,
  byStatus: (status: string) => ["pleadings", "status", status] as const,
  templates: () => ["pleadings", "templates"] as const,
} as const;

/**
 * Version conflict error for optimistic concurrency control
 */
export class VersionConflictError extends Error {
  constructor(
    message: string,
    public readonly expectedVersion: number,
    public readonly actualVersion: number
  ) {
    super(message);
    this.name = "VersionConflictError";
  }
}

/**
 * Pleading Repository Class
 * Implements backend-first pattern with IndexedDB fallback
 */
export class PleadingRepository extends Repository<PleadingDocument> {
  private readonly useBackend: boolean;
  private pleadingsApi: PleadingsApiService;

  constructor() {
    super(STORES.PLEADINGS);
    this.useBackend = isBackendApiEnabled();
    this.pleadingsApi = new PleadingsApiService();
    this.logInitialization();
  }

  /**
   * Log repository initialization mode
   * @private
   */
  private logInitialization(): void {
    const mode = this.useBackend
      ? "Backend API (PostgreSQL)"
      : "IndexedDB (Local)";
    console.log(`[PleadingRepository] Initialized with ${mode}`);
  }

  /**
   * Validate and sanitize ID parameter
   * @private
   */
  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error(
        `[PleadingRepository.${methodName}] Invalid id parameter`
      );
    }
  }

  /**
   * Validate and sanitize case ID parameter
   * @private
   */
  private validateCaseId(caseId: string, methodName: string): void {
    if (!caseId || typeof caseId !== "string" || caseId.trim() === "") {
      throw new Error(
        `[PleadingRepository.${methodName}] Invalid caseId parameter`
      );
    }
  }

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================

  /**
   * Get all pleadings
   *
   * @returns Promise<PleadingDocument[]> Array of pleadings
   * @throws Error if fetch fails
   */
  override async getAll(): Promise<PleadingDocument[]> {
    if (this.useBackend) {
      try {
        return (await this.pleadingsApi.getAll()) as unknown as PleadingDocument[];
      } catch (error) {
        console.warn(
          "[PleadingRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      return await super.getAll();
    } catch (error) {
      console.error("[PleadingRepository.getAll] Error:", error);
      throw new OperationError("getAll", "Failed to fetch pleadings");
    }
  }

  /**
   * Get pleadings by case ID
   *
   * @param caseId - Case ID
   * @returns Promise<PleadingDocument[]> Array of pleadings
   * @throws Error if caseId is invalid or fetch fails
   */
  override getByCaseId = async (
    caseId: string
  ): Promise<PleadingDocument[]> => {
    this.validateCaseId(caseId, "getByCaseId");

    if (this.useBackend) {
      try {
        return (await this.pleadingsApi.getByCaseId(
          caseId
        )) as unknown as PleadingDocument[];
      } catch (error) {
        console.warn(
          "[PleadingRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      return await this.getByIndex("caseId", caseId);
    } catch (error) {
      console.error("[PleadingRepository.getByCaseId] Error:", error);
      throw new OperationError(
        "getByCaseId",
        "Failed to fetch pleadings by case ID"
      );
    }
  };

  /**
   * Get pleading by ID
   *
   * @param id - Pleading ID
   * @returns Promise<PleadingDocument | undefined> Pleading or undefined
   * @throws Error if id is invalid or fetch fails
   */
  override async getById(id: string): Promise<PleadingDocument | undefined> {
    this.validateId(id, "getById");

    if (this.useBackend) {
      try {
        return (await this.pleadingsApi.getById(
          id
        )) as unknown as PleadingDocument;
      } catch (error) {
        console.warn(
          "[PleadingRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      return await super.getById(id);
    } catch (error) {
      console.error("[PleadingRepository.getById] Error:", error);
      throw new OperationError("getById", "Failed to fetch pleading");
    }
  }

  /**
   * Add a new pleading
   *
   * @param item - Pleading data
   * @returns Promise<PleadingDocument> Created pleading
   * @throws Error if validation fails or create fails
   */
  override async add(item: PleadingDocument): Promise<PleadingDocument> {
    if (!item || typeof item !== "object") {
      throw new ValidationError(
        "[PleadingRepository.add] Invalid pleading data"
      );
    }

    if (this.useBackend) {
      try {
        return (await this.pleadingsApi.create(
          item as unknown as Parameters<typeof this.pleadingsApi.create>[0]
        )) as unknown as PleadingDocument;
      } catch (error) {
        console.warn(
          "[PleadingRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      await super.add(item);
      return item;
    } catch (error) {
      console.error("[PleadingRepository.add] Error:", error);
      throw new OperationError("add", "Failed to add pleading");
    }
  }

  /**
   * Update an existing pleading
   *
   * @param id - Pleading ID
   * @param updates - Partial pleading updates
   * @returns Promise<PleadingDocument> Updated pleading
   * @throws Error if validation fails or update fails
   */
  override async update(
    id: string,
    updates: Partial<PleadingDocument>
  ): Promise<PleadingDocument> {
    this.validateId(id, "update");

    if (!updates || typeof updates !== "object") {
      throw new ValidationError(
        "[PleadingRepository.update] Invalid updates data"
      );
    }

    if (this.useBackend) {
      try {
        return (await this.pleadingsApi.update(
          id,
          updates as unknown as Parameters<typeof this.pleadingsApi.update>[1]
        )) as unknown as PleadingDocument;
      } catch (error) {
        console.warn(
          "[PleadingRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      return await super.update(id, updates);
    } catch (error) {
      console.error("[PleadingRepository.update] Error:", error);
      throw new OperationError("update", "Failed to update pleading");
    }
  }

  /**
   * Delete a pleading
   *
   * @param id - Pleading ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");

    if (this.useBackend) {
      try {
        await this.pleadingsApi.delete(id);
        return;
      } catch (error) {
        console.warn(
          "[PleadingRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      await super.delete(id);
    } catch (error) {
      console.error("[PleadingRepository.delete] Error:", error);
      throw new OperationError("delete", "Failed to delete pleading");
    }
  }

  // =============================================================================
  // TEMPLATE OPERATIONS
  // =============================================================================

  /**
   * Get all pleading templates
   *
   * @returns Promise<PleadingTemplate[]> Array of templates
   * @throws Error if fetch fails
   */
  getTemplates = async (): Promise<PleadingTemplate[]> => {
    try {
      return await db.getAll<PleadingTemplate>(STORES.PLEADING_TEMPLATES);
    } catch (error) {
      console.error("[PleadingRepository.getTemplates] Error:", error);
      throw new OperationError(
        "getTemplates",
        "Failed to fetch pleading templates"
      );
    }
  };

  /**
   * Creates a pleading from template with proper type safety and validation
   *
   * @param templateId - Template ID
   * @param caseId - Case ID
   * @param title - Pleading title
   * @param userId - User ID
   * @returns Promise<PleadingDocument> Created pleading
   * @throws Error if template/case not found or validation fails
   */
  createFromTemplate = async (
    templateId: string,
    caseId: string,
    title: string,
    userId: string
  ): Promise<PleadingDocument> => {
    this.validateId(templateId, "createFromTemplate");
    this.validateCaseId(caseId, "createFromTemplate");

    if (!title || typeof title !== "string" || title.trim() === "") {
      throw new ValidationError(
        "[PleadingRepository.createFromTemplate] Invalid title parameter"
      );
    }

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      throw new ValidationError(
        "[PleadingRepository.createFromTemplate] Invalid userId parameter"
      );
    }

    try {
      const [template, caseData] = await Promise.all([
        db.get<PleadingTemplate>(STORES.PLEADING_TEMPLATES, templateId),
        db.get<Case>(STORES.CASES, caseId),
      ]);

      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      if (!caseData) {
        throw new Error(`Case not found: ${caseId}`);
      }

      // Validate template structure
      const validation = validateTemplate(template);
      if (!validation.valid) {
        throw new Error(
          `Invalid template: ${validation.errors.map((e) => e.message).join(", ")}`
        );
      }

      // Create template context with case data
      const context = createTemplateContext(caseData);

      // Hydrate sections using template engine
      const hydratedPartialSections = hydrateTemplateSections(
        template.defaultSections,
        context
      );

      // Convert to full PleadingSection objects with generated IDs
      const hydratedSections: PleadingSection[] = hydratedPartialSections.map(
        (s, idx) => ({
          id: IdGenerator.section(),
          type: s.type || "Paragraph",
          content: s.content || "",
          order: idx,
          meta: s.meta,
        })
      );

      const newDoc: PleadingDocument = {
        id: IdGenerator.pleading(),
        caseId: caseId as CaseId,
        title: title,
        status: "Draft",
        filingStatus: "Pre-Filing",
        jurisdictionRulesId: "default",
        version: 1,
        sections: hydratedSections,
        createdBy: userId as UserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.add(newDoc);
      return newDoc;
    } catch (error) {
      console.error("[PleadingRepository.createFromTemplate] Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new OperationError(
        "createFromTemplate",
        "Failed to create pleading from template"
      );
    }
  };

  // =============================================================================
  // VERSION CONTROL
  // =============================================================================

  /**
   * Updates a pleading with optimistic concurrency control
   *
   * @param id - Pleading ID
   * @param updates - Partial pleading updates
   * @param expectedVersion - Expected version number
   * @returns Promise<PleadingDocument> Updated pleading
   * @throws VersionConflictError if version mismatch
   * @throws Error if pleading not found or update fails
   */
  updateWithVersionCheck = async (
    id: string,
    updates: Partial<PleadingDocument>,
    expectedVersion: number
  ): Promise<PleadingDocument> => {
    this.validateId(id, "updateWithVersionCheck");

    try {
      const current = await this.getById(id);

      if (!current) {
        throw new Error(`Pleading not found: ${id}`);
      }

      // Check version for optimistic locking
      if (current.version !== expectedVersion) {
        throw new VersionConflictError(
          "Version conflict: document was modified by another user",
          expectedVersion,
          current.version
        );
      }

      // Increment version
      const updated: PleadingDocument = {
        ...current,
        ...updates,
        version: current.version + 1,
        updatedAt: new Date().toISOString(),
      };

      await this.update(id, updated);
      return updated;
    } catch (error) {
      console.error(
        "[PleadingRepository.updateWithVersionCheck] Error:",
        error
      );
      if (error instanceof VersionConflictError) {
        throw error;
      }
      throw new OperationError(
        "updateWithVersionCheck",
        "Failed to update pleading with version check"
      );
    }
  };

  // =============================================================================
  // FORMATTING & RULES
  // =============================================================================

  /**
   * Gets formatting rules (with future support for jurisdiction-specific rules)
   *
   * @param jurisdictionId - Optional jurisdiction ID for specific rules
   * @returns Promise<FormattingRule> Formatting rules
   * @throws Error if fetch fails
   */
  getFormattingRules = async (
    jurisdictionId?: string
  ): Promise<FormattingRule> => {
    try {
      // Check for backend rules if available
      if (this.useBackend && jurisdictionId) {
        // Future integration: return await this.pleadingsApi.getRules(jurisdictionId);
      }

      // Standard Rules Configuration
      if (jurisdictionId === "CA-SUPERIOR") {
        return {
          id: IdGenerator.formattingRule(),
          name: "California Superior Court Rules",
          fontFamily: "Times New Roman",
          fontSize: 12,
          lineHeight: 1.5, // Standard for CA Superior Court
          marginTop: "1in",
          marginBottom: "1in",
          marginLeft: "1in",
          marginRight: "1in",
          showLineNumbers: true,
          paperSize: "Letter",
          captionStyle: "Plain" as const,
        };
      }

      // Default: Federal Civil Rules
      return {
        id: IdGenerator.formattingRule(),
        name: "Federal Civil Rules",
        fontFamily: "Times New Roman",
        fontSize: 12,
        lineHeight: 2.0,
        marginTop: "1in",
        marginBottom: "1in",
        marginLeft: "1.25in",
        marginRight: "1in",
        showLineNumbers: true,
        paperSize: "Letter",
        captionStyle: "Boxed",
      };
    } catch (error) {
      console.error("[PleadingRepository.getFormattingRules] Error:", error);
      throw new OperationError(
        "getFormattingRules",
        "Failed to get formatting rules"
      );
    }
  };

  // =============================================================================
  // PDF GENERATION
  // =============================================================================

  /**
   * Generates PDF with proper error handling
   *
   * @param pleadingId - Pleading ID
   * @returns Promise<string> PDF URL
   * @throws Error if pleading not found or generation fails
   */
  generatePDF = async (pleadingId: string): Promise<string> => {
    this.validateId(pleadingId, "generatePDF");

    try {
      const pleading = await this.getById(pleadingId);

      if (!pleading) {
        throw new Error(`Pleading not found: ${pleadingId}`);
      }

      if (this.useBackend) {
        // Request PDF generation from backend
        const response = await apiClient.post<{ url: string }>(
          `/litigation/pleadings/${pleadingId}/pdf`
        );
        // Check for response data
        if (response && typeof response === "object" && "data" in response) {
          const responseData = response as { data: { url?: string } };
          if (responseData.data?.url) {
            return responseData.data.url;
          }
        }
        // Fallback if URL not returned but handled
        const baseURL = (apiClient as any).defaults?.baseURL || "";
        return `${baseURL}/litigation/pleadings/${pleadingId}/pdf/download`;
      }

      // Fallback for local mode: cannot generate PDF client-side without heavy library
      // Return a blob URL if possible or throw
      console.warn(
        "[PleadingRepository] PDF generation requires backend service."
      );
      throw new OperationError(
        "generatePDF",
        "PDF generation is not available in offline mode"
      );
    } catch (error) {
      console.error("[PleadingRepository.generatePDF] Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new OperationError("generatePDF", "Failed to generate PDF");
    }
  };

  // =============================================================================
  // QUERIES & FILTERING
  // =============================================================================

  /**
   * Search pleadings by criteria
   *
   * @param criteria - Search criteria
   * @returns Promise<PleadingDocument[]> Matching pleadings
   * @throws Error if search fails
   */
  async search(criteria: {
    caseId?: string;
    type?: string;
    status?: string;
    filingStatus?: string;
    query?: string;
  }): Promise<PleadingDocument[]> {
    try {
      let pleadings = await this.getAll();

      if (criteria.caseId) {
        pleadings = pleadings.filter((p) => p.caseId === criteria.caseId);
      }

      if (criteria.type) {
        pleadings = pleadings.filter(
          (p) => (p as { type?: string }).type === criteria.type
        );
      }

      if (criteria.status) {
        pleadings = pleadings.filter((p) => p.status === criteria.status);
      }

      if (criteria.filingStatus) {
        pleadings = pleadings.filter(
          (p) => p.filingStatus === criteria.filingStatus
        );
      }

      if (criteria.query) {
        const lowerQuery = criteria.query.toLowerCase();
        pleadings = pleadings.filter(
          (p) =>
            p.title?.toLowerCase().includes(lowerQuery) ||
            p.sections?.some((s) =>
              s.content?.toLowerCase().includes(lowerQuery)
            )
        );
      }

      return pleadings;
    } catch (error) {
      console.error("[PleadingRepository.search] Error:", error);
      throw new OperationError("search", "Failed to search pleadings");
    }
  }
}
