import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DocumentExtractionService } from './document-extraction.service';
import * as diff from 'diff';

export interface ComparisonResult {
  documentA: DocumentInfo;
  documentB: DocumentInfo;
  similarity: number;
  differences: Difference[];
  statistics: ComparisonStatistics;
  summary: string;
  changeLog: ChangeLogEntry[];
}

export interface DocumentInfo {
  id?: string;
  fileName: string;
  wordCount: number;
  pageCount?: number;
  checksum?: string;
}

export interface Difference {
  type: 'added' | 'removed' | 'modified';
  location: {
    lineNumber?: number;
    paragraph?: number;
    section?: string;
  };
  oldValue?: string;
  newValue?: string;
  context: string;
  significance: 'major' | 'minor' | 'formatting';
}

export interface ComparisonStatistics {
  totalChanges: number;
  additions: number;
  deletions: number;
  modifications: number;
  unchangedPercentage: number;
  linesAdded: number;
  linesRemoved: number;
  wordsAdded: number;
  wordsRemoved: number;
}

export interface ChangeLogEntry {
  changeType: 'content' | 'structure' | 'formatting' | 'metadata';
  description: string;
  impact: 'high' | 'medium' | 'low';
  location: string;
}

export interface SideBySideComparison {
  sections: Array<{
    leftContent: string;
    rightContent: string;
    isDifferent: boolean;
    changeType?: 'added' | 'removed' | 'modified';
  }>;
}

/**
 * Document Comparison and Diff Service
 * Provides comprehensive document comparison capabilities:
 * - Text-level diff analysis
 * - Paragraph and section comparison
 * - Version tracking and change detection
 * - Similarity scoring
 * - Side-by-side comparison views
 */
@Injectable()
export class DocumentComparisonService {
  private readonly logger = new Logger(DocumentComparisonService.name);

  constructor(
    private readonly extractionService: DocumentExtractionService,
  ) {}

  /**
   * Compare two documents and generate detailed comparison report
   */
  async compareDocuments(
    documentA: { buffer: Buffer; mimetype: string; fileName: string },
    documentB: { buffer: Buffer; mimetype: string; fileName: string },
  ): Promise<ComparisonResult> {
    try {
      this.logger.log(`Comparing documents: ${documentA.fileName} vs ${documentB.fileName}`);

      // Extract text from both documents
      const extractionA = await this.extractionService.extractDocumentContent(
        documentA.buffer,
        documentA.mimetype,
      );

      const extractionB = await this.extractionService.extractDocumentContent(
        documentB.buffer,
        documentB.mimetype,
      );

      const textA = extractionA.text;
      const textB = extractionB.text;

      // Perform diff analysis
      const diffResult = this.performDiff(textA, textB);

      // Calculate similarity score
      const similarity = this.calculateSimilarity(textA, textB, diffResult);

      // Analyze differences
      const differences = this.analyzeDifferences(diffResult, textA, textB);

      // Generate statistics
      const statistics = this.generateStatistics(diffResult, differences);

      // Generate change log
      const changeLog = this.generateChangeLog(differences);

      // Generate summary
      const summary = this.generateSummary(statistics, similarity);

      return {
        documentA: {
          fileName: documentA.fileName,
          wordCount: extractionA.wordCount,
          pageCount: extractionA.pageCount,
        },
        documentB: {
          fileName: documentB.fileName,
          wordCount: extractionB.wordCount,
          pageCount: extractionB.pageCount,
        },
        similarity,
        differences,
        statistics,
        summary,
        changeLog,
      };

    } catch (error) {
      this.logger.error(`Document comparison failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Document comparison failed: ${error.message}`);
    }
  }

  /**
   * Perform text-level diff using diff library
   */
  private performDiff(textA: string, textB: string): diff.Change[] {
    return diff.diffWords(textA, textB);
  }

  /**
   * Calculate similarity score between documents (0-1)
   */
  private calculateSimilarity(textA: string, textB: string, diffResult: diff.Change[]): number {
    let commonChars = 0;
    let totalChars = 0;

    for (const change of diffResult) {
      const length = change.value.length;
      totalChars += length;

      if (!change.added && !change.removed) {
        commonChars += length;
      }
    }

    if (totalChars === 0) return 0;

    const similarity = commonChars / totalChars;
    return Math.round(similarity * 100) / 100;
  }

  /**
   * Analyze differences and categorize them
   */
  private analyzeDifferences(diffResult: diff.Change[], textA: string, textB: string): Difference[] {
    const differences: Difference[] = [];
    let position = 0;
    let lineNumber = 1;

    for (const change of diffResult) {
      if (change.added) {
        differences.push({
          type: 'added',
          location: {
            lineNumber,
          },
          newValue: change.value,
          context: this.getContext(textB, position, change.value.length),
          significance: this.assessSignificance(change.value, 'added'),
        });
      } else if (change.removed) {
        differences.push({
          type: 'removed',
          location: {
            lineNumber,
          },
          oldValue: change.value,
          context: this.getContext(textA, position, change.value.length),
          significance: this.assessSignificance(change.value, 'removed'),
        });
      }

      // Update line number based on newlines in change
      const newlines = (change.value.match(/\n/g) || []).length;
      lineNumber += newlines;

      if (!change.added) {
        position += change.value.length;
      }
    }

    return differences;
  }

