import { Injectable, Logger } from '@nestjs/common';
import { DocumentExtractionService } from './document-extraction.service';

export interface ClassificationResult {
  type: string;
  category: string;
  subcategory?: string;
  confidence: number;
  tags: string[];
  characteristics: {
    [key: string]: any;
  };
  suggestions: string[];
}

export interface LegalDocumentType {
  name: string;
  patterns: string[];
  keywords: string[];
  structureIndicators: string[];
  confidence: number;
}

/**
 * ML-Based Document Classification Service
 * Classifies legal documents into types using:
 * - Pattern matching and keyword analysis
 * - Document structure analysis
 * - ML-based classification (TensorFlow.js integration ready)
 * - Legal-specific document type detection
 */
@Injectable()
export class DocumentClassificationService {
  private readonly logger = new Logger(DocumentClassificationService.name);

  // Legal document type definitions
  private readonly legalDocumentTypes: LegalDocumentType[] = [
    {
      name: 'Contract',
      patterns: [
        /\bcontract\b/i,
        /\bagreement\b/i,
        /\bparties\b.*\bagree\b/i,
        /\bwhereas\b/i,
        /\btherefore\b.*\bagree\b/i,
      ],
      keywords: ['party', 'whereas', 'covenant', 'obligation', 'consideration', 'terminate', 'breach'],
      structureIndicators: ['recitals', 'definitions', 'terms and conditions', 'signatures'],
      confidence: 0.85,
    },
    {
      name: 'Complaint',
      patterns: [
        /\bcomplaint\b/i,
        /\bplaintiff\b.*\bdefendant\b/i,
        /\bjurisdiction\b.*\bvenue\b/i,
        /\bcause of action\b/i,
        /\bwherefore\b.*\bprays\b/i,
      ],
      keywords: ['plaintiff', 'defendant', 'jurisdiction', 'venue', 'cause', 'prayer for relief', 'damages'],
      structureIndicators: ['jurisdiction and venue', 'parties', 'allegations', 'prayer for relief'],
      confidence: 0.90,
    },
    {
      name: 'Motion',
      patterns: [
        /\bmotion\b.*\b(dismiss|summary judgment|compel)\b/i,
        /\bmovant\b/i,
        /\brespectfully moves\b/i,
        /\bmemorandum\b.*\bsupport\b/i,
      ],
      keywords: ['movant', 'respectfully moves', 'good cause', 'relief requested', 'memorandum'],
      structureIndicators: ['introduction', 'statement of facts', 'argument', 'conclusion'],
      confidence: 0.88,
    },
    {
      name: 'Brief',
      patterns: [
        /\bbrief\b.*\b(support|opposition)\b/i,
        /\btable of contents\b/i,
        /\btable of authorities\b/i,
        /\bstatement of (facts|issues)\b/i,
        /\bargument\b/i,
      ],
      keywords: ['appellant', 'appellee', 'argument', 'authorities', 'standard of review'],
      structureIndicators: ['table of contents', 'table of authorities', 'statement of facts', 'argument', 'conclusion'],
      confidence: 0.87,
    },
    {
      name: 'Deposition',
      patterns: [
        /\bdeposition\b/i,
        /\bappearance\b.*\bwitness\b/i,
        /\bcourt reporter\b/i,
        /\bQ\.\s+/,
        /\bA\.\s+/,
      ],
      keywords: ['deposition', 'witness', 'court reporter', 'sworn', 'testimony', 'oath'],
      structureIndicators: ['appearances', 'stipulations', 'examination', 'signature page'],
      confidence: 0.92,
    },
    {
      name: 'Discovery Request',
      patterns: [
        /\brequest\b.*\b(production|admissions|interrogatories)\b/i,
        /\bpropounded\b/i,
        /\bpursuant to\b.*\b(rule|code)\b/i,
      ],
      keywords: ['request', 'production', 'interrogatory', 'admission', 'propound', 'respond'],
      structureIndicators: ['definitions', 'instructions', 'requests', 'verification'],
      confidence: 0.89,
    },
    {
      name: 'Court Order',
      patterns: [
        /\border\b/i,
        /\bit is hereby ordered\b/i,
        /\bthe court\b.*\b(orders|finds|concludes)\b/i,
        /\bso ordered\b/i,
      ],
      keywords: ['ordered', 'adjudged', 'decreed', 'judge', 'court'],
      structureIndicators: ['background', 'findings', 'conclusions', 'order', 'signature'],
      confidence: 0.91,
    },
    {
      name: 'Affidavit',
      patterns: [
        /\baffidavit\b/i,
        /\bsworn to\b/i,
        /\bbeing duly sworn\b/i,
        /\bsubscribed and sworn\b/i,
      ],
      keywords: ['affiant', 'sworn', 'declares', 'penalty of perjury', 'notary'],
      structureIndicators: ['declaration', 'sworn statement', 'signature', 'notarization'],
      confidence: 0.90,
    },
    {
      name: 'Settlement Agreement',
      patterns: [
        /\bsettlement\b.*\bagreement\b/i,
        /\bmutual release\b/i,
        /\bdispute\b.*\bresolved\b/i,
        /\brelease\b.*\bclaims\b/i,
      ],
      keywords: ['settle', 'release', 'claims', 'dispute', 'consideration', 'confidential'],
      structureIndicators: ['recitals', 'settlement terms', 'releases', 'confidentiality'],
      confidence: 0.86,
    },
    {
      name: 'Lease Agreement',
      patterns: [
        /\blease\b.*\bagreement\b/i,
        /\blandlord\b.*\btenant\b/i,
        /\brent\b.*\bmonthly\b/i,
        /\bpremises\b.*\boccupy\b/i,
      ],
      keywords: ['landlord', 'tenant', 'rent', 'premises', 'term', 'security deposit'],
      structureIndicators: ['parties', 'premises', 'term', 'rent', 'obligations'],
      confidence: 0.88,
    },
  ];

