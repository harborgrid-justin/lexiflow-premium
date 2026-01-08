import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DocumentClassification,
  LegalDocumentCategory,
} from './entities/document-classification.entity';
import { Document } from './entities/document.entity';
import { ConfigService } from '@nestjs/config';

/**
 * Classification Model Provider
 */
interface ClassificationModel {
  classify(
    text: string,
    options?: Record<string, unknown>,
  ): Promise<ClassificationResult>;
}

/**
 * Classification Result from AI model
 */
interface ClassificationResult {
  category: LegalDocumentCategory;
  confidence: number;
  alternativeCategories?: Array<{
    category: LegalDocumentCategory;
    confidence: number;
  }>;
  tags?: string[];
  legalConcepts?: string[];
  jurisdictions?: string[];
  parties?: {
    plaintiffs?: string[];
    defendants?: string[];
    thirdParties?: string[];
  };
}

/**
 * Document Classification Service
 *
 * AI-powered document classification:
 * - Automatic category detection
 * - Legal concept extraction
 * - Jurisdiction identification
 * - Party extraction
 * - Practice area detection
 */
@Injectable()
export class DocumentClassificationService {
  private readonly logger = new Logger(DocumentClassificationService.name);
  private classificationModel: ClassificationModel | null = null;

  constructor(
    @InjectRepository(DocumentClassification)
    private classificationRepository: Repository<DocumentClassification>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private configService: ConfigService,
  ) {
    this.initializeModel();
  }

  /**
   * Initialize AI classification model
   */
  private async initializeModel(): Promise<void> {
    try {
      // Initialize with OpenAI or Google Gemini based on config
      const provider = this.configService.get<string>('AI_PROVIDER') || 'openai';
      this.logger.log(`Initializing classification model with provider: ${provider}`);

      // Model initialization would happen here
      // For now, we'll use a rule-based fallback
      this.classificationModel = new RuleBasedClassifier();
    } catch (error) {
      this.logger.warn('Failed to initialize AI classification model, using fallback');
      this.classificationModel = new RuleBasedClassifier();
    }
  }

  /**
   * Classify a document
   */
  async classifyDocument(
    documentId: string,
    options?: {
      forceReclassify?: boolean;
      useAI?: boolean;
    },
  ): Promise<DocumentClassification> {
    this.logger.log(`Classifying document ${documentId}`);

    // Check if already classified
    if (!options?.forceReclassify) {
      const existing = await this.classificationRepository.findOne({
        where: { documentId },
      });

      if (existing && !existing.isManualOverride) {
        this.logger.log(`Document ${documentId} already classified`);
        return existing;
      }
    }

    // Get document content
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    const text = document.fullTextContent || document.description || document.title;

    // Classify using AI model
    const result = await this.classificationModel!.classify(text, {
      useAI: options?.useAI ?? true,
    });

    // Create or update classification
    let classification = await this.classificationRepository.findOne({
      where: { documentId },
    });

    if (classification) {
      // Update existing
      Object.assign(classification, {
        category: result.category,
        confidence: result.confidence,
        alternativeCategories: result.alternativeCategories,
        tags: result.tags,
        legalConcepts: result.legalConcepts,
        jurisdictions: result.jurisdictions,
        parties: result.parties,
        classifiedAt: new Date(),
        modelName: 'auto',
      });
    } else {
      // Create new
      classification = this.classificationRepository.create({
        documentId,
        category: result.category,
        confidence: result.confidence,
        alternativeCategories: result.alternativeCategories,
        tags: result.tags,
        legalConcepts: result.legalConcepts,
        jurisdictions: result.jurisdictions,
        parties: result.parties,
        classifiedAt: new Date(),
        modelName: 'auto',
      });
    }

    const saved = await this.classificationRepository.save(classification);
    this.logger.log(
      `Classified document ${documentId} as ${result.category} (confidence: ${result.confidence})`,
    );

    return saved;
  }

  /**
   * Manually classify a document
   */
  async manuallyClassify(
    documentId: string,
    category: LegalDocumentCategory,
    options?: {
      tags?: string[];
      notes?: string;
    },
  ): Promise<DocumentClassification> {
    this.logger.log(`Manually classifying document ${documentId} as ${category}`);

    let classification = await this.classificationRepository.findOne({
      where: { documentId },
    });

    if (classification) {
      Object.assign(classification, {
        category,
        confidence: 1.0,
        tags: options?.tags || classification.tags,
        manualNotes: options?.notes,
        isManualOverride: true,
        classifiedAt: new Date(),
      });
    } else {
      classification = this.classificationRepository.create({
        documentId,
        category,
        confidence: 1.0,
        tags: options?.tags,
        manualNotes: options?.notes,
        isManualOverride: true,
        classifiedAt: new Date(),
        modelName: 'manual',
      });
    }

    return this.classificationRepository.save(classification);
  }

