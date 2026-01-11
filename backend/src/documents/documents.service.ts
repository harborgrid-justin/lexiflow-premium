import { TransactionManagerService } from "@common/services/transaction-manager.service";
import {
  validateSortField,
  validateSortOrder,
} from "@common/utils/query-validation.util";
import { FileStorageService } from "@file-storage/file-storage.service";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository } from "typeorm";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { DocumentFilterDto } from "./dto/document-filter.dto";
import { Document } from "./entities/document.entity";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                              DOCUMENTS SERVICE - DOCUMENT MANAGEMENT & FILE STORAGE                                ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                                                                   ║
 * ║  Client Upload                      DocumentsController                   DocumentsService                        ║
 * ║       │                                   │                                     │                                 ║
 * ║       │  POST /documents (multipart)      │                                     │                                 ║
 * ║       │  GET /documents                   │                                     │                                 ║
 * ║       │  GET /documents/:id               │                                     │                                 ║
 * ║       │  PATCH /documents/:id             │                                     │                                 ║
 * ║       │  DELETE /documents/:id            │                                     │                                 ║
 * ║       └───────────────────────────────────┴─────────────────────────────────────▶                                 ║
 * ║                                                                                 │                                 ║
 * ║                                                                 ┌───────────────┴────────────────┐                ║
 * ║                                                                 │                                │                ║
 * ║                                                                 ▼                                ▼                ║
 * ║                                                          Document Repository         FileStorageService           ║
 * ║                                                                 │                                │                ║
 * ║                                                                 │                                │                ║
 * ║                                                                 ▼                                ▼                ║
 * ║                                                          PostgreSQL (docs)      Disk/S3 File Storage              ║
 * ║                                                                 │                                │                ║
 * ║                                                                 └────────────┬───────────────────┘                ║
 * ║                                                                              │                                    ║
 * ║                                                                              ▼                                    ║
 * ║                                                                    TransactionManager                             ║
 * ║                                                                   (Atomic DB + File Ops)                          ║
 * ║                                                                                                                   ║
 * ║  DATA IN:  CreateDocumentDto { title, description, type, caseId, file? }                                          ║
 * ║            UpdateDocumentDto { title?, tags?, metadata? }                                                         ║
 * ║            DocumentFilterDto { caseId?, type?, search?, page, limit }                                             ║
 * ║                                                                                                                   ║
 * ║  DATA OUT: Document { id, title, fileName, filePath, mimeType, size, currentVersion, ... }                        ║
 * ║            Buffer (file download)                                                                                 ║
 * ║                                                                                                                   ║
 * ║  OPERATIONS:                                                                                                      ║
 * ║    • create()          - Upload & store document with metadata                                                    ║
 * ║    • findAll()         - List documents with filters & pagination                                                 ║
 * ║    • findOne()         - Get document metadata by ID                                                              ║
 * ║    • update()          - Update document metadata                                                                 ║
 * ║    • remove()          - Delete document & file                                                                   ║
 * ║    • download()        - Stream document file                                                                     ║
 * ║    • uploadVersion()   - Create new document version                                                              ║
 * ║                                                                                                                   ║
 * ║  FEATURES: Transactional file+DB operations, version control, metadata extraction, search                         ║
 * ║                                                                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

