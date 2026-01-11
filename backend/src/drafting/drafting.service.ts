import { Clause } from "@clauses/entities/clause.entity";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { GenerateDocumentDto } from "./dto/generate-document.dto";
import { UpdateGeneratedDocumentDto } from "./dto/update-generated-document.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";
import {
  GeneratedDocument,
  GeneratedDocumentStatus,
} from "./entities/generated-document.entity";
import { DraftingTemplate, TemplateStatus } from "./entities/template.entity";

/**
 * ╔=================================================================================================================╗
 * ║DRAFTING                                                                                                         ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class DraftingService {
  constructor(
    @InjectRepository(DraftingTemplate)
    private readonly templateRepository: Repository<DraftingTemplate>,
    @InjectRepository(GeneratedDocument)
    private readonly generatedDocRepository: Repository<GeneratedDocument>,
    @InjectRepository(Clause)
    private readonly clauseRepository: Repository<Clause>
  ) {}

  // ============================================================================
  // DASHBOARD METHODS
  // ============================================================================

  async getRecentDrafts(
    userId: string,
    limit: number = 5
  ): Promise<GeneratedDocument[]> {
    return this.generatedDocRepository.find({
      where: {
        createdBy: userId,
        status: GeneratedDocumentStatus.DRAFT,
      },
      order: {
        updatedAt: "DESC",
      },
      take: limit,
      relations: ["case", "template", "creator"],
    });
  }

  async getTemplates(limit: number = 10): Promise<DraftingTemplate[]> {
    return this.templateRepository.find({
      where: {
        status: TemplateStatus.ACTIVE,
      },
      order: {
        usageCount: "DESC",
        name: "ASC",
      },
      take: limit,
      relations: ["creator"],
    });
  }

  async getPendingApprovals(_userId: string): Promise<GeneratedDocument[]> {
    // Get documents where user is assigned as reviewer or is a senior attorney
    return this.generatedDocRepository.find({
      where: {
        status: GeneratedDocumentStatus.IN_REVIEW,
      },
      order: {
        updatedAt: "DESC",
      },
      relations: ["creator", "template", "case"],
    });
  }

  async getStats(userId: string) {
    const [draftsCount, templatesCount, pendingCount, myTemplatesCount] =
      await Promise.all([
        this.generatedDocRepository.count({
          where: { createdBy: userId, status: GeneratedDocumentStatus.DRAFT },
        }),
        this.templateRepository.count({
          where: { status: TemplateStatus.ACTIVE },
        }),
        this.generatedDocRepository.count({
          where: { status: GeneratedDocumentStatus.IN_REVIEW },
        }),
        this.templateRepository.count({
          where: { createdBy: userId },
        }),
      ]);

    return {
      drafts: draftsCount,
      templates: templatesCount,
      pendingReviews: pendingCount,
      myTemplates: myTemplatesCount,
    };
  }

  // ============================================================================
  // TEMPLATE CRUD METHODS
  // ============================================================================

  async createTemplate(
    dto: CreateTemplateDto,
    userId: string
  ): Promise<DraftingTemplate> {
    const template = this.templateRepository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    } as unknown as DraftingTemplate);

    return this.templateRepository.save(template) as Promise<DraftingTemplate>;
  }

  async getAllTemplates(
    category?: string,
    jurisdiction?: string,
    practiceArea?: string,
    search?: string
  ): Promise<DraftingTemplate[]> {
    const queryBuilder = this.templateRepository
      .createQueryBuilder("template")
      .where("template.status = :status", { status: TemplateStatus.ACTIVE })
      .leftJoinAndSelect("template.creator", "creator")
      .orderBy("template.usageCount", "DESC")
      .addOrderBy("template.name", "ASC");

    if (category) {
      queryBuilder.andWhere("template.category = :category", { category });
    }

    if (jurisdiction) {
      queryBuilder.andWhere("template.jurisdiction = :jurisdiction", {
        jurisdiction,
      });
    }

    if (practiceArea) {
      queryBuilder.andWhere("template.practiceArea = :practiceArea", {
        practiceArea,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        "(template.name ILIKE :search OR template.description ILIKE :search OR :search = ANY(template.tags))",
        { search: `%${search}%` }
      );
    }

    return queryBuilder.getMany();
  }

  async getTemplateById(id: string): Promise<DraftingTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id },
      relations: ["creator"],
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async updateTemplate(
    id: string,
    dto: UpdateTemplateDto,
    userId: string
  ): Promise<DraftingTemplate> {
    const template = await this.getTemplateById(id);

    Object.assign(template, dto);
    template.updatedBy = userId;

    return this.templateRepository.save(template);
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.getTemplateById(id);
    await this.templateRepository.remove(template);
  }

  async archiveTemplate(id: string, userId: string): Promise<DraftingTemplate> {
    const template = await this.getTemplateById(id);
    template.status = TemplateStatus.ARCHIVED;
    template.updatedBy = userId;
    return this.templateRepository.save(template);
  }

  async duplicateTemplate(
    id: string,
    userId: string
  ): Promise<DraftingTemplate> {
    const original = await this.getTemplateById(id);

    const duplicate = this.templateRepository.create({
      ...original,
      id: undefined,
      name: `${original.name} (Copy)`,
      createdBy: userId,
      updatedBy: userId,
      parentTemplateId: original.id,
      usageCount: 0,
      lastUsedAt: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return this.templateRepository.save(duplicate);
  }

  // ============================================================================
  // DOCUMENT GENERATION METHODS
  // ============================================================================

  async generateDocument(
    dto: GenerateDocumentDto,
    userId: string
  ): Promise<GeneratedDocument> {
    const template = await this.getTemplateById(dto.templateId);

    // Merge content with variables
    const mergedContent = await this.mergeTemplateContent(
      template.content,
      dto.variableValues,
      dto.includedClauses
    );

    // Calculate word count
    const wordCount = mergedContent
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    const generatedDoc = this.generatedDocRepository.create({
      ...dto,
      content: mergedContent,
      wordCount,
      createdBy: userId,
      status: GeneratedDocumentStatus.DRAFT,
    });

    const saved = await this.generatedDocRepository.save(generatedDoc);

    // Update template usage
    template.usageCount += 1;
    template.lastUsedAt = new Date();
    await this.templateRepository.save(template);

    return this.getGeneratedDocumentById(saved.id);
  }

  async getAllGeneratedDocuments(
    _userId: string,
    status?: GeneratedDocumentStatus,
    caseId?: string
  ): Promise<GeneratedDocument[]> {
    const queryBuilder = this.generatedDocRepository
      .createQueryBuilder("doc")
      .leftJoinAndSelect("doc.template", "template")
      .leftJoinAndSelect("doc.case", "case")
      .leftJoinAndSelect("doc.creator", "creator")
      .leftJoinAndSelect("doc.reviewer", "reviewer")
      .orderBy("doc.updatedAt", "DESC");

    if (status) {
      queryBuilder.andWhere("doc.status = :status", { status });
    }

    if (caseId) {
      queryBuilder.andWhere("doc.caseId = :caseId", { caseId });
    }

    return queryBuilder.getMany();
  }

  async getGeneratedDocumentById(id: string): Promise<GeneratedDocument> {
    const doc = await this.generatedDocRepository.findOne({
      where: { id },
      relations: ["template", "case", "creator", "reviewer"],
    });

    if (!doc) {
      throw new NotFoundException(`Generated document with ID ${id} not found`);
    }

    return doc;
  }

  async updateGeneratedDocument(
    id: string,
    dto: UpdateGeneratedDocumentDto,
    _userId: string
  ): Promise<GeneratedDocument> {
    const doc = await this.getGeneratedDocumentById(id);

    Object.assign(doc, dto);

    // Recalculate word count if content changed
    if (dto.content) {
      doc.wordCount = dto.content
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
    }

    return this.generatedDocRepository.save(doc);
  }

  async submitForReview(
    id: string,
    _userId: string
  ): Promise<GeneratedDocument> {
    const doc = await this.getGeneratedDocumentById(id);

    if (doc.status !== GeneratedDocumentStatus.DRAFT) {
      throw new BadRequestException(
        "Only draft documents can be submitted for review"
      );
    }

    doc.status = GeneratedDocumentStatus.IN_REVIEW;
    return this.generatedDocRepository.save(doc);
  }

  async approveDocument(
    id: string,
    userId: string,
    notes?: string
  ): Promise<GeneratedDocument> {
    const doc = await this.getGeneratedDocumentById(id);

    if (doc.status !== GeneratedDocumentStatus.IN_REVIEW) {
      throw new BadRequestException(
        "Only documents under review can be approved"
      );
    }

    doc.status = GeneratedDocumentStatus.APPROVED;
    doc.reviewerId = userId;
    doc.approvedAt = new Date();
    doc.reviewNotes = notes || "";

    return this.generatedDocRepository.save(doc);
  }

  async rejectDocument(
    id: string,
    userId: string,
    notes: string
  ): Promise<GeneratedDocument> {
    const doc = await this.getGeneratedDocumentById(id);

    if (doc.status !== GeneratedDocumentStatus.IN_REVIEW) {
      throw new BadRequestException(
        "Only documents under review can be rejected"
      );
    }

    doc.status = GeneratedDocumentStatus.REJECTED;
    doc.reviewerId = userId;
    doc.approvedAt = new Date();
    doc.reviewNotes = notes;

    return this.generatedDocRepository.save(doc);
  }

  async finalizeDocument(
    id: string,
    _userId: string
  ): Promise<GeneratedDocument> {
    const doc = await this.getGeneratedDocumentById(id);

    if (doc.status !== GeneratedDocumentStatus.APPROVED) {
      throw new BadRequestException("Only approved documents can be finalized");
    }

    doc.status = GeneratedDocumentStatus.FINALIZED;
    return this.generatedDocRepository.save(doc);
  }

  async deleteGeneratedDocument(id: string): Promise<void> {
    const doc = await this.getGeneratedDocumentById(id);
    await this.generatedDocRepository.remove(doc);
  }

  async generatePreview(
    dto: GenerateDocumentDto,
    _userId: string
  ): Promise<{ content: string }> {
    const template = await this.getTemplateById(dto.templateId);

    // Merge content with variables (same logic as generateDocument but don't save)
    const mergedContent = await this.mergeTemplateContent(
      template.content,
      dto.variableValues,
      dto.includedClauses
    );

    return { content: mergedContent };
  }

  // ============================================================================
  // MERGE ENGINE
  // ============================================================================

  private async mergeTemplateContent(
    template: string,
    variables: Record<string, unknown>,
    clauseIds?: string[]
  ): Promise<string> {
    let content = template;

    // Replace variable placeholders: {{variable_name}}
    content = content.replace(/\{\{(\w+)\}\}/g, (match, varName: string) => {
      const value = variables[varName];
      return value !== null && value !== undefined ? String(value) : match;
    });

    // Insert clauses at designated positions: {{clause:position}}
    if (clauseIds && clauseIds.length > 0) {
      const clauses = await this.clauseRepository.findByIds(clauseIds);
      const clauseMap = new Map(clauses.map((c) => [c.id, c]));

      // Sort by position if available in clause references
      content = content.replace(/\{\{clause:(\d+)\}\}/g, (match, position) => {
        const pos = parseInt(position);
        const clauseId = clauseIds[pos];
        const clause = clauseId ? clauseMap.get(clauseId) : undefined;
        return clause ? `\n\n${clause.content}\n\n` : match;
      });
    }

    // Replace case data placeholders: {{case.field}}
    content = content.replace(/\{\{case.(\w+)\}\}/g, (match, field: string) => {
      const caseData = variables["case"];
      if (
        caseData &&
        typeof caseData === "object" &&
        !Array.isArray(caseData)
      ) {
        const value = (caseData as Record<string, unknown>)[field];
        return value !== null && value !== undefined ? String(value) : match;
      }
      return match;
    });

    // Replace party placeholders: {{party.plaintiff}}, {{party.defendant}}
    content = content.replace(/\{\{party.(\w+)\}\}/g, (match, role: string) => {
      const parties = variables["parties"];
      if (parties && typeof parties === "object" && !Array.isArray(parties)) {
        const value = (parties as Record<string, unknown>)[role];
        return value !== null && value !== undefined ? String(value) : match;
      }
      return match;
    });

    return content;
  }
}
