import { ApiClient } from '@/services';

export interface DraftingStats {
  drafts: number;
  templates: number;
  pendingReviews: number;
  myTemplates: number;
}

export enum TemplateCategory {
  COMPLAINT = 'complaint',
  ANSWER = 'answer',
  MOTION = 'motion',
  BRIEF = 'brief',
  DISCOVERY = 'discovery',
  CONTRACT = 'contract',
  LETTER = 'letter',
  MEMO = 'memo',
  ORDER = 'order',
  PLEADING = 'pleading',
  NOTICE = 'notice',
  STIPULATION = 'stipulation',
  AFFIDAVIT = 'affidavit',
  DECLARATION = 'declaration',
  OTHER = 'other',
}

export enum TemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated',
}

export enum GeneratedDocumentStatus {
  GENERATING = 'generating',
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FINALIZED = 'finalized',
  FILED = 'filed',
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'multi-select' | 'boolean' | 'case-data' | 'party' | 'attorney';
  required: boolean;
  defaultValue?: string;
  options?: string[];
  description?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface ClauseReference {
  clauseId: string;
  position: number;
  isOptional: boolean;
  condition?: string;
}

export interface DraftingTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  status: TemplateStatus;
  content: string;
  variables: TemplateVariable[];
  clauseReferences?: ClauseReference[];
  tags?: string[];
  jurisdiction?: string;
  practiceArea?: string;
  courtType?: string;
  isPublic: boolean;
  createdBy: string;
  updatedBy?: string;
  usageCount: number;
  lastUsedAt?: string;
  version?: string;
  parentTemplateId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  description?: string;
  templateId: string;
  template?: DraftingTemplate;
  caseId?: string;
  case?: any;
  status: GeneratedDocumentStatus;
  content: string;
  variableValues: Record<string, unknown>;
  includedClauses?: string[];
  createdBy: string;
  creator?: any;
  reviewedBy?: string;
  reviewer?: any;
  reviewedAt?: string;
  approvalNotes?: string;
  wordCount: number;
  pageCount?: number;
  filePath?: string;
  pdfPath?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  category: TemplateCategory;
  status?: TemplateStatus;
  content: string;
  variables?: TemplateVariable[];
  clauseReferences?: ClauseReference[];
  tags?: string[];
  jurisdiction?: string;
  practiceArea?: string;
  courtType?: string;
  isPublic?: boolean;
  version?: string;
  parentTemplateId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

export interface GenerateDocumentDto {
  title: string;
  description?: string;
  templateId: string;
  caseId?: string;
  variableValues: Record<string, unknown>;
  includedClauses?: string[];
}

export interface UpdateGeneratedDocumentDto {
  title?: string;
  description?: string;
  status?: GeneratedDocumentStatus;
  content?: string;
  variableValues?: Record<string, unknown>;
  includedClauses?: string[];
  approvalNotes?: string;
}

export class DraftingApiService {
  private static instance: DraftingApiService;
  private client: ApiClient;

  private constructor() {
    this.client = new ApiClient();
  }

  public static getInstance(): DraftingApiService {
    if (!DraftingApiService.instance) {
      DraftingApiService.instance = new DraftingApiService();
    }
    return DraftingApiService.instance;
  }

  // ============================================================================
  // DASHBOARD METHODS
  // ============================================================================

  public async getRecentDrafts(limit: number = 5): Promise<GeneratedDocument[]> {
    return this.client.get<GeneratedDocument[]>(`/drafting/recent-drafts?limit=${limit}`);
  }

  public async getTemplates(limit: number = 10): Promise<DraftingTemplate[]> {
    return this.client.get<DraftingTemplate[]>(`/drafting/templates?limit=${limit}`);
  }

  public async getPendingApprovals(): Promise<GeneratedDocument[]> {
    return this.client.get<GeneratedDocument[]>('/drafting/approvals');
  }

  public async getStats(): Promise<DraftingStats> {
    return this.client.get<DraftingStats>('/drafting/stats');
  }

  // ============================================================================
  // TEMPLATE CRUD METHODS
  // ============================================================================

  public async createTemplate(dto: CreateTemplateDto): Promise<DraftingTemplate> {
    return this.client.post<DraftingTemplate>('/drafting/templates', dto);
  }