  constructor(
    private readonly extractionService: DocumentExtractionService,
  ) {}

  /**
   * Main classification method
   */
  async classifyDocument(
    buffer: Buffer,
    mimetype: string,
    fileName?: string,
  ): Promise<ClassificationResult> {
    try {
      this.logger.log(`Classifying document: ${fileName || 'unknown'}`);

      // Extract text content
      const extraction = await this.extractionService.extractDocumentContent(buffer, mimetype);
      const text = extraction.text;

      if (!text || text.length < 100) {
        return this.createDefaultClassification('Unknown', 'Insufficient content for classification');
      }

      // Perform multiple classification strategies
      const patternScore = this.classifyByPatterns(text);
      const keywordScore = this.classifyByKeywords(text);
      const structureScore = this.classifyByStructure(text, extraction.structuredData);
      const fileNameScore = fileName ? this.classifyByFileName(fileName) : null;

      // Combine scores
      const combinedScores = this.combineClassificationScores(
        patternScore,
        keywordScore,
        structureScore,
        fileNameScore,
      );

      // Get best match
      const bestMatch = this.getBestMatch(combinedScores);

      if (!bestMatch || bestMatch.confidence < 0.50) {
        return this.createDefaultClassification('Unclassified', 'No strong classification match found');
      }

      // Generate tags based on content
      const tags = this.generateTags(text, bestMatch.type);

      // Analyze document characteristics
      const characteristics = this.analyzeCharacteristics(text, extraction);

      // Generate suggestions
      const suggestions = this.generateSuggestions(bestMatch.type, characteristics);

      return {
        type: bestMatch.type,
        category: this.getCategoryForType(bestMatch.type),
        subcategory: this.getSubcategoryForType(bestMatch.type),
        confidence: bestMatch.confidence,
        tags,
        characteristics,
        suggestions,
      };

    } catch (error) {
      this.logger.error(`Document classification failed: ${error.message}`, error.stack);
      return this.createDefaultClassification('Error', error.message);
    }
  }

  /**
   * Classify by pattern matching
   */
  private classifyByPatterns(text: string): Map<string, number> {
    const scores = new Map<string, number>();

    for (const docType of this.legalDocumentTypes) {
      let score = 0;
      let matchCount = 0;

      for (const pattern of docType.patterns) {
        if (pattern.test(text)) {
          matchCount++;
        }
      }

      score = (matchCount / docType.patterns.length) * docType.confidence;
      scores.set(docType.name, score);
    }

    return scores;
  }

  /**
   * Classify by keyword frequency analysis
   */
  private classifyByKeywords(text: string): Map<string, number> {
    const scores = new Map<string, number>();
    const normalizedText = text.toLowerCase();

    for (const docType of this.legalDocumentTypes) {
      let keywordCount = 0;

      for (const keyword of docType.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = normalizedText.match(regex);
        if (matches) {
          keywordCount += matches.length;
        }
      }

      const score = Math.min(1.0, keywordCount / 20) * docType.confidence;
      scores.set(docType.name, score);
    }

    return scores;
  }

