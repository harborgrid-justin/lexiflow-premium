import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentVersion } from './entities/document-version.entity';

/**
 * Diff Operation Types
 */
export enum DiffOperationType {
  INSERT = 'insert',
  DELETE = 'delete',
  EQUAL = 'equal',
  REPLACE = 'replace',
}

/**
 * Diff Operation
 */
export interface DiffOperation {
  type: DiffOperationType;
  value: string;
  lineNumber?: number;
  position?: {
    start: number;
    end: number;
  };
}

/**
 * Comparison Result
 */
export interface ComparisonResult {
  version1: {
    id: string;
    versionNumber: number;
    createdAt: Date;
  };
  version2: {
    id: string;
    versionNumber: number;
    createdAt: Date;
  };
  diff: DiffOperation[];
  statistics: {
    additions: number;
    deletions: number;
    modifications: number;
    unchanged: number;
    totalLines1: number;
    totalLines2: number;
    similarity: number; // 0-100%
  };
  metadata?: {
    comparedAt: Date;
    algorithm: string;
  };
}

/**
 * Document Comparison Service
 *
 * Generates diffs between document versions:
 * - Line-by-line comparison
 * - Word-level diffs
 * - Structural comparison
 * - Similarity scoring
 * - Side-by-side view data generation
 */
@Injectable()
export class DocumentComparisonService {
  private readonly logger = new Logger(DocumentComparisonService.name);

  constructor(
    @InjectRepository(DocumentVersion)
    private versionRepository: Repository<DocumentVersion>,
  ) {}

  /**
   * Compare two document versions
   */
  async compareVersions(
    versionId1: string,
    versionId2: string,
    options?: {
      algorithm?: 'line' | 'word' | 'character';
      ignoreWhitespace?: boolean;
      contextLines?: number;
    },
  ): Promise<ComparisonResult> {
    this.logger.log(`Comparing versions ${versionId1} and ${versionId2}`);

    // Fetch both versions
    const [version1, version2] = await Promise.all([
      this.versionRepository.findOne({
        where: { id: versionId1 },
        select: [
          'id',
          'versionNumber',
          'content',
          'createdAt',
        ],
      }),
      this.versionRepository.findOne({
        where: { id: versionId2 },
        select: [
          'id',
          'versionNumber',
          'content',
          'createdAt',
        ],
      }),
    ]);

    if (!version1 || !version2) {
      throw new NotFoundException('One or both versions not found');
    }

    // Get content
    const content1 = version1.content || '';
    const content2 = version2.content || '';

    // Generate diff based on algorithm
    const algorithm = options?.algorithm || 'line';
    let diff: DiffOperation[];

    switch (algorithm) {
      case 'line':
        diff = this.lineDiff(content1, content2, options);
        break;
      case 'word':
        diff = this.wordDiff(content1, content2, options);
        break;
      case 'character':
        diff = this.characterDiff(content1, content2, options);
        break;
      default:
        diff = this.lineDiff(content1, content2, options);
    }

    // Calculate statistics
    const statistics = this.calculateStatistics(diff, content1, content2);

    return {
      version1: {
        id: version1.id,
        versionNumber: version1.versionNumber,
        createdAt: version1.createdAt,
      },
      version2: {
        id: version2.id,
        versionNumber: version2.versionNumber,
        createdAt: version2.createdAt,
      },
      diff,
      statistics,
      metadata: {
        comparedAt: new Date(),
        algorithm,
      },
    };
  }

  /**
   * Compare current document with a specific version
   */
  async compareWithCurrent(
    documentId: string,
    versionNumber: number,
  ): Promise<ComparisonResult> {
    // Get the specified version and the latest version
    const versions = await this.versionRepository.find({
      where: { documentId },
      order: { versionNumber: 'DESC' },
      take: 100, // Get enough versions to find both
    });

    const latestVersion = versions[0];
    const targetVersion = versions.find(
      (v) => v.versionNumber === versionNumber,
    );

    if (!latestVersion || !targetVersion) {
      throw new NotFoundException('Version(s) not found');
    }

    return this.compareVersions(targetVersion.id, latestVersion.id);
  }

