import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Case Similarity Service
 * Finds similar historical cases using vector space model and cosine similarity
 * Algorithm: TF-IDF vectorization + Cosine Similarity + Weighted Feature Matching
 */
@Injectable()
export class CaseSimilarityService {
  private readonly logger = new Logger(CaseSimilarityService.name);

  constructor(
    @InjectRepository('Case') private caseRepo: Repository<any>,
    @InjectRepository('Document') private documentRepo: Repository<any>,
  ) {}

  /**
   * Find similar cases using multi-dimensional similarity scoring
   * Combines: metadata matching, text similarity, and outcome patterns
   */
  async findSimilarCases(
    caseId: string,
    limit: number = 10,
    minSimilarity: number = 0.6,
  ): Promise<Array<{
    caseId: string;
    caseNumber: string;
    title: string;
    similarityScore: number;
    matchingFactors: Array<{
      factor: string;
      score: number;
      weight: number;
    }>;
    outcome: string;
    relevantInsights: string[];
    matchBreakdown: {
      metadataMatch: number;
      textSimilarity: number;
      contextMatch: number;
      outcomePattern: number;
    };
  }>> {
    try {
      this.logger.log(`Finding similar cases for case ${caseId}`);

      // Get source case details
      const sourceCase = await this.getCaseDetails(caseId);

      if (!sourceCase) {
        throw new Error(`Case ${caseId} not found`);
      }

      // Get potential candidate cases
      const candidates = await this.getCandidateCases(sourceCase);

      // Calculate similarity for each candidate
      const similarities = await Promise.all(
        candidates.map(async (candidate) => {
          const similarity = await this.calculateSimilarity(sourceCase, candidate);
          return {
            case: candidate,
            similarity,
          };
        }),
      );

      // Filter and sort by similarity score
      const results = similarities
        .filter((s) => s.similarity.overallScore >= minSimilarity)
        .sort((a, b) => b.similarity.overallScore - a.similarity.overallScore)
        .slice(0, limit)
        .map((s) => ({
          caseId: s.case.id,
          caseNumber: s.case.caseNumber,
          title: s.case.title,
          similarityScore: s.similarity.overallScore,
          matchingFactors: s.similarity.factors,
          outcome: s.case.outcome,
          relevantInsights: this.generateInsights(s.similarity, s.case),
          matchBreakdown: s.similarity.breakdown,
        }));

      this.logger.log(`Found ${results.length} similar cases`);

      return results;
    } catch (error) {
      this.logger.error(`Error finding similar cases: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate multi-dimensional similarity between two cases
   */
  private async calculateSimilarity(
    sourceCase: any,
    targetCase: any,
  ): Promise<{
    overallScore: number;
    factors: Array<{ factor: string; score: number; weight: number }>;
    breakdown: {
      metadataMatch: number;
      textSimilarity: number;
      contextMatch: number;
      outcomePattern: number;
    };
  }> {
    // Feature weights (sum to 1.0)
    const weights = {
      caseType: 0.18,
      jurisdiction: 0.15,
      practiceArea: 0.12,
      textContent: 0.25,
      legalIssues: 0.15,
      caseValue: 0.05,
      judge: 0.05,
      duration: 0.05,
    };

    const factors = [];

    // Case type similarity
    const caseTypeScore = sourceCase.caseType === targetCase.caseType ? 1.0 : 0.0;
    factors.push({
      factor: 'Case Type',
      score: caseTypeScore,
      weight: weights.caseType,
    });

    // Jurisdiction similarity
    const jurisdictionScore =
      sourceCase.jurisdiction === targetCase.jurisdiction ? 1.0 : 0.5;
    factors.push({
      factor: 'Jurisdiction',
      score: jurisdictionScore,
      weight: weights.jurisdiction,
    });

    // Practice area similarity
    const practiceAreaScore =
      sourceCase.practiceArea === targetCase.practiceArea ? 1.0 : 0.3;
    factors.push({
      factor: 'Practice Area',
      score: practiceAreaScore,
      weight: weights.practiceArea,
    });

    // Text content similarity (using TF-IDF and cosine similarity)
    const textScore = await this.calculateTextSimilarity(
      sourceCase.id,
      targetCase.id,
    );
    factors.push({
      factor: 'Text Content',
      score: textScore,
      weight: weights.textContent,
    });

    // Legal issues similarity (Jaccard index)
    const issuesScore = this.calculateJaccardSimilarity(
      sourceCase.legalIssues || [],
      targetCase.legalIssues || [],
    );
    factors.push({
      factor: 'Legal Issues',
      score: issuesScore,
      weight: weights.legalIssues,
    });

    // Case value similarity (normalized difference)
    const valueScore = this.calculateValueSimilarity(
      sourceCase.value,
      targetCase.value,
    );
    factors.push({
      factor: 'Case Value',
      score: valueScore,
      weight: weights.caseValue,
    });

    // Judge similarity
    const judgeScore = sourceCase.judgeId === targetCase.judgeId ? 1.0 : 0.0;
    factors.push({
      factor: 'Judge',
      score: judgeScore,
      weight: weights.judge,
    });

    // Duration similarity
    const durationScore = this.calculateDurationSimilarity(
      sourceCase.duration,
      targetCase.duration,
    );
    factors.push({
      factor: 'Duration',
      score: durationScore,
      weight: weights.duration,
    });

    // Calculate weighted overall score
    const overallScore = factors.reduce(
      (sum, f) => sum + f.score * f.weight,
      0,
    );

    // Calculate breakdown by category
    const breakdown = {
      metadataMatch:
        (caseTypeScore * weights.caseType +
          jurisdictionScore * weights.jurisdiction +
          practiceAreaScore * weights.practiceArea) /
        (weights.caseType + weights.jurisdiction + weights.practiceArea),
      textSimilarity: textScore,
      contextMatch:
        (issuesScore * weights.legalIssues +
          judgeScore * weights.judge +
          durationScore * weights.duration) /
        (weights.legalIssues + weights.judge + weights.duration),
      outcomePattern: valueScore,
    };

    return {
      overallScore: Math.round(overallScore * 1000) / 1000,
      factors: factors.map((f) => ({
        ...f,
        score: Math.round(f.score * 1000) / 1000,
      })),
      breakdown: {
        metadataMatch: Math.round(breakdown.metadataMatch * 1000) / 1000,
        textSimilarity: Math.round(breakdown.textSimilarity * 1000) / 1000,
        contextMatch: Math.round(breakdown.contextMatch * 1000) / 1000,
        outcomePattern: Math.round(breakdown.outcomePattern * 1000) / 1000,
      },
    };
  }

  /**
   * Calculate text similarity using TF-IDF and cosine similarity
   * TF-IDF = Term Frequency * Inverse Document Frequency
   * Cosine Similarity = (A · B) / (||A|| * ||B||)
   */
  private async calculateTextSimilarity(
    sourceCaseId: string,
    targetCaseId: string,
  ): Promise<number> {
    // Get document text for both cases
    const sourceTexts = await this.getCaseTexts(sourceCaseId);
    const targetTexts = await this.getCaseTexts(targetCaseId);

    if (sourceTexts.length === 0 || targetTexts.length === 0) {
      return 0.5; // Default moderate similarity if no text available
    }

    // Combine all texts for each case
    const sourceText = sourceTexts.join(' ');
    const targetText = targetTexts.join(' ');

    // Tokenize and create vocabulary
    const sourceTokens = this.tokenize(sourceText);
    const targetTokens = this.tokenize(targetText);

    // Build vocabulary (unique terms)
    const vocabulary = new Set([...sourceTokens, ...targetTokens]);

    // Calculate TF-IDF vectors
    const sourceTfIdf = this.calculateTfIdf(sourceTokens, vocabulary, 2); // Assume corpus size of 2
    const targetTfIdf = this.calculateTfIdf(targetTokens, vocabulary, 2);

    // Calculate cosine similarity
    const similarity = this.cosineSimilarity(sourceTfIdf, targetTfIdf);

    return similarity;
  }

  /**
   * Tokenize text into terms
   */
  private tokenize(text: string): string[] {
    // Convert to lowercase, remove punctuation, split on whitespace
    const cleaned = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const tokens = cleaned.split(' ').filter((t) => t.length > 2);

    // Remove common stop words
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
      'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
      'its', 'may', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she',
      'that', 'this', 'with', 'have', 'from', 'they', 'been', 'said', 'will',
    ]);

    return tokens.filter((t) => !stopWords.has(t));
  }

  /**
   * Calculate TF-IDF vector for a document
   */
  private calculateTfIdf(
    tokens: string[],
    vocabulary: Set<string>,
    corpusSize: number,
  ): Map<string, number> {
    const tfidf = new Map<string, number>();

    // Calculate term frequency
    const termFreq = new Map<string, number>();
    tokens.forEach((term) => {
      termFreq.set(term, (termFreq.get(term) || 0) + 1);
    });

    // Calculate TF-IDF for each term in vocabulary
    vocabulary.forEach((term) => {
      const tf = (termFreq.get(term) || 0) / tokens.length;

      // For simplicity, assume IDF = log(corpusSize / (1 + df))
      // In production, this would use actual document frequency from corpus
      const df = termFreq.has(term) ? 1 : 0;
      const idf = Math.log(corpusSize / (1 + df));

      tfidf.set(term, tf * idf);
    });

    return tfidf;
  }

  /**
   * Calculate cosine similarity between two TF-IDF vectors
   */
  private cosineSimilarity(
    vector1: Map<string, number>,
    vector2: Map<string, number>,
  ): number {
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    // Get all terms
    const allTerms = new Set([...vector1.keys(), ...vector2.keys()]);

    allTerms.forEach((term) => {
      const v1 = vector1.get(term) || 0;
      const v2 = vector2.get(term) || 0;

      dotProduct += v1 * v2;
      magnitude1 += v1 * v1;
      magnitude2 += v2 * v2;
    });

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Calculate Jaccard similarity coefficient
   * J(A,B) = |A ∩ B| / |A ∪ B|
   */
  private calculateJaccardSimilarity(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 && arr2.length === 0) {
      return 1.0;
    }

    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Calculate value similarity using normalized exponential decay
   */
  private calculateValueSimilarity(value1: number, value2: number): number {
    if (!value1 && !value2) return 1.0;
    if (!value1 || !value2) return 0.3;

    const maxValue = Math.max(value1, value2);
    const minValue = Math.min(value1, value2);

    if (maxValue === 0) return 1.0;

    // Use exponential decay based on difference
    const ratio = minValue / maxValue;

    // Cases with values within 20% get high similarity
    // Similarity decreases exponentially as difference increases
    return Math.pow(ratio, 0.5);
  }

  /**
   * Calculate duration similarity
   */
  private calculateDurationSimilarity(
    duration1: number,
    duration2: number,
  ): number {
    if (!duration1 && !duration2) return 1.0;
    if (!duration1 || !duration2) return 0.3;

    const maxDuration = Math.max(duration1, duration2);
    const minDuration = Math.min(duration1, duration2);

    if (maxDuration === 0) return 1.0;

    const ratio = minDuration / maxDuration;

    // Durations within 25% get high similarity
    return Math.pow(ratio, 0.3);
  }

  /**
   * Get case details with all relevant fields
   */
  private async getCaseDetails(caseId: string): Promise<any> {
    const caseData = await this.caseRepo
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.caseType', 'caseType')
      .leftJoinAndSelect('case.jurisdiction', 'jurisdiction')
      .where('case.id = :caseId', { caseId })
      .getOne();

    if (!caseData) return null;

    // Calculate duration if case is closed
    const duration = caseData.closedDate
      ? this.calculateDaysBetween(caseData.filedDate, caseData.closedDate)
      : null;

    return {
      id: caseData.id,
      caseNumber: caseData.caseNumber,
      title: caseData.title,
      caseType: caseData.caseType?.name,
      jurisdiction: caseData.jurisdiction?.name,
      practiceArea: caseData.practiceArea,
      value: caseData.value,
      judgeId: caseData.judgeId,
      legalIssues: caseData.legalIssues || [],
      duration,
      outcome: caseData.outcome,
    };
  }

  /**
   * Get candidate cases for similarity matching
   */
  private async getCandidateCases(sourceCase: any): Promise<any[]> {
    // Get cases from same practice area and similar case types
    const query = this.caseRepo
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.caseType', 'caseType')
      .leftJoinAndSelect('case.jurisdiction', 'jurisdiction')
      .where('case.id != :sourceId', { sourceId: sourceCase.id })
      .andWhere('case.status IN (:...statuses)', {
        statuses: ['closed', 'won', 'lost', 'settled'],
      });

    // Prefer same practice area
    if (sourceCase.practiceArea) {
      query.andWhere('case.practiceArea = :practiceArea', {
        practiceArea: sourceCase.practiceArea,
      });
    }

    const candidates = await query.limit(100).getMany();

    return candidates.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      title: c.title,
      caseType: c.caseType?.name,
      jurisdiction: c.jurisdiction?.name,
      practiceArea: c.practiceArea,
      value: c.value,
      judgeId: c.judgeId,
      legalIssues: c.legalIssues || [],
      duration: c.closedDate
        ? this.calculateDaysBetween(c.filedDate, c.closedDate)
        : null,
      outcome: c.outcome,
    }));
  }

  /**
   * Get text content from case documents
   */
  private async getCaseTexts(caseId: string): Promise<string[]> {
    const documents = await this.documentRepo
      .createQueryBuilder('doc')
      .where('doc.caseId = :caseId', { caseId })
      .andWhere('doc.extractedText IS NOT NULL')
      .limit(10) // Limit to first 10 documents for performance
      .getMany();

    return documents.map((d) => d.extractedText || '').filter((t) => t.length > 0);
  }

  private calculateDaysBetween(start: Date, end: Date): number {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate insights from similarity analysis
   */
  private generateInsights(similarity: any, targetCase: any): string[] {
    const insights = [];

    // Outcome insight
    if (targetCase.outcome) {
      insights.push(`Similar case resulted in: ${targetCase.outcome}`);
    }

    // High similarity factors
    const topFactors = similarity.factors
      .filter((f: any) => f.score > 0.8)
      .map((f: any) => f.factor);

    if (topFactors.length > 0) {
      insights.push(`Strong match on: ${topFactors.join(', ')}`);
    }

    // Duration insight
    if (targetCase.duration) {
      insights.push(`Case duration: ${targetCase.duration} days`);
    }

    return insights;
  }

  /**
   * Batch find similar cases for multiple cases
   */
  async batchFindSimilarCases(
    caseIds: string[],
    limit: number = 5,
  ): Promise<Map<string, any[]>> {
    const results = new Map();

    for (const caseId of caseIds) {
      const similarCases = await this.findSimilarCases(caseId, limit);
      results.set(caseId, similarCases);
    }

    return results;
  }

  /**
   * Get similarity explanation for two specific cases
   */
  async explainSimilarity(
    caseId1: string,
    caseId2: string,
  ): Promise<{
    overallScore: number;
    explanation: string;
    factorBreakdown: Array<{ factor: string; score: number; explanation: string }>;
  }> {
    const case1 = await this.getCaseDetails(caseId1);
    const case2 = await this.getCaseDetails(caseId2);

    if (!case1 || !case2) {
      throw new Error('One or both cases not found');
    }

    const similarity = await this.calculateSimilarity(case1, case2);

    const factorBreakdown = similarity.factors.map((f) => ({
      factor: f.factor,
      score: f.score,
      explanation: this.explainFactor(f.factor, f.score, case1, case2),
    }));

    let explanation = `Cases are ${(similarity.overallScore * 100).toFixed(1)}% similar. `;
    explanation += `Key matches: ${similarity.factors
      .filter((f) => f.score > 0.7)
      .map((f) => f.factor)
      .join(', ')}`;

    return {
      overallScore: similarity.overallScore,
      explanation,
      factorBreakdown,
    };
  }

  private explainFactor(
    factor: string,
    score: number,
    case1: any,
    case2: any,
  ): string {
    switch (factor) {
      case 'Case Type':
        return case1.caseType === case2.caseType
          ? `Both are ${case1.caseType} cases`
          : `Different case types: ${case1.caseType} vs ${case2.caseType}`;
      case 'Jurisdiction':
        return case1.jurisdiction === case2.jurisdiction
          ? `Same jurisdiction: ${case1.jurisdiction}`
          : `Different jurisdictions`;
      case 'Text Content':
        return `Document content is ${(score * 100).toFixed(0)}% similar`;
      default:
        return `Similarity score: ${(score * 100).toFixed(0)}%`;
    }
  }
}