  public async getAllTemplates(filters?: {
    category?: string;
    jurisdiction?: string;
    practiceArea?: string;
    search?: string;
  }): Promise<DraftingTemplate[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.jurisdiction) params.append('jurisdiction', filters.jurisdiction);
    if (filters?.practiceArea) params.append('practiceArea', filters.practiceArea);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    return this.client.get<DraftingTemplate[]>(`/drafting/templates/all${query ? `?${query}` : ''}`);
  }

  public async getTemplateById(id: string): Promise<DraftingTemplate> {
    return this.client.get<DraftingTemplate>(`/drafting/templates/${id}`);
  }

  public async updateTemplate(id: string, dto: UpdateTemplateDto): Promise<DraftingTemplate> {
    return this.client.put<DraftingTemplate>(`/drafting/templates/${id}`, dto);
  }

  public async deleteTemplate(id: string): Promise<void> {
    return this.client.delete(`/drafting/templates/${id}`);
  }

  public async archiveTemplate(id: string): Promise<DraftingTemplate> {
    return this.client.post<DraftingTemplate>(`/drafting/templates/${id}/archive`, {});
  }

  public async duplicateTemplate(id: string): Promise<DraftingTemplate> {
    return this.client.post<DraftingTemplate>(`/drafting/templates/${id}/duplicate`, {});
  }

  // ============================================================================
  // DOCUMENT GENERATION METHODS
  // ============================================================================

  public async generateDocument(dto: GenerateDocumentDto): Promise<GeneratedDocument> {
    return this.client.post<GeneratedDocument>('/drafting/generate', dto);
  }

  public async getAllGeneratedDocuments(filters?: {
    status?: GeneratedDocumentStatus;
    caseId?: string;
  }): Promise<GeneratedDocument[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.caseId) params.append('caseId', filters.caseId);

    const query = params.toString();
    return this.client.get<GeneratedDocument[]>(`/drafting/documents${query ? `?${query}` : ''}`);
  }

  public async getGeneratedDocumentById(id: string): Promise<GeneratedDocument> {
    return this.client.get<GeneratedDocument>(`/drafting/documents/${id}`);
  }

  public async updateGeneratedDocument(id: string, dto: UpdateGeneratedDocumentDto): Promise<GeneratedDocument> {
    return this.client.put<GeneratedDocument>(`/drafting/documents/${id}`, dto);
  }

  public async submitForReview(id: string): Promise<GeneratedDocument> {
    return this.client.post<GeneratedDocument>(`/drafting/documents/${id}/submit`, {});
  }

  public async approveDocument(id: string, notes?: string): Promise<GeneratedDocument> {
    return this.client.post<GeneratedDocument>(`/drafting/documents/${id}/approve`, { notes });
  }

  public async rejectDocument(id: string, notes: string): Promise<GeneratedDocument> {
    return this.client.post<GeneratedDocument>(`/drafting/documents/${id}/reject`, { notes });
  }

  public async finalizeDocument(id: string): Promise<GeneratedDocument> {
    return this.client.post<GeneratedDocument>(`/drafting/documents/${id}/finalize`, {});
  }

  public async deleteGeneratedDocument(id: string): Promise<void> {
    return this.client.delete(`/drafting/documents/${id}`);
  }
}

export const draftingApi = DraftingApiService.getInstance();

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface VariableValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  processedValues: Record<string, unknown>;
}

export interface ClauseConflict {
  clauseId1: string;
  clauseId2: string;
  reason: string;
  severity: 'error' | 'warning';
}

export interface ClauseValidationResult {
  isValid: boolean;
  conflicts: ClauseConflict[];
}

// ============================================================================
// BUSINESS LOGIC VALIDATION SERVICE
// ============================================================================