  /**
   * Get changes between consecutive versions
   */
  async getVersionChanges(versionId: string): Promise<DiffOperation[]> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
      relations: ['previousVersion'],
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    if (!version.previousVersion) {
      // First version - all content is new
      const lines = (version.content || '').split('\n');
      return lines.map((line, idx) => ({
        type: DiffOperationType.INSERT,
        value: line,
        lineNumber: idx + 1,
      }));
    }

    const comparison = await this.compareVersions(
      version.previousVersion.id,
      version.id,
    );

    return comparison.diff;
  }

  /**
   * Line-based diff
   */
  private lineDiff(
    text1: string,
    text2: string,
    options?: {
      ignoreWhitespace?: boolean;
      contextLines?: number;
    },
  ): DiffOperation[] {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');

    if (options?.ignoreWhitespace) {
      return this.lineDiffIgnoreWhitespace(lines1, lines2);
    }

    return this.basicLineDiff(lines1, lines2);
  }

  /**
   * Basic line diff using LCS algorithm
   */
  private basicLineDiff(lines1: string[], lines2: string[]): DiffOperation[] {
    const lcs = this.longestCommonSubsequence(lines1, lines2);
    const diff: DiffOperation[] = [];

    let i = 0;
    let j = 0;
    let lineNum = 0;

    for (const line of lcs) {
      // Add deletions
      while (i < lines1.length && lines1[i] !== line) {
        diff.push({
          type: DiffOperationType.DELETE,
          value: lines1[i],
          lineNumber: lineNum++,
        });
        i++;
      }

      // Add insertions
      while (j < lines2.length && lines2[j] !== line) {
        diff.push({
          type: DiffOperationType.INSERT,
          value: lines2[j],
          lineNumber: lineNum++,
        });
        j++;
      }

      // Add equal line
      if (i < lines1.length && j < lines2.length) {
        diff.push({
          type: DiffOperationType.EQUAL,
          value: line,
          lineNumber: lineNum++,
        });
        i++;
        j++;
      }
    }

    // Add remaining deletions
    while (i < lines1.length) {
      diff.push({
        type: DiffOperationType.DELETE,
        value: lines1[i],
        lineNumber: lineNum++,
      });
      i++;
    }

    // Add remaining insertions
    while (j < lines2.length) {
      diff.push({
        type: DiffOperationType.INSERT,
        value: lines2[j],
        lineNumber: lineNum++,
      });
      j++;
    }

    return diff;
  }

  /**
   * Line diff ignoring whitespace
   */
  private lineDiffIgnoreWhitespace(
    lines1: string[],
    lines2: string[],
  ): DiffOperation[] {
    const normalized1 = lines1.map((l) => l.trim());
    const normalized2 = lines2.map((l) => l.trim());
    return this.basicLineDiff(normalized1, normalized2);
  }

  /**
   * Word-based diff
   */
  private wordDiff(
    text1: string,
    text2: string,
    options?: {
      ignoreWhitespace?: boolean;
    },
  ): DiffOperation[] {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);

    const lcs = this.longestCommonSubsequence(words1, words2);
    const diff: DiffOperation[] = [];

    let i = 0;
    let j = 0;

    for (const word of lcs) {
      while (i < words1.length && words1[i] !== word) {
        diff.push({
          type: DiffOperationType.DELETE,
          value: words1[i],
        });
        i++;
      }

      while (j < words2.length && words2[j] !== word) {
        diff.push({
          type: DiffOperationType.INSERT,
          value: words2[j],
        });
        j++;
      }

      if (i < words1.length && j < words2.length) {
        diff.push({
          type: DiffOperationType.EQUAL,
          value: word,
        });
        i++;
        j++;
      }
    }

    while (i < words1.length) {
      diff.push({
        type: DiffOperationType.DELETE,
        value: words1[i++],
      });
    }

    while (j < words2.length) {
      diff.push({
        type: DiffOperationType.INSERT,
        value: words2[j++],
      });
    }

    return diff;
  }

  /**
   * Character-based diff
   */
  private characterDiff(
    text1: string,
    text2: string,
    options?: {
      ignoreWhitespace?: boolean;
    },
  ): DiffOperation[] {
    const chars1 = text1.split('');
    const chars2 = text2.split('');

    const lcs = this.longestCommonSubsequence(chars1, chars2);
    const diff: DiffOperation[] = [];

    let i = 0;
    let j = 0;

    for (const char of lcs) {
      while (i < chars1.length && chars1[i] !== char) {
        diff.push({
          type: DiffOperationType.DELETE,
          value: chars1[i],
          position: { start: i, end: i + 1 },
        });
        i++;
      }

      while (j < chars2.length && chars2[j] !== char) {
        diff.push({
          type: DiffOperationType.INSERT,
          value: chars2[j],
          position: { start: j, end: j + 1 },
        });
        j++;
      }

      if (i < chars1.length && j < chars2.length) {
        diff.push({
          type: DiffOperationType.EQUAL,
          value: char,
          position: { start: j, end: j + 1 },
        });
        i++;
        j++;
      }
    }

    while (i < chars1.length) {
      diff.push({
        type: DiffOperationType.DELETE,
        value: chars1[i],
        position: { start: i, end: i + 1 },
      });
      i++;
    }

    while (j < chars2.length) {
      diff.push({
        type: DiffOperationType.INSERT,
        value: chars2[j],
        position: { start: j, end: j + 1 },
      });
      j++;
    }

    return diff;
  }

  /**
   * Longest Common Subsequence algorithm
   */
  private longestCommonSubsequence(arr1: string[], arr2: string[]): string[] {
    const m = arr1.length;
    const n = arr2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    // Build LCS table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Reconstruct LCS
    const lcs: string[] = [];
    let i = m;
    let j = n;

    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        lcs.unshift(arr1[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return lcs;
  }

  /**
   * Calculate comparison statistics
   */
  private calculateStatistics(
    diff: DiffOperation[],
    text1: string,
    text2: string,
  ): ComparisonResult['statistics'] {
    const additions = diff.filter(
      (op) => op.type === DiffOperationType.INSERT,
    ).length;
    const deletions = diff.filter(
      (op) => op.type === DiffOperationType.DELETE,
    ).length;
    const unchanged = diff.filter(
      (op) => op.type === DiffOperationType.EQUAL,
    ).length;
    const modifications = Math.min(additions, deletions);

    const totalLines1 = text1.split('\n').length;
    const totalLines2 = text2.split('\n').length;

    // Calculate similarity using Jaccard index
    const similarity =
      unchanged > 0
        ? Math.round((unchanged / (unchanged + additions + deletions)) * 100)
        : 0;

    return {
      additions,
      deletions,
      modifications,
      unchanged,
      totalLines1,
      totalLines2,
      similarity,
    };
  }

  /**
   * Format diff for unified format (git-style)
   */
  formatUnifiedDiff(diff: DiffOperation[]): string {
    const lines: string[] = [];

    for (const op of diff) {
      switch (op.type) {
        case DiffOperationType.INSERT:
          lines.push(`+ ${op.value}`);
          break;
        case DiffOperationType.DELETE:
          lines.push(`- ${op.value}`);
          break;
        case DiffOperationType.EQUAL:
          lines.push(`  ${op.value}`);
          break;
      }
    }

    return lines.join('\n');
  }

  /**
   * Format diff for side-by-side view
   */
  formatSideBySide(
    diff: DiffOperation[],
  ): Array<{
    left: string | null;
    right: string | null;
    type: DiffOperationType;
  }> {
    const result: Array<{
      left: string | null;
      right: string | null;
      type: DiffOperationType;
    }> = [];

    for (const op of diff) {
      switch (op.type) {
        case DiffOperationType.INSERT:
          result.push({ left: null, right: op.value, type: op.type });
          break;
        case DiffOperationType.DELETE:
          result.push({ left: op.value, right: null, type: op.type });
          break;
        case DiffOperationType.EQUAL:
          result.push({ left: op.value, right: op.value, type: op.type });
          break;
      }
    }

    return result;
  }
}
