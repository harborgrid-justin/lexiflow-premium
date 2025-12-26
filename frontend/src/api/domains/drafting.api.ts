import { ApiClient } from '../../services/infrastructure/apiClient';
import { LegalDocument } from '../../types/models';

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