export class DraftingValidationService {
  /**
   * Validate template before creation or update
   */
  static validateTemplate(dto: CreateTemplateDto | UpdateTemplateDto): TemplateValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Required field validation
    if ('name' in dto && (!dto.name || dto.name.trim().length === 0)) {
      errors.push({
        field: 'name',
        message: 'Template name is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if ('name' in dto && dto.name && dto.name.length < 3) {
      errors.push({
        field: 'name',
        message: 'Template name must be at least 3 characters',
        code: 'MIN_LENGTH',
      });
    }

    if ('name' in dto && dto.name && dto.name.length > 200) {
      errors.push({
        field: 'name',
        message: 'Template name must be at most 200 characters',
        code: 'MAX_LENGTH',
      });
    }

    if ('content' in dto && (!dto.content || dto.content.trim().length === 0)) {
      errors.push({
        field: 'content',
        message: 'Template content is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if ('category' in dto && !dto.category) {
      errors.push({
        field: 'category',
        message: 'Template category is required',
        code: 'REQUIRED_FIELD',
      });
    }

    // Validate variables
    if ('variables' in dto && dto.variables) {
      // Check for unique variable names
      const variableNames = dto.variables.map(v => v.name);
      const duplicates = variableNames.filter((name, index) => variableNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        errors.push({
          field: 'variables',
          message: `Duplicate variable names: ${duplicates.join(', ')}`,
          code: 'DUPLICATE_VARIABLE',
        });
      }

      // Validate each variable
      dto.variables.forEach((v, index) => {
        if (!v.name || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v.name)) {
          errors.push({
            field: `variables[${index}].name`,
            message: 'Variable name must start with letter/underscore and contain only alphanumeric characters',
            code: 'INVALID_VARIABLE_NAME',
          });
        }

        if (!v.label || v.label.trim().length === 0) {
          errors.push({
            field: `variables[${index}].label`,
            message: 'Variable label is required',
            code: 'REQUIRED_FIELD',
          });
        }

        if (v.type === 'select' || v.type === 'multi-select') {
          if (!v.options || v.options.length === 0) {
            errors.push({
              field: `variables[${index}].options`,
              message: 'Select variables must have at least one option',
              code: 'MISSING_OPTIONS',
            });
          }
        }

        if (v.validation) {
          if (v.validation.pattern) {
            try {
              new RegExp(v.validation.pattern);
            } catch {
              errors.push({
                field: `variables[${index}].validation.pattern`,
                message: 'Invalid regex pattern',
                code: 'INVALID_REGEX',
              });
            }
          }

          if (v.validation.minLength !== undefined && v.validation.minLength < 0) {
            errors.push({
              field: `variables[${index}].validation.minLength`,
              message: 'Min length cannot be negative',
              code: 'INVALID_VALUE',
            });
          }

          if (v.validation.maxLength !== undefined && v.validation.minLength !== undefined) {
            if (v.validation.maxLength < v.validation.minLength) {
              errors.push({
                field: `variables[${index}].validation`,
                message: 'Max length must be greater than min length',
                code: 'INVALID_RANGE',
              });
            }
          }

          if (v.validation.min !== undefined && v.validation.max !== undefined) {
            if (v.validation.max < v.validation.min) {
              errors.push({
                field: `variables[${index}].validation`,
                message: 'Max value must be greater than min value',
                code: 'INVALID_RANGE',
              });
            }
          }
        }
      });

      // Check if variables are referenced in content
      if ('content' in dto && dto.content) {
        const referencedVars = new Set<string>();
        const matches = dto.content.matchAll(/\{\{(\w+)\}\}/g);
        for (const match of matches) {
          referencedVars.add(match[1]);
        }

        dto.variables.forEach(v => {
          if (!referencedVars.has(v.name) && !v.name.startsWith('case.') && !v.name.startsWith('party.')) {
            warnings.push(`Variable "${v.name}" is defined but not used in template content`);
          }
        });

        // Check for undefined variables in content
        referencedVars.forEach(varName => {
          const isDefined = dto.variables?.some(v => v.name === varName) ||
                           varName.startsWith('case.') ||
                           varName.startsWith('party.');
          if (!isDefined) {
            warnings.push(`Variable "${varName}" is used in content but not defined`);
          }
        });
      }
    }

    // Validate clause references
    if ('clauseReferences' in dto && dto.clauseReferences) {
      const positions = dto.clauseReferences.map(c => c.position);
      const duplicatePositions = positions.filter((pos, index) => positions.indexOf(pos) !== index);
      if (duplicatePositions.length > 0) {
        errors.push({
          field: 'clauseReferences',
          message: `Duplicate clause positions: ${duplicatePositions.join(', ')}`,
          code: 'DUPLICATE_POSITION',
        });
      }

      dto.clauseReferences.forEach((ref, index) => {
        if (!ref.clauseId) {
          errors.push({
            field: `clauseReferences[${index}].clauseId`,
            message: 'Clause ID is required',
            code: 'REQUIRED_FIELD',
          });
        }
        if (ref.position === undefined || ref.position < 0) {
          errors.push({
            field: `clauseReferences[${index}].position`,
            message: 'Clause position must be a non-negative number',
            code: 'INVALID_VALUE',
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate variable values against template variable definitions
   */
  static validateVariables(
    template: DraftingTemplate,
    values: Record<string, unknown>
  ): VariableValidationResult {
    const errors: Record<string, string[]> = {};
    const processedValues: Record<string, unknown> = {};

    for (const variable of template.variables) {
      const value = values[variable.name];
      const fieldErrors: string[] = [];

      // Required validation
      if (variable.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${variable.label} is required`);
        errors[variable.name] = fieldErrors;
        continue;
      }

      // Skip further validation if not required and empty
      if (!variable.required && (value === undefined || value === null || value === '')) {
        processedValues[variable.name] = variable.defaultValue || '';
        continue;
      }

      // Type-specific validation and coercion
      switch (variable.type) {
        case 'text':
          if (typeof value !== 'string') {
            fieldErrors.push(`${variable.label} must be text`);
          } else {
            const strValue = value.trim();
            if (variable.validation?.minLength && strValue.length < variable.validation.minLength) {
              fieldErrors.push(`${variable.label} must be at least ${variable.validation.minLength} characters`);
            }
            if (variable.validation?.maxLength && strValue.length > variable.validation.maxLength) {
              fieldErrors.push(`${variable.label} must be at most ${variable.validation.maxLength} characters`);
            }
            if (variable.validation?.pattern) {
              const regex = new RegExp(variable.validation.pattern);
              if (!regex.test(strValue)) {
                fieldErrors.push(`${variable.label} format is invalid`);
              }
            }
            processedValues[variable.name] = strValue;
          }
          break;

        case 'date':
          const dateValue = typeof value === 'string' ? new Date(value) : value;
          if (!(dateValue instanceof Date) || isNaN(dateValue.getTime())) {
            fieldErrors.push(`${variable.label} must be a valid date`);
          } else {
            processedValues[variable.name] = dateValue.toISOString();
          }
          break;

        case 'number':
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (typeof numValue !== 'number' || isNaN(numValue)) {
            fieldErrors.push(`${variable.label} must be a number`);
          } else {
            if (variable.validation?.min !== undefined && numValue < variable.validation.min) {
              fieldErrors.push(`${variable.label} must be at least ${variable.validation.min}`);
            }
            if (variable.validation?.max !== undefined && numValue > variable.validation.max) {
              fieldErrors.push(`${variable.label} must be at most ${variable.validation.max}`);
            }
            processedValues[variable.name] = numValue;
          }
          break;

        case 'select':
          if (typeof value !== 'string' || !variable.options?.includes(value)) {
            fieldErrors.push(`${variable.label} must be one of: ${variable.options?.join(', ')}`);
          } else {
            processedValues[variable.name] = value;
          }
          break;

        case 'multi-select':
          if (!Array.isArray(value)) {
            fieldErrors.push(`${variable.label} must be an array`);
          } else {
            const invalidOptions = value.filter(v => !variable.options?.includes(v as string));
            if (invalidOptions.length > 0) {
              fieldErrors.push(`${variable.label} contains invalid options: ${invalidOptions.join(', ')}`);
            } else {
              processedValues[variable.name] = value;
            }
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            fieldErrors.push(`${variable.label} must be true or false`);
          } else {
            processedValues[variable.name] = value;
          }
          break;

        case 'case-data':
        case 'party':
        case 'attorney':
          // These are automatically populated from case data
          processedValues[variable.name] = value;
          break;

        default:
          processedValues[variable.name] = value;
      }

      if (fieldErrors.length > 0) {
        errors[variable.name] = fieldErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      processedValues,
    };
  }

  /**
   * Check for conflicts between selected clauses
   */
  static validateClauses(clauses: any[]): ClauseValidationResult {
    const conflicts: ClauseConflict[] = [];

    // Check for mutual exclusivity
    for (let i = 0; i < clauses.length; i++) {
      for (let j = i + 1; j < clauses.length; j++) {
        const clause1 = clauses[i];
        const clause2 = clauses[j];

        // Check if clauses have incompatible categories
        if (clause1.category === clause2.category && clause1.category !== 'general' && clause1.category !== 'boilerplate') {
          conflicts.push({
            clauseId1: clause1.id,
            clauseId2: clause2.id,
            reason: `Clauses "${clause1.title}" and "${clause2.title}" are both ${clause1.category} clauses and may conflict`,
            severity: 'warning',
          });
        }

        // Check for explicit conflicts in metadata
        if (clause1.metadata?.conflictsWith?.includes(clause2.id)) {
          conflicts.push({
            clauseId1: clause1.id,
            clauseId2: clause2.id,
            reason: `Clause "${clause1.title}" is incompatible with "${clause2.title}"`,
            severity: 'error',
          });
        }

        if (clause2.metadata?.conflictsWith?.includes(clause1.id)) {
          conflicts.push({
            clauseId1: clause1.id,
            clauseId2: clause2.id,
            reason: `Clause "${clause2.title}" is incompatible with "${clause1.title}"`,
            severity: 'error',
          });
        }

        // Check for tag-based conflicts
        if (clause1.tags && clause2.tags) {
          const clause1Tags = Array.isArray(clause1.tags) ? clause1.tags : [];
          const clause2Tags = Array.isArray(clause2.tags) ? clause2.tags : [];
          
          // Check mutual exclusivity
          const isMutuallyExclusive = clause1Tags.some((tag: string) => tag.startsWith('exclude:')) &&
                                     clause2Tags.some((tag: string) => {
                                       const excludeTag = clause1Tags.find((t: string) => t.startsWith('exclude:'));
                                       return excludeTag && tag === excludeTag.replace('exclude:', '');
                                     });

          if (isMutuallyExclusive) {
            conflicts.push({
              clauseId1: clause1.id,
              clauseId2: clause2.id,
              reason: `Clauses "${clause1.title}" and "${clause2.title}" are mutually exclusive`,
              severity: 'error',
            });
          }
        }
      }
    }

    return {
      isValid: conflicts.filter(c => c.severity === 'error').length === 0,
      conflicts,
    };
  }

  /**
   * Generate preview of document with variable interpolation
   */
  static generatePreview(
    template: DraftingTemplate,
    variableValues: Record<string, unknown>,
    clauseContent?: Record<string, string>
  ): string {
    let content = template.content;

    // Replace variable placeholders: {{variable_name}}
    content = content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = variableValues[varName];
      if (value !== undefined && value !== null) {
        return value.toString();
      }
      return match; // Keep placeholder if no value
    });

    // Replace case data placeholders: {{case.field}}
    content = content.replace(/\{\{case\.(\w+)\}\}/g, (match, field) => {
      const caseData = variableValues['case'] as Record<string, unknown> | undefined;
      if (caseData && caseData[field] !== undefined) {
        return caseData[field]?.toString() || match;
      }
      return match;
    });

    // Replace party placeholders: {{party.plaintiff}}, {{party.defendant}}
    content = content.replace(/\{\{party\.(\w+)\}\}/g, (match, role) => {
      const parties = variableValues['parties'] as Record<string, unknown> | undefined;
      if (parties && parties[role] !== undefined) {
        return parties[role]?.toString() || match;
      }
      return match;
    });

    // Insert clauses at designated positions: {{clause:position}}
    if (clauseContent) {
      content = content.replace(/\{\{clause:(\d+)\}\}/g, (match, position) => {
        const pos = parseInt(position);
        // Find clause by position from template.clauseReferences
        const clauseRef = template.clauseReferences?.find(ref => ref.position === pos);
        if (clauseRef && clauseContent[clauseRef.clauseId]) {
          return `\n\n${clauseContent[clauseRef.clauseId]}\n\n`;
        }
        return match;
      });
    }

    return content;
  }
}

