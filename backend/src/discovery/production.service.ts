import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscoveryProject } from './entities/discovery-project.entity';
import { ReviewDocument, ResponsivenessCode, PrivilegeCode } from './entities/review-document.entity';
import { Production, ProductionStatus, ProductionFormat } from './productions/entities/production.entity';
import { BatesNumberingService } from './bates-numbering.service';

export interface ProductionSetCriteria {
  includeResponsive: boolean;
  excludePrivileged: boolean;
  excludeDuplicates: boolean;
  dateRange?: { start: Date; end: Date };
  custodians?: string[];
  issueTags?: string[];
  confidentialityLevels?: string[];
}

export interface ProductionPackage {
  productionId: string;
  documents: ReviewDocument[];
  nativeFiles: string[];
  loadFile: string;
  privilegeLog?: string;
  productionReport: string;
}

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);

  constructor(
    @InjectRepository(DiscoveryProject)
    private readonly projectRepository: Repository<DiscoveryProject>,
    @InjectRepository(ReviewDocument)
    private readonly documentRepository: Repository<ReviewDocument>,
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
    private readonly batesNumberingService: BatesNumberingService,
  ) {}

  /**
   * Create a production set
   */
  async createProductionSet(
    projectId: string,
    productionName: string,
    criteria: ProductionSetCriteria,
    format: ProductionFormat,
    userId: string,
  ): Promise<Production> {
    this.logger.log(`Creating production set for project ${projectId}`);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Discovery project ${projectId} not found`);
    }

    // Get documents matching criteria
    const documents = await this.getDocumentsByCriteria(projectId, criteria);

    // Create production record
    const production = this.productionRepository.create({
      caseId: projectId,
      productionName,
      status: ProductionStatus.PLANNED,
      format,
      totalDocuments: documents.length,
      totalPages: documents.reduce((sum, doc) => sum + (doc.pageCount || 0), 0),
      totalSize: documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0),
      includePrivilegeLog: criteria.excludePrivileged,
      searchCriteria: criteria as any,
      createdBy: userId,
    });

    const saved = await this.productionRepository.save(production);

    // Update project
    await this.projectRepository.update(projectId, {
      totalItemsProduced: (project.totalItemsProduced || 0) + documents.length,
      updatedBy: userId,
    });

    return saved;
  }

  /**
   * Prepare production package
   */
  async prepareProductionPackage(
    productionId: string,
    userId: string,
  ): Promise<ProductionPackage> {
    this.logger.log(`Preparing production package ${productionId}`);

    const production = await this.productionRepository.findOne({
      where: { id: productionId },
    });

    if (!production) {
      throw new NotFoundException(`Production ${productionId} not found`);
    }

    // Get documents for production
    const criteria = production.searchCriteria as ProductionSetCriteria;
    const documents = await this.getDocumentsByCriteria(production.caseId, criteria);

    // Apply Bates numbering if not already done
    if (!production.batesPrefix) {
      const batesOptions = {
        prefix: 'PROD',
        startNumber: 1,
        numberLength: 7,
        includePageNumbers: true,
      };

      await this.batesNumberingService.applyBatesNumbering(
        production.caseId,
        documents.map((doc) => doc.id),
        batesOptions,
        productionId,
        userId,
      );
    }

    // In a real implementation, this would:
    // 1. Generate load files (DAT, OPT, etc.)
    // 2. Prepare native files or PDFs based on format
    // 3. Generate privilege log if needed
    // 4. Create production report
    // 5. Package everything into volumes

    const productionPackage: ProductionPackage = {
      productionId,
      documents,
      nativeFiles: documents.map((doc) => doc.nativeFilePath || ''),
      loadFile: '/path/to/loadfile.dat',
      privilegeLog: production.includePrivilegeLog ? '/path/to/privilege_log.pdf' : undefined,
      productionReport: '/path/to/production_report.pdf',
    };

    // Update production status
    production.status = ProductionStatus.READY;
    production.updatedBy = userId;
    await this.productionRepository.save(production);

    return productionPackage;
  }

  /**
   * Finalize and deliver production
   */
  async finalizeProduction(
    productionId: string,
    deliveryMethod: string,
    trackingNumber?: string,
    userId?: string,
  ): Promise<Production> {
    this.logger.log(`Finalizing production ${productionId}`);

    const production = await this.productionRepository.findOne({
      where: { id: productionId },
    });

    if (!production) {
      throw new NotFoundException(`Production ${productionId} not found`);
    }

    production.status = ProductionStatus.PRODUCED;
    production.productionDate = new Date();
    production.deliveryMethod = deliveryMethod;
    production.trackingNumber = trackingNumber;
    production.updatedBy = userId;

    return this.productionRepository.save(production);
  }

  /**
   * Get production statistics
   */
  async getProductionStatistics(productionId: string): Promise<{
    production: Production;
    documentBreakdown: {
      totalDocuments: number;
      totalPages: number;
      totalSize: number;
      fileTypeBreakdown: Record<string, number>;
      custodianBreakdown: Record<string, number>;
    };
    batesRange: { start: string; end: string } | null;
    qualityMetrics: {
      documentsWithBates: number;
      documentsWithText: number;
      documentsWithNative: number;
    };
  }> {
    const production = await this.productionRepository.findOne({
      where: { id: productionId },
    });

    if (!production) {
      throw new NotFoundException(`Production ${productionId} not found`);
    }

    // Get documents for production
    const criteria = production.searchCriteria as ProductionSetCriteria;
    const documents = await this.getDocumentsByCriteria(production.caseId, criteria);

    // File type breakdown
    const fileTypeBreakdown: Record<string, number> = {};
    documents.forEach((doc) => {
      const fileType = doc.fileType || 'Unknown';
      fileTypeBreakdown[fileType] = (fileTypeBreakdown[fileType] || 0) + 1;
    });

    // Custodian breakdown
    const custodianBreakdown: Record<string, number> = {};
    documents.forEach((doc) => {
      const custodian = doc.custodian || 'Unknown';
      custodianBreakdown[custodian] = (custodianBreakdown[custodian] || 0) + 1;
    });

    // Bates range
    const batesRange = production.batesStart && production.batesEnd
      ? {
          start: `${production.batesPrefix}${production.batesStart}`,
          end: `${production.batesPrefix}${production.batesEnd}`,
        }
      : null;

    // Quality metrics
    const documentsWithBates = documents.filter((doc) => doc.batesNumber).length;
    const documentsWithText = documents.filter((doc) => doc.extractedText).length;
    const documentsWithNative = documents.filter((doc) => doc.nativeFilePath).length;

    return {
      production,
      documentBreakdown: {
        totalDocuments: documents.length,
        totalPages: documents.reduce((sum, doc) => sum + (doc.pageCount || 0), 0),
        totalSize: documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0),
        fileTypeBreakdown,
        custodianBreakdown,
      },
      batesRange,
      qualityMetrics: {
        documentsWithBates,
        documentsWithText,
        documentsWithNative,
      },
    };
  }

  // Helper methods

  private async getDocumentsByCriteria(
    projectId: string,
    criteria: ProductionSetCriteria,
  ): Promise<ReviewDocument[]> {
    const queryBuilder = this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.projectId = :projectId', { projectId });

    // Include responsive documents
    if (criteria.includeResponsive) {
      queryBuilder.andWhere('doc.responsivenessCode IN (:...responsiveCodes)', {
        responsiveCodes: [ResponsivenessCode.RESPONSIVE, ResponsivenessCode.PARTIALLY_RESPONSIVE],
      });
    }

    // Exclude privileged documents
    if (criteria.excludePrivileged) {
      queryBuilder.andWhere('doc.privilegeCode = :privilegeCode', {
        privilegeCode: PrivilegeCode.NONE,
      });
    }

    // Exclude duplicates
    if (criteria.excludeDuplicates) {
      queryBuilder.andWhere('doc.isDuplicate = :isDuplicate', {
        isDuplicate: false,
      });
    }

    // Date range filter
    if (criteria.dateRange) {
      queryBuilder.andWhere('doc.documentDate BETWEEN :startDate AND :endDate', {
        startDate: criteria.dateRange.start,
        endDate: criteria.dateRange.end,
      });
    }

    // Custodian filter
    if (criteria.custodians && criteria.custodians.length > 0) {
      queryBuilder.andWhere('doc.custodian IN (:...custodians)', {
        custodians: criteria.custodians,
      });
    }

    // Confidentiality level filter
    if (criteria.confidentialityLevels && criteria.confidentialityLevels.length > 0) {
      queryBuilder.andWhere('doc.confidentialityLevel IN (:...levels)', {
        levels: criteria.confidentialityLevels,
      });
    }

    queryBuilder.orderBy('doc.documentDate', 'ASC').addOrderBy('doc.createdAt', 'ASC');

    return queryBuilder.getMany();
  }
}