  /**
   * Get context around a change
   */
  private getContext(text: string, position: number, length: number): string {
    const contextSize = 50;
    const start = Math.max(0, position - contextSize);
    const end = Math.min(text.length, position + length + contextSize);

    let context = text.substring(start, end);

    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';

    return context;
  }

  /**
   * Assess significance of a change
   */
  private assessSignificance(
    value: string,
    changeType: 'added' | 'removed',
  ): 'major' | 'minor' | 'formatting' {
    // Check if it's just whitespace or formatting
    if (/^\s+$/.test(value)) {
      return 'formatting';
    }

    // Check for significant legal terms
    const significantTerms = [
      'shall',
      'must',
      'may not',
      'prohibited',
      'required',
      'obligation',
      'liability',
      'damages',
      'termination',
      'breach',
    ];

    const normalizedValue = value.toLowerCase();
    for (const term of significantTerms) {
      if (normalizedValue.includes(term)) {
        return 'major';
      }
    }

    // Check length - longer changes are generally more significant
    if (value.length > 100) {
      return 'major';
    } else if (value.length > 20) {
      return 'minor';
    } else {
      return 'formatting';
    }
  }

  /**
   * Generate comparison statistics
   */
  private generateStatistics(diffResult: diff.Change[], differences: Difference[]): ComparisonStatistics {
    let totalChanges = 0;
    let additions = 0;
    let deletions = 0;
    let modifications = 0;
    let linesAdded = 0;
    let linesRemoved = 0;
    let wordsAdded = 0;
    let wordsRemoved = 0;
    let unchangedChars = 0;
    let totalChars = 0;

    for (const change of diffResult) {
      totalChars += change.value.length;

      if (change.added) {
        additions++;
        totalChanges++;
        linesAdded += (change.value.match(/\n/g) || []).length;
        wordsAdded += (change.value.match(/\S+/g) || []).length;
      } else if (change.removed) {
        deletions++;
        totalChanges++;
        linesRemoved += (change.value.match(/\n/g) || []).length;
        wordsRemoved += (change.value.match(/\S+/g) || []).length;
      } else {
        unchangedChars += change.value.length;
      }
    }

    // Count modifications (pairs of add/remove)
    const addCount = differences.filter(d => d.type === 'added').length;
    const removeCount = differences.filter(d => d.type === 'removed').length;
    modifications = Math.min(addCount, removeCount);

    const unchangedPercentage = totalChars > 0 ? Math.round((unchangedChars / totalChars) * 100) : 0;

    return {
      totalChanges,
      additions,
      deletions,
      modifications,
      unchangedPercentage,
      linesAdded,
      linesRemoved,
      wordsAdded,
      wordsRemoved,
    };
  }

  /**
   * Generate change log entries
   */
  private generateChangeLog(differences: Difference[]): ChangeLogEntry[] {
    const changeLog: ChangeLogEntry[] = [];

    for (const diff of differences) {
      const entry: ChangeLogEntry = {
        changeType: 'content',
        description: this.generateChangeDescription(diff),
        impact: this.mapSignificanceToImpact(diff.significance),
        location: `Line ${diff.location.lineNumber || 'unknown'}`,
      };

      changeLog.push(entry);
    }

    return changeLog;
  }

  /**
   * Generate human-readable change description
   */
  private generateChangeDescription(diff: Difference): string {
    const preview = (text: string) => {
      if (text.length > 50) {
        return text.substring(0, 50) + '...';
      }
      return text;
    };

    switch (diff.type) {
      case 'added':
        return `Added: "${preview(diff.newValue)}"`;
      case 'removed':
        return `Removed: "${preview(diff.oldValue)}"`;
      case 'modified':
        return `Modified: "${preview(diff.oldValue)}" → "${preview(diff.newValue)}"`;
      default:
        return 'Unknown change';
    }
  }

  /**
   * Map significance to impact level
   */
  private mapSignificanceToImpact(significance: 'major' | 'minor' | 'formatting'): 'high' | 'medium' | 'low' {
    const mapping = {
      major: 'high' as const,
      minor: 'medium' as const,
      formatting: 'low' as const,
    };

    return mapping[significance];
  }

  /**
   * Generate summary of comparison
   */
  private generateSummary(statistics: ComparisonStatistics, similarity: number): string {
    const parts: string[] = [];

    parts.push(`Documents are ${(similarity * 100).toFixed(1)}% similar.`);

    if (statistics.totalChanges === 0) {
      parts.push('No differences detected - documents are identical.');
    } else {
      parts.push(`Found ${statistics.totalChanges} change(s):`);

      if (statistics.additions > 0) {
        parts.push(`${statistics.additions} addition(s) (${statistics.wordsAdded} words)`);
      }

      if (statistics.deletions > 0) {
        parts.push(`${statistics.deletions} deletion(s) (${statistics.wordsRemoved} words)`);
      }

      if (statistics.modifications > 0) {
        parts.push(`${statistics.modifications} modification(s)`);
      }
    }

    return parts.join(' ');
  }