  /**
   * Classify by document structure
   */
  private classifyByStructure(text: string, structuredData: any): Map<string, number> {
    const scores = new Map<string, number>();
    const normalizedText = text.toLowerCase();

    for (const docType of this.legalDocumentTypes) {
      let structureScore = 0;
      let foundIndicators = 0;

      for (const indicator of docType.structureIndicators) {
        if (normalizedText.includes(indicator.toLowerCase())) {
          foundIndicators++;
        }
      }

      structureScore = (foundIndicators / docType.structureIndicators.length) * docType.confidence;
      scores.set(docType.name, structureScore);
    }

    return scores;
  }

  /**
   * Classify by file name
   */
  private classifyByFileName(fileName: string): Map<string, number> {
    const scores = new Map<string, number>();
    const normalizedName = fileName.toLowerCase();

    for (const docType of this.legalDocumentTypes) {
      const docTypeName = docType.name.toLowerCase();

      if (normalizedName.includes(docTypeName)) {
        scores.set(docType.name, 0.7);
      } else {
        scores.set(docType.name, 0.0);
      }
    }

    return scores;
  }

  /**
   * Combine multiple classification scores
   */
  private combineClassificationScores(
    patternScores: Map<string, number>,
    keywordScores: Map<string, number>,
    structureScores: Map<string, number>,
    fileNameScores: Map<string, number> | null,
  ): Map<string, number> {
    const combinedScores = new Map<string, number>();

    // Weights for different classification methods
    const weights = {
      pattern: 0.35,
      keyword: 0.25,
      structure: 0.30,
      fileName: 0.10,
    };

    for (const docType of this.legalDocumentTypes) {
      const patternScore = patternScores.get(docType.name) || 0;
      const keywordScore = keywordScores.get(docType.name) || 0;
      const structureScore = structureScores.get(docType.name) || 0;
      const fileNameScore = fileNameScores?.get(docType.name) || 0;

      const combined =
        patternScore * weights.pattern +
        keywordScore * weights.keyword +
        structureScore * weights.structure +
        fileNameScore * weights.fileName;

      combinedScores.set(docType.name, combined);
    }

    return combinedScores;
  }

  /**
   * Get best matching document type
   */
  private getBestMatch(scores: Map<string, number>): { type: string; confidence: number } | null {
    let bestType: string | null = null;
    let bestScore = 0;

    for (const [type, score] of scores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
      }
    }

    if (bestType) {
      return {
        type: bestType,
        confidence: Math.round(bestScore * 100) / 100,
      };
    }

