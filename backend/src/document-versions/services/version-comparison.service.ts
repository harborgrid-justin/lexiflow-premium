import { Injectable, Logger } from '@nestjs/common';
import * as diff from 'diff';

export interface VersionDiff {
  added: number;
  removed: number;
  changes: DiffChange[];
  summary: string;
}

export interface DiffChange {
  type: 'add' | 'remove' | 'modify';
  value: string;
  lineNumber?: number;
}

@Injectable()
export class VersionComparisonService {
  private readonly logger = new Logger(VersionComparisonService.name);

  /**
   * Compare two text documents and return detailed differences
   */
  compareText(oldText: string, newText: string): VersionDiff {
    const changes: DiffChange[] = [];
    let added = 0;
    let removed = 0;

    // Use diff library to compare texts
    const differences = diff.diffLines(oldText, newText);

    differences.forEach((part, index) => {
      if (part.added) {
        changes.push({
          type: 'add',
          value: part.value,
        });
        added += part.count || 0;
      } else if (part.removed) {
        changes.push({
          type: 'remove',
          value: part.value,
        });
        removed += part.count || 0;
      }
    });

    const summary = this.generateSummary(added, removed);

    return {
      added,
      removed,
      changes,
      summary,
    };
  }

  /**
   * Compare two documents word by word
   */
  compareWords(oldText: string, newText: string): VersionDiff {
    const changes: DiffChange[] = [];
    let added = 0;
    let removed = 0;

    const differences = diff.diffWords(oldText, newText);

    differences.forEach((part) => {
      if (part.added) {
        changes.push({
          type: 'add',
          value: part.value,
        });
        added += part.count || 0;
      } else if (part.removed) {
        changes.push({
          type: 'remove',
          value: part.value,
        });
        removed += part.count || 0;
      }
    });

    const summary = this.generateSummary(added, removed, 'words');

    return {
      added,
      removed,
      changes,
      summary,
    };
  }

  /**
   * Generate unified diff format
   */
  generateUnifiedDiff(
    oldText: string,
    newText: string,
    oldHeader: string = 'Version A',
    newHeader: string = 'Version B',
  ): string {
    return diff.createPatch(
      'document',
      oldText,
      newText,
      oldHeader,
      newHeader,
    );
  }

  /**
   * Generate HTML diff with highlighted changes
   */
  generateHtmlDiff(oldText: string, newText: string): string {
    const differences = diff.diffWords(oldText, newText);
    let html = '<div class="diff-container">';

    differences.forEach((part) => {
      const className = part.added
        ? 'diff-added'
        : part.removed
        ? 'diff-removed'
        : 'diff-unchanged';
      const escapedValue = this.escapeHtml(part.value);
      html += `<span class="${className}">${escapedValue}</span>`;
    });

    html += '</div>';
    return html;
  }

  /**
   * Compare JSON documents
   */
  compareJson(oldJson: any, newJson: any): {
    added: string[];
    removed: string[];
    modified: string[];
  } {
    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];

    this.compareJsonRecursive(oldJson, newJson, '', added, removed, modified);

    return { added, removed, modified };
  }

  /**
   * Recursively compare JSON objects
   */
  private compareJsonRecursive(
    oldObj: any,
    newObj: any,
    path: string,
    added: string[],
    removed: string[],
    modified: string[],
  ): void {
    // Check for removed keys
    if (oldObj && typeof oldObj === 'object') {
      Object.keys(oldObj).forEach((key) => {
        const currentPath = path ? `${path}.${key}` : key;
        if (!(key in newObj)) {
          removed.push(currentPath);
        } else {
          const oldValue = oldObj[key];
          const newValue = newObj[key];

          if (typeof oldValue !== typeof newValue) {
            modified.push(currentPath);
          } else if (typeof oldValue === 'object' && oldValue !== null) {
            this.compareJsonRecursive(oldValue, newValue, currentPath, added, removed, modified);
          } else if (oldValue !== newValue) {
            modified.push(currentPath);
          }
        }
      });
    }

    // Check for added keys
    if (newObj && typeof newObj === 'object') {
      Object.keys(newObj).forEach((key) => {
        const currentPath = path ? `${path}.${key}` : key;
        if (!(key in oldObj)) {
          added.push(currentPath);
        }
      });
    }
  }

  /**
   * Calculate similarity percentage between two texts
   */
  calculateSimilarity(text1: string, text2: string): number {
    const differences = diff.diffChars(text1, text2);
    let matchingChars = 0;
    let totalChars = 0;

    differences.forEach((part) => {
      const count = part.count || 0;
      totalChars += count;
      if (!part.added && !part.removed) {
        matchingChars += count;
      }
    });

    return totalChars > 0 ? (matchingChars / totalChars) * 100 : 100;
  }

  /**
   * Generate summary of changes
   */
  private generateSummary(added: number, removed: number, unit: string = 'lines'): string {
    const parts: string[] = [];

    if (added > 0) {
      parts.push(`${added} ${unit} added`);
    }
    if (removed > 0) {
      parts.push(`${removed} ${unit} removed`);
    }

    if (parts.length === 0) {
      return 'No changes detected';
    }

    return parts.join(', ');
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Extract change statistics
   */
  extractStatistics(oldText: string, newText: string): {
    oldLength: number;
    newLength: number;
    difference: number;
    percentageChange: number;
    similarity: number;
  } {
    const oldLength = oldText.length;
    const newLength = newText.length;
    const difference = newLength - oldLength;
    const percentageChange = oldLength > 0 ? (difference / oldLength) * 100 : 0;
    const similarity = this.calculateSimilarity(oldText, newText);

    return {
      oldLength,
      newLength,
      difference,
      percentageChange,
      similarity,
    };
  }
}