@Injectable()
export class DocumentsService implements OnModuleDestroy {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly MAX_RESULTS = 1000;
  // private readonly STREAM_THRESHOLD = 10 * 1024 * 1024;

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private fileStorageService: FileStorageService,
    private transactionManager: TransactionManagerService
  ) {}

  /**
   * Create a new document with file upload
   */
  async create(
    createDocumentDto: CreateDocumentDto,
    file?: Express.Multer.File,
    userId?: string
  ): Promise<Document> {
    // Use transaction to ensure file storage and DB save are atomic
    return this.transactionManager.executeInTransaction(async (manager) => {
      try {
        const document = this.documentRepository.create({
          ...createDocumentDto,
          createdBy: userId,
          currentVersion: 1,
        });

        if (file) {
          // Store file first
          const fileResult = await this.fileStorageService.storeFile(
            file,
            createDocumentDto.caseId,
            document.id || "temp",
            1
          );

          document.filename = fileResult.filename;
          document.filePath = fileResult.path;
          document.mimeType = fileResult.mimetype;
          document.fileSize = fileResult.size;
          document.checksum = fileResult.checksum;
        }

        // Save within transaction
        const documentRepo = manager.getRepository(Document);
        const savedDocument = await documentRepo.save(document);
        this.logger.log(`Document created: ${savedDocument.id}`);

        return savedDocument;
      } catch (error) {
        this.logger.error("Failed to create document", error);
        // Transaction will auto-rollback on error
        // Cleanup uploaded file if DB save fails
        const fp = (document as { filePath?: string }).filePath;
        if (file && fp) {
          try {
            await this.fileStorageService.deleteFile(fp);
            this.logger.log(`Cleaned up uploaded file: ${fp}`);
          } catch (cleanupError) {
            this.logger.warn(
              "Failed to cleanup uploaded file during rollback",
              cleanupError
            );
          }
        }
        throw error;
      }
    });
  }

  onModuleDestroy(): void {
    this.logger.log("DocumentsService cleanup - releasing resources");
  }

  /**
   * Find all documents with filtering and pagination
   */
  async findAll(filterDto: DocumentFilterDto): Promise<{
    data: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      caseId,
      type,
      status,
      search,
      author,
      tag,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = filterDto;

    const safeLimit = Math.min(limit, this.MAX_RESULTS);
    if (limit > this.MAX_RESULTS) {
      this.logger.warn(
        `Limit ${limit} exceeds maximum ${this.MAX_RESULTS}, using ${this.MAX_RESULTS}`
      );
    }

    const query = this.documentRepository.createQueryBuilder("document");

    // Apply filters
    if (caseId) {
      query.andWhere("document.caseId = :caseId", { caseId });
    }

    if (type) {
      query.andWhere("document.type = :type", { type });
    }

    if (status) {
      query.andWhere("document.status = :status", { status });
    }

    if (search) {
      query.andWhere(
        "(document.title ILIKE :search OR document.description ILIKE :search OR document.fullTextContent ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (author) {
      query.andWhere("document.author ILIKE :author", {
        author: `%${author}%`,
      });
    }

    if (tag) {
      query.andWhere(":tag = ANY(document.tags)", { tag });
    }

    if (startDate && endDate) {
      query.andWhere("document.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere("document.createdAt >= :startDate", { startDate });
    } else if (endDate) {
      query.andWhere("document.createdAt <= :endDate", { endDate });
    }

    // Apply sorting - SQL injection protection
    const safeSortField = validateSortField("document", sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    query.orderBy(`document.${safeSortField}`, safeSortOrder);

    // Apply pagination with safe limit
    const skip = (page - 1) * safeLimit;
    query.skip(skip).take(safeLimit);

    // Execute query
    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  /**
   * Find a document by ID
   */
  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  /**
   * Update a document
   */
  async update(
    id: string,
    updateDocumentDto: Partial<Document>,
    userId?: string
  ): Promise<Document> {
    const updateData = {
      ...updateDocumentDto,
      ...(userId ? { updatedBy: userId } : {}),
      updatedAt: new Date(),
    };

    const result = await this.documentRepository
      .createQueryBuilder()
      .update(Document)
      .set(updateData as any)
      .where("id = :id", { id })
      .returning("*")
      .execute();

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    this.logger.log(`Document updated: ${id}`);
    const rows = result.raw as Document[];
    return rows[0];
  }

  /**
   * Delete a document
   */
  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);

    // Delete associated file
    if (document.filePath) {
      try {
        await this.fileStorageService.deleteFile(document.filePath);
      } catch (error) {
        this.logger.warn(`Failed to delete file for document ${id}`, error);
      }
    }

    await this.documentRepository.remove(document);
    this.logger.log(`Document deleted: ${id}`);
  }

  /**
   * Download a document file
   */
  async downloadFile(id: string): Promise<{
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }> {
    const document = await this.findOne(id);

    if (!document.filePath) {
      throw new BadRequestException("Document has no associated file");
    }

    const buffer = await this.fileStorageService.getFile(document.filePath);

    return {
      buffer,
      filename: document.filename,
      mimeType: document.mimeType,
    };
  }

  /**
   * Mark document as OCR processed
   */
  async markOcrProcessed(
    id: string,
    fullTextContent: string
  ): Promise<Document> {
    const document = await this.findOne(id);

    document.ocrProcessed = true;
    document.ocrProcessedAt = new Date();
    document.fullTextContent = fullTextContent;

    return await this.documentRepository.save(document);
  }

  /**
   * Get documents by case ID
   */
  async findByCaseId(caseId: string): Promise<Document[]> {
    return await this.documentRepository.find({
      where: { caseId },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Search documents by full-text content
   */
  async searchFullText(searchTerm: string): Promise<Document[]> {
    return await this.documentRepository.find({
      where: {
        fullTextContent: Like(`%${searchTerm}%`),
      },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Get document folder structure
   */
  async getFolders(): Promise<
    Array<{ id: string; label: string; count?: number }>
  > {
    // Get document counts by type/category
    const typeCounts = (await this.documentRepository
      .createQueryBuilder("document")
      .select("document.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("document.type")
      .getRawMany()) as Array<{ type: string; count: string }>;

    const folders = [
      {
        id: "root",
        label: "All Documents",
        count: await this.documentRepository.count(),
      },
      {
        id: "case_docs",
        label: "Case Files",
        count: typeCounts.find((t) => t.type === "case_file")?.count || 0,
      },
      {
        id: "discovery",
        label: "Discovery Productions",
        count: typeCounts.find((t) => t.type === "discovery")?.count || 0,
      },
      {
        id: "pleadings",
        label: "Pleadings",
        count: typeCounts.find((t) => t.type === "pleading")?.count || 0,
      },
      {
        id: "correspondence",
        label: "Correspondence",
        count: typeCounts.find((t) => t.type === "correspondence")?.count || 0,
      },
      {
        id: "templates_folder",
        label: "Templates",
        count: typeCounts.find((t) => t.type === "template")?.count || 0,
      },
    ];

    return folders;
  }

  /**
   * Get document text content
   */
  async getContent(id: string): Promise<{ content: string }> {
    const document = await this.findOne(id);

    // Return OCR processed content if available
    if (document.fullTextContent) {
      return { content: document.fullTextContent };
    }

    // Otherwise return empty string (file-based documents need to be downloaded)
    return { content: "" };
  }
}
