import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentFilterDto } from './dto/document-filter.dto';
import { FileStorageService } from '../file-storage/file-storage.service';
import { MetadataExtractionService } from './services/metadata-extraction.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private fileStorageService: FileStorageService,
    private metadataExtractionService: MetadataExtractionService,
  ) {}

  /**
   * Create a new document with file upload
   */
  async create(
    createDocumentDto: CreateDocumentDto,
    file?: Express.Multer.File,
    userId?: string,
  ): Promise<Document> {
    try {
      const document = this.documentRepository.create({
        ...createDocumentDto,
        createdBy: userId,
        currentVersion: 1,
      });

      if (file) {
        // Store file
        const fileResult = await this.fileStorageService.storeFile(
          file,
          createDocumentDto.caseId,
          document.id || 'temp',
          1,
        );

        document.filename = fileResult.filename;
        document.filePath = fileResult.path;
        document.mimeType = fileResult.mimetype;
        document.fileSize = fileResult.size;
        document.checksum = fileResult.checksum;

        // Extract metadata
        try {
          const metadata = await this.metadataExtractionService.extractMetadata(
            file.buffer,
            file.mimetype,
          );

          // Update document with extracted metadata
          if (metadata.pageCount) document.pageCount = metadata.pageCount;
          if (metadata.wordCount) document.wordCount = metadata.wordCount;
          if (metadata.language) document.language = metadata.language;
          if (metadata.author && !document.author) document.author = metadata.author;

          // Extract full text content for search
          const textContent = await this.metadataExtractionService.extractTextContent(
            file.buffer,
            file.mimetype,
          );
          if (textContent) {
            document.fullTextContent = textContent;
          }

          this.logger.log('Document metadata extracted successfully');
        } catch (error) {
          this.logger.warn('Failed to extract metadata, continuing without it', error);
        }
      }

      const savedDocument = await this.documentRepository.save(document);
      this.logger.log(`Document created: ${savedDocument.id}`);

      return savedDocument;
    } catch (error) {
      this.logger.error('Failed to create document', error);
      throw error;
    }
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
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const query = this.documentRepository.createQueryBuilder('document');

    // Apply filters
    if (caseId) {
      query.andWhere('document.caseId = :caseId', { caseId });
    }

    if (type) {
      query.andWhere('document.type = :type', { type });
    }

    if (status) {
      query.andWhere('document.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(document.title ILIKE :search OR document.description ILIKE :search OR document.fullTextContent ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (author) {
      query.andWhere('document.author ILIKE :author', { author: `%${author}%` });
    }

    if (tag) {
      query.andWhere(':tag = ANY(document.tags)', { tag });
    }

    if (startDate && endDate) {
      query.andWhere('document.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('document.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('document.createdAt <= :endDate', { endDate });
    }

    // Apply sorting
    query.orderBy(`document.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Execute query
    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
    updateDocumentDto: UpdateDocumentDto,
    userId?: string,
  ): Promise<Document> {
    const document = await this.findOne(id);

    Object.assign(document, updateDocumentDto);
    document.updatedBy = userId;

    const updatedDocument = await this.documentRepository.save(document);
    this.logger.log(`Document updated: ${id}`);

    return updatedDocument;
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
      throw new BadRequestException('Document has no associated file');
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
  async markOcrProcessed(id: string, fullTextContent: string): Promise<Document> {
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
      order: { createdAt: 'DESC' },
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
      order: { createdAt: 'DESC' },
    });
  }
}