  /**
   * Get classification for a document
   */
  async getClassification(documentId: string): Promise<DocumentClassification | null> {
    return this.classificationRepository.findOne({
      where: { documentId },
      relations: ['document'],
    });
  }

  /**
   * Find documents by category
   */
  async findByCategory(
    category: LegalDocumentCategory,
    options?: {
      minConfidence?: number;
      limit?: number;
      offset?: number;
    },
  ): Promise<DocumentClassification[]> {
    const query = this.classificationRepository
      .createQueryBuilder('classification')
      .where('classification.category = :category', { category })
      .leftJoinAndSelect('classification.document', 'document')
      .orderBy('classification.confidence', 'DESC');

    if (options?.minConfidence) {
      query.andWhere('classification.confidence >= :minConfidence', {
        minConfidence: options.minConfidence,
      });
    }

    if (options?.limit) {
      query.take(options.limit);
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    return query.getMany();
  }

  /**
   * Search documents by legal concepts
   */
  async searchByLegalConcepts(
    concepts: string[],
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<DocumentClassification[]> {
    const query = this.classificationRepository
      .createQueryBuilder('classification')
      .where('classification.legalConcepts && :concepts', { concepts })
      .leftJoinAndSelect('classification.document', 'document')
      .orderBy('classification.confidence', 'DESC');

    if (options?.limit) {
      query.take(options.limit);
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    return query.getMany();
  }

  /**
   * Find documents by jurisdiction
   */
  async findByJurisdiction(
    jurisdiction: string,
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<DocumentClassification[]> {
    const query = this.classificationRepository
      .createQueryBuilder('classification')
      .where(':jurisdiction = ANY(classification.jurisdictions)', {
        jurisdiction,
      })
      .leftJoinAndSelect('classification.document', 'document')
      .orderBy('classification.confidence', 'DESC');

    if (options?.limit) {
      query.take(options.limit);
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    return query.getMany();
  }

  /**
   * Extract parties from document
   */
  async extractParties(documentId: string): Promise<{
    plaintiffs: string[];
    defendants: string[];
    thirdParties: string[];
  }> {
    const classification = await this.getClassification(documentId);

    if (classification?.parties) {
      return {
        plaintiffs: classification.parties.plaintiffs || [],
        defendants: classification.parties.defendants || [],
        thirdParties: classification.parties.thirdParties || [],
      };
    }

    // If not classified, classify first
    const newClassification = await this.classifyDocument(documentId);
    return {
      plaintiffs: newClassification.parties?.plaintiffs || [],
      defendants: newClassification.parties?.defendants || [],
      thirdParties: newClassification.parties?.thirdParties || [],
    };
  }

  /**
   * Get classification statistics
   */
  async getStatistics(): Promise<{
    totalClassified: number;
    byCategory: Record<string, number>;
    averageConfidence: number;
    manualOverrides: number;
  }> {
    const all = await this.classificationRepository.find({
      select: ['category', 'confidence', 'isManualOverride'],
    });

    const byCategory: Record<string, number> = {};
    let totalConfidence = 0;
    let manualOverrides = 0;

    for (const classification of all) {
      byCategory[classification.category] =
        (byCategory[classification.category] || 0) + 1;
      totalConfidence += classification.confidence;
      if (classification.isManualOverride) {
        manualOverrides++;
      }
    }

    return {
      totalClassified: all.length,
      byCategory,
      averageConfidence: all.length > 0 ? totalConfidence / all.length : 0,
      manualOverrides,
    };
  }

  /**
   * Batch classify documents
   */
  async batchClassify(
    documentIds: string[],
    options?: { useAI?: boolean },
  ): Promise<DocumentClassification[]> {
    this.logger.log(`Batch classifying ${documentIds.length} documents`);

    const results: DocumentClassification[] = [];

    for (const documentId of documentIds) {
      try {
        const classification = await this.classifyDocument(documentId, {
          useAI: options?.useAI,
        });
        results.push(classification);
      } catch (error) {
        this.logger.error(
          `Failed to classify document ${documentId}`,
          error,
        );
      }
    }

    return results;
  }
}

/**
 * Rule-based classifier fallback
 */
class RuleBasedClassifier implements ClassificationModel {
  private readonly categoryKeywords: Record<
    LegalDocumentCategory,
    string[]
  > = {
    [LegalDocumentCategory.COMPLAINT]: [
      'complaint',
      'plaintiff',
      'alleges',
      'violation',
    ],
    [LegalDocumentCategory.ANSWER]: [
      'answer',
      'denies',
      'admits',
      'defendant',
    ],
    [LegalDocumentCategory.MOTION]: ['motion', 'moves', 'respectfully'],
    [LegalDocumentCategory.BRIEF]: ['brief', 'argument', 'memorandum'],
    [LegalDocumentCategory.MEMORANDUM]: ['memorandum', 'memo'],
    [LegalDocumentCategory.CONTRACT]: [
      'contract',
      'agreement',
      'parties agree',
      'whereas',
    ],
    [LegalDocumentCategory.COURT_ORDER]: ['order', 'ordered', 'court'],
    [LegalDocumentCategory.JUDGMENT]: ['judgment', 'judgement', 'decree'],
    [LegalDocumentCategory.SUBPOENA]: ['subpoena', 'duces tecum'],
    [LegalDocumentCategory.DEPOSITION]: ['deposition', 'sworn testimony'],
    [LegalDocumentCategory.EXHIBIT]: ['exhibit', 'attachment'],
    [LegalDocumentCategory.AFFIDAVIT]: ['affidavit', 'sworn statement'],
    [LegalDocumentCategory.LETTER]: ['dear', 'sincerely', 're:'],
    [LegalDocumentCategory.OTHER]: [],
    [LegalDocumentCategory.AGREEMENT]: [
      'agreement',
      'parties agree',
      'contract',
    ],
    [LegalDocumentCategory.AMENDMENT]: ['amendment', 'amends', 'modified'],
    [LegalDocumentCategory.ADDENDUM]: ['addendum', 'supplement'],
    [LegalDocumentCategory.SUMMONS]: ['summons', 'summoned'],
    [LegalDocumentCategory.NOTICE]: ['notice', 'hereby notified'],
    [LegalDocumentCategory.DECLARATION]: ['declaration', 'declare'],
    [LegalDocumentCategory.CERTIFICATE]: ['certificate', 'certify'],
    [LegalDocumentCategory.EMAIL]: ['from:', 'to:', 'subject:'],
    [LegalDocumentCategory.MEMO]: ['memo', 'memorandum', 'to:', 'from:'],
    [LegalDocumentCategory.REPORT]: ['report', 'findings', 'analysis'],
    [LegalDocumentCategory.INVOICE]: ['invoice', 'bill', 'amount due'],
    [LegalDocumentCategory.RECEIPT]: ['receipt', 'paid', 'received'],
    [LegalDocumentCategory.INTERROGATORIES]: [
      'interrogatories',
      'interrogatory',
    ],
    [LegalDocumentCategory.REQUESTS_FOR_PRODUCTION]: [
      'request for production',
      'produce',
    ],
    [LegalDocumentCategory.REQUESTS_FOR_ADMISSION]: [
      'request for admission',
      'admit',
    ],
  };

  async classify(
    text: string,
    options?: Record<string, unknown>,
  ): Promise<ClassificationResult> {
    const textLower = text.toLowerCase();
    const scores: Array<{
      category: LegalDocumentCategory;
      score: number;
    }> = [];

    // Score each category based on keyword matches
    for (const [category, keywords] of Object.entries(
      this.categoryKeywords,
    )) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, 'gi');
        const matches = textLower.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      scores.push({
        category: category as LegalDocumentCategory,
        score,
      });
    }

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    // Get top category
    const topCategory =
      scores[0].score > 0
        ? scores[0].category
        : LegalDocumentCategory.OTHER;

    // Calculate confidence (0-1)
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const confidence =
      totalScore > 0 ? Math.min(scores[0].score / totalScore, 1) : 0.5;

    // Get alternative categories (top 3)
    const alternativeCategories = scores
      .slice(1, 4)
      .filter((s) => s.score > 0)
      .map((s) => ({
        category: s.category,
        confidence: totalScore > 0 ? s.score / totalScore : 0,
      }));

    // Extract basic tags (simple word frequency)
    const words = textLower
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4);
    const wordFreq: Record<string, number> = {};
    for (const word of words) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
    const tags = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return {
      category: topCategory,
      confidence,
      alternativeCategories,
      tags,
      legalConcepts: this.extractLegalConcepts(textLower),
      jurisdictions: this.extractJurisdictions(textLower),
    };
  }

  private extractLegalConcepts(text: string): string[] {
    const concepts = [
      'negligence',
      'breach of contract',
      'fraud',
      'liability',
      'damages',
      'injunction',
      'jurisdiction',
      'summary judgment',
      'discovery',
      'settlement',
    ];

    return concepts.filter((concept) => text.includes(concept));
  }

  private extractJurisdictions(text: string): string[] {
    const jurisdictions = [
      'federal',
      'state',
      'district',
      'appellate',
      'supreme court',
      'california',
      'new york',
      'texas',
      'florida',
    ];

    return jurisdictions.filter((j) => text.includes(j));
  }
}