  /**
   * Generate side-by-side comparison view
   */
  async generateSideBySideComparison(
    documentA: { buffer: Buffer; mimetype: string },
    documentB: { buffer: Buffer; mimetype: string },
  ): Promise<SideBySideComparison> {
    const extractionA = await this.extractionService.extractDocumentContent(
      documentA.buffer,
      documentA.mimetype,
    );

    const extractionB = await this.extractionService.extractDocumentContent(
      documentB.buffer,
      documentB.mimetype,
    );

    const paragraphsA = extractionA.text.split(/\n\n+/);
    const paragraphsB = extractionB.text.split(/\n\n+/);

    const maxLength = Math.max(paragraphsA.length, paragraphsB.length);
    const sections: SideBySideComparison['sections'] = [];

    for (let i = 0; i < maxLength; i++) {
      const leftContent = paragraphsA[i] || '';
      const rightContent = paragraphsB[i] || '';

      const isDifferent = leftContent !== rightContent;

      let changeType: 'added' | 'removed' | 'modified' | undefined;
      if (isDifferent) {
        if (!leftContent) changeType = 'added';
        else if (!rightContent) changeType = 'removed';
        else changeType = 'modified';
      }

      sections.push({
        leftContent,
        rightContent,
        isDifferent,
        changeType,
      });
    }

    return { sections };
  }

  /**
   * Compare document versions (optimized for version control)
   */
  async compareVersions(
    baseVersion: { buffer: Buffer; mimetype: string; version: string },
    currentVersion: { buffer: Buffer; mimetype: string; version: string },
  ): Promise<ComparisonResult> {
    this.logger.log(`Comparing versions: ${baseVersion.version} → ${currentVersion.version}`);

    return this.compareDocuments(
      {
        buffer: baseVersion.buffer,
        mimetype: baseVersion.mimetype,
        fileName: `Version ${baseVersion.version}`,
      },
      {
        buffer: currentVersion.buffer,
        mimetype: currentVersion.mimetype,
        fileName: `Version ${currentVersion.version}`,
      },
    );
  }

  /**
   * Find similar sections between documents
   */
  async findSimilarSections(
    documentA: { buffer: Buffer; mimetype: string },
    documentB: { buffer: Buffer; mimetype: string },
    minSimilarity: number = 0.8,
  ): Promise<Array<{ sectionA: string; sectionB: string; similarity: number }>> {
    const extractionA = await this.extractionService.extractDocumentContent(
      documentA.buffer,
      documentA.mimetype,
    );

    const extractionB = await this.extractionService.extractDocumentContent(
      documentB.buffer,
      documentB.mimetype,
    );

    const sectionsA = extractionA.text.split(/\n\n+/);
    const sectionsB = extractionB.text.split(/\n\n+/);

    const similarSections: Array<{ sectionA: string; sectionB: string; similarity: number }> = [];

    for (const sectionA of sectionsA) {
      for (const sectionB of sectionsB) {
        const diffResult = this.performDiff(sectionA, sectionB);
        const similarity = this.calculateSimilarity(sectionA, sectionB, diffResult);

        if (similarity >= minSimilarity) {
          similarSections.push({
            sectionA,
            sectionB,
            similarity,
          });
        }
      }
    }

    return similarSections.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Detect plagiarism or duplicate content
   */
  async detectDuplicates(
    sourceDocument: { buffer: Buffer; mimetype: string },
    targetDocuments: Array<{ buffer: Buffer; mimetype: string; fileName: string }>,
    threshold: number = 0.9,
  ): Promise<Array<{ fileName: string; similarity: number; matchedSections: number }>> {
    const results: Array<{ fileName: string; similarity: number; matchedSections: number }> = [];

    for (const target of targetDocuments) {
      const comparison = await this.compareDocuments(
        { ...sourceDocument, fileName: 'Source' },
        target,
      );

      if (comparison.similarity >= threshold) {
        const matchedSections = comparison.differences.filter(
          d => d.significance === 'major',
        ).length;

        results.push({
          fileName: target.fileName,
          similarity: comparison.similarity,
          matchedSections,
        });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Generate unified diff format (like git diff)
   */
  async generateUnifiedDiff(
    documentA: { buffer: Buffer; mimetype: string; fileName: string },
    documentB: { buffer: Buffer; mimetype: string; fileName: string },
  ): Promise<string> {
    const extractionA = await this.extractionService.extractDocumentContent(
      documentA.buffer,
      documentA.mimetype,
    );

    const extractionB = await this.extractionService.extractDocumentContent(
      documentB.buffer,
      documentB.mimetype,
    );

    const patch = diff.createPatch(
      documentA.fileName,
      extractionA.text,
      extractionB.text,
      'Original',
      'Modified',
    );

    return patch;
  }
}