    return null;
  }

  /**
   * Generate relevant tags for document
   */
  private generateTags(text: string, documentType: string): string[] {
    const tags: string[] = [documentType];
    const normalizedText = text.toLowerCase();

    // Common legal tags
    const tagPatterns = {
      'federal': /\bfederal\b/i,
      'state': /\bstate\b.*\b(law|court)\b/i,
      'civil': /\bcivil\b/i,
      'criminal': /\bcriminal\b/i,
      'commercial': /\bcommercial\b/i,
      'employment': /\bemployment\b/i,
      'intellectual-property': /\b(patent|trademark|copyright)\b/i,
      'real-estate': /\b(property|real estate)\b/i,
      'confidential': /\bconfidential\b/i,
      'privileged': /\bprivileged\b/i,
    };

    for (const [tag, pattern] of Object.entries(tagPatterns)) {
      if (pattern.test(normalizedText)) {
        tags.push(tag);
      }
    }

    return tags;
  }

  /**
   * Analyze document characteristics
   */
  private analyzeCharacteristics(text: string, extraction: any): any {
    const wordCount = extraction.wordCount || 0;
    const pageCount = extraction.pageCount || 1;

    return {
      length: wordCount > 5000 ? 'long' : wordCount > 2000 ? 'medium' : 'short',
      complexity: this.assessComplexity(text),
      formality: this.assessFormality(text),
      pageCount,
      wordCount,
      hasSignatures: /\bsignature\b/i.test(text),
      hasNotarization: /\bnotary\b/i.test(text),
      hasExhibits: /\bexhibit\b.*\b[A-Z]\b/i.test(text),
      dated: this.extractDates(text).length > 0,
    };
  }

  /**
   * Assess document complexity
   */
  private assessComplexity(text: string): 'simple' | 'moderate' | 'complex' {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;

    const legalJargonPatterns = [
      /\bwhereas\b/gi,
      /\btherefore\b/gi,
      /\bpursuant to\b/gi,
      /\bnotwithstanding\b/gi,
      /\baforementioned\b/gi,
    ];

    const jargonCount = legalJargonPatterns.reduce((count, pattern) => {
      const matches = text.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    if (avgSentenceLength > 25 && jargonCount > 10) {
      return 'complex';
    } else if (avgSentenceLength > 18 || jargonCount > 5) {
      return 'moderate';
    } else {
      return 'simple';
    }
  }

  /**
   * Assess document formality
   */
  private assessFormality(text: string): 'formal' | 'semi-formal' | 'informal' {
    const formalIndicators = [
      /\bhereby\b/gi,
      /\bwherein\b/gi,
      /\bthereof\b/gi,
      /\brespectfully\b/gi,
    ];

    const formalCount = formalIndicators.reduce((count, pattern) => {
      const matches = text.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    if (formalCount > 5) {
      return 'formal';
    } else if (formalCount > 2) {
      return 'semi-formal';
    } else {
      return 'informal';
    }
  }

  /**
   * Extract dates from text
   */
  private extractDates(text: string): string[] {
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
      /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g,
      /\b[A-Z][a-z]+\s+\d{1,2},?\s+\d{4}\b/g,
    ];

    const dates: string[] = [];

    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        dates.push(...matches);
      }
    }

    return dates;
  }

  /**
   * Generate suggestions based on classification
   */
  private generateSuggestions(documentType: string, characteristics: any): string[] {
    const suggestions: string[] = [];

    if (documentType === 'Contract' && !characteristics.hasSignatures) {
      suggestions.push('Consider adding signature blocks');
    }

    if (documentType === 'Affidavit' && !characteristics.hasNotarization) {
      suggestions.push('Ensure notarization is completed');
    }

    if (characteristics.complexity === 'complex') {
      suggestions.push('Consider adding a summary or executive overview');
    }

    if (characteristics.length === 'long' && !characteristics.hasExhibits) {
      suggestions.push('Consider organizing content with exhibits');
    }

    return suggestions;
  }

  /**
   * Get category for document type
   */
  private getCategoryForType(type: string): string {
    const categories = {
      'Contract': 'Transactional',
      'Complaint': 'Litigation',
      'Motion': 'Litigation',
      'Brief': 'Litigation',
      'Deposition': 'Discovery',
      'Discovery Request': 'Discovery',
      'Court Order': 'Judicial',
      'Affidavit': 'Evidence',
      'Settlement Agreement': 'Transactional',
      'Lease Agreement': 'Transactional',
    };

    return categories[type] || 'General';
  }

  /**
   * Get subcategory for document type
   */
  private getSubcategoryForType(type: string): string {
    const subcategories = {
      'Contract': 'Agreement',
      'Complaint': 'Initial Pleading',
      'Motion': 'Court Filing',
      'Brief': 'Appellate',
      'Deposition': 'Testimony',
      'Discovery Request': 'Interrogatories',
      'Court Order': 'Ruling',
      'Affidavit': 'Sworn Statement',
      'Settlement Agreement': 'Dispute Resolution',
      'Lease Agreement': 'Real Estate',
    };

    return subcategories[type] || 'Miscellaneous';
  }

  /**
   * Create default classification result
   */
  private createDefaultClassification(type: string, reason: string): ClassificationResult {
    return {
      type,
      category: 'Unknown',
      confidence: 0,
      tags: [type.toLowerCase()],
      characteristics: {
        reason,
      },
      suggestions: [],
    };
  }

  /**
   * Batch classify multiple documents
   */
  async classifyBatch(
    documents: Array<{ buffer: Buffer; mimetype: string; fileName: string }>,
  ): Promise<ClassificationResult[]> {
    const results: ClassificationResult[] = [];

    for (const doc of documents) {
      try {
        const result = await this.classifyDocument(doc.buffer, doc.mimetype, doc.fileName);
        results.push(result);
      } catch (error) {
        this.logger.error(`Batch classification failed for ${doc.fileName}: ${error.message}`);
        results.push(this.createDefaultClassification('Error', error.message));
      }
    }

    return results;
  }
}
