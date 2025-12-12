import { Injectable, Logger } from '@nestjs:common';

export interface PostprocessingResult {
  cleanedText: string;
  corrections: number;
  operations: string[];
  statistics: {
    originalLength: number;
    cleanedLength: number;
    linesRemoved: number;
    spacingCorrections: number;
    punctuationCorrections: number;
  };
}

export interface TextQualityMetrics {
  readability: number;
  completeness: number;
  formatting: number;
  overallQuality: number;
}

/**
 * OCR Text Postprocessing Service
 * Cleans and formats OCR output through:
 * - Spelling correction
 * - Common OCR error fixes (l/I, 0/O, etc.)
 * - Whitespace normalization
 * - Line break correction
 * - Punctuation cleanup
 * - Legal document formatting
 * - Paragraph reconstruction
 */
@Injectable()
export class OcrPostprocessingService {
  private readonly logger = new Logger(OcrPostprocessingService.name);

  // Common OCR character confusion pairs
  private readonly ocrConfusions = new Map<string, string>([
    ['rn', 'm'],    // rn often confused with m
    ['vv', 'w'],    // vv confused with w
    ['l1', 'll'],   // l1 confused with ll
    ['O0', 'O'],    // 0 confused with O in words
    ['S5', 'S'],    // 5 confused with S
    ['B8', 'B'],    // 8 confused with B
    ['I1', 'I'],    // 1 confused with I
    ['Z2', 'Z'],    // 2 confused with Z
  ]);

  // Common legal terms for context-aware correction
  private readonly legalTerms = [
    'plaintiff', 'defendant', 'whereas', 'therefore', 'pursuant',
    'notwithstanding', 'herein', 'thereof', 'whereof', 'hereby',
    'shall', 'agreement', 'contract', 'party', 'parties',
    'jurisdiction', 'venue', 'court', 'judge', 'attorney',
    'evidence', 'testimony', 'witness', 'deposition', 'discovery',
  ];

  /**
   * Main postprocessing pipeline
   */
  async postprocessText(rawText: string): Promise<PostprocessingResult> {
    try {
      this.logger.log('Starting OCR text postprocessing');

      const originalLength = rawText.length;
      const operations: string[] = [];
      let corrections = 0;
      let linesRemoved = 0;
      let spacingCorrections = 0;
      let punctuationCorrections = 0;

      let processedText = rawText;

      // Step 1: Remove null bytes and control characters
      const beforeCleanup = processedText.length;
      processedText = this.removeControlCharacters(processedText);
      if (processedText.length < beforeCleanup) {
        operations.push('removed control characters');
        corrections++;
      }

      // Step 2: Fix common OCR character confusions
      const beforeConfusion = processedText;
      processedText = this.fixOcrConfusions(processedText);
      if (processedText !== beforeConfusion) {
        operations.push('fixed character confusions');
        corrections++;
      }

      // Step 3: Normalize whitespace
      const beforeWhitespace = processedText;
      const whitespaceResult = this.normalizeWhitespace(processedText);
      processedText = whitespaceResult.text;
      spacingCorrections = whitespaceResult.corrections;
      if (spacingCorrections > 0) {
        operations.push(`normalized whitespace (${spacingCorrections} fixes)`);
      }

      // Step 4: Fix line breaks and paragraph structure
      const beforeLineBreaks = processedText.split('\n').length;
      processedText = this.fixLineBreaks(processedText);
      const afterLineBreaks = processedText.split('\n').length;
      linesRemoved = beforeLineBreaks - afterLineBreaks;
      if (linesRemoved > 0) {
        operations.push(`fixed line breaks (removed ${linesRemoved} erroneous breaks)`);
      }

      // Step 5: Fix punctuation and spacing
      const beforePunctuation = processedText;
      const punctuationResult = this.fixPunctuation(processedText);
      processedText = punctuationResult.text;
      punctuationCorrections = punctuationResult.corrections;
      if (punctuationCorrections > 0) {
        operations.push(`fixed punctuation (${punctuationCorrections} corrections)`);
      }

      // Step 6: Fix common word errors
      processedText = this.fixCommonWordErrors(processedText);
      operations.push('applied word corrections');

      // Step 7: Reconstruct paragraphs
      processedText = this.reconstructParagraphs(processedText);
      operations.push('reconstructed paragraphs');

      // Step 8: Fix legal document formatting
      processedText = this.fixLegalFormatting(processedText);
      operations.push('applied legal formatting');

      // Step 9: Final cleanup
      processedText = this.finalCleanup(processedText);
      operations.push('final cleanup');

      const cleanedLength = processedText.length;
      const totalCorrections = corrections + spacingCorrections + punctuationCorrections;

      this.logger.log(`Postprocessing completed. Applied ${operations.length} operations, ${totalCorrections} corrections`);

      return {
        cleanedText: processedText,
        corrections: totalCorrections,
        operations,
        statistics: {
          originalLength,
          cleanedLength,
          linesRemoved,
          spacingCorrections,
          punctuationCorrections,
        },
      };

    } catch (error) {
      this.logger.error(`Text postprocessing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Remove control characters and null bytes
   */
  private removeControlCharacters(text: string): string {
    // Remove null bytes, form feeds, and other control chars except newlines and tabs
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

  /**
   * Fix common OCR character confusions
   */
  private fixOcrConfusions(text: string): string {
    let fixed = text;

    // Context-aware replacements
    // Fix 'rn' to 'm' in words
    fixed = fixed.replace(/\brn\b/gi, 'm');
    fixed = fixed.replace(/\bvv\b/gi, 'w');

    // Fix number/letter confusions in text contexts
    fixed = fixed.replace(/\b([A-Za-z]+)0([A-Za-z]+)\b/g, '$1O$2'); // 0 to O in words
    fixed = fixed.replace(/\b([A-Za-z]+)1([A-Za-z]+)\b/g, '$1l$2'); // 1 to l in words

    // Fix common patterns
    fixed = fixed.replace(/\bT he\b/g, 'The');
    fixed = fixed.replace(/\btbe\b/g, 'the');
    fixed = fixed.replace(/\bwitb\b/g, 'with');
    fixed = fixed.replace(/\bfrom\b/gi, 'from');
    fixed = fixed.replace(/\btbat\b/g, 'that');
    fixed = fixed.replace(/\btbis\b/g, 'this');

    return fixed;
  }

  /**
   * Normalize whitespace
   */
  private normalizeWhitespace(text: string): { text: string; corrections: number } {
    let corrections = 0;
    let normalized = text;

    // Count multiple spaces before fixing
    const multipleSpaces = (normalized.match(/  +/g) || []).length;
    corrections += multipleSpaces;

    // Replace multiple spaces with single space
    normalized = normalized.replace(/  +/g, ' ');

    // Fix spaces before punctuation
    const spacesBeforePunctuation = (normalized.match(/ +([.,;:!?])/g) || []).length;
    corrections += spacesBeforePunctuation;
    normalized = normalized.replace(/ +([.,;:!?])/g, '$1');

    // Fix missing spaces after punctuation
    const missingSpacesAfter = (normalized.match(/([.,;:!?])([A-Z])/g) || []).length;
    corrections += missingSpacesAfter;
    normalized = normalized.replace(/([.,;:!?])([A-Z])/g, '$1 $2');

    // Remove trailing whitespace from lines
    normalized = normalized.replace(/ +$/gm, '');

    // Remove leading whitespace from lines (except intended indentation)
    normalized = normalized.replace(/^ +/gm, '');

    return {
      text: normalized,
      corrections,
    };
  }

  /**
   * Fix line breaks and merge incorrectly split lines
   */
  private fixLineBreaks(text: string): string {
    let fixed = text;

    // Merge lines that end mid-sentence (no punctuation)
    fixed = fixed.replace(/([a-z,])\n([a-z])/g, '$1 $2');

    // Keep line breaks after sentence-ending punctuation
    // (periods, question marks, exclamation points)

    // Fix hyphenated words split across lines
    fixed = fixed.replace(/-\n/g, '');

    // Remove excessive blank lines (more than 2 consecutive)
    fixed = fixed.replace(/\n{4,}/g, '\n\n\n');

    return fixed;
  }

  /**
   * Fix punctuation and spacing around punctuation
   */
  private fixPunctuation(text: string): { text: string; corrections: number } {
    let corrections = 0;
    let fixed = text;

    // Fix multiple periods (OCR artifacts)
    const multiplePeriods = (fixed.match(/\.{2,}/g) || []).length;
    corrections += multiplePeriods;
    fixed = fixed.replace(/\.{2,}/g, '.');

    // Fix spaces before commas
    const spacesBeforeCommas = (fixed.match(/ +,/g) || []).length;
    corrections += spacesBeforeCommas;
    fixed = fixed.replace(/ +,/g, ',');

    // Fix missing space after comma (unless followed by number)
    const missingSpaceAfterComma = (fixed.match(/,([A-Za-z])/g) || []).length;
    corrections += missingSpaceAfterComma;
    fixed = fixed.replace(/,([A-Za-z])/g, ', $1');

    // Fix quotation marks
    fixed = fixed.replace(/`/g, "'");
    fixed = fixed.replace(/''/g, '"');

    // Fix ellipsis
    fixed = fixed.replace(/\. \. \./g, '...');

    return {
      text: fixed,
      corrections,
    };
  }

  /**
   * Fix common word-level errors
   */
  private fixCommonWordErrors(text: string): string {
    let fixed = text;

    // Build regex patterns for legal terms with common OCR errors
    for (const term of this.legalTerms) {
      // Create fuzzy pattern (simple version)
      const pattern = new RegExp(`\\b${term.replace(/l/g, '[l1I]').replace(/o/g, '[o0O]')}\\b`, 'gi');
      fixed = fixed.replace(pattern, term);
    }

    return fixed;
  }

  /**
   * Reconstruct paragraph structure
   */
  private reconstructParagraphs(text: string): string {
    const lines = text.split('\n');
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Empty line indicates paragraph break
      if (line.length === 0) {
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
        continue;
      }

      // Check if this is a heading or section marker
      if (this.isHeading(line)) {
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
        paragraphs.push(line); // Keep heading on its own line
        continue;
      }

      // Add line to current paragraph
      currentParagraph.push(line);

      // Check if line ends with sentence-ending punctuation
      if (/[.!?]$/.test(line)) {
        // Look ahead to see if next line is new paragraph
        const nextLine = lines[i + 1];
        if (!nextLine || nextLine.trim().length === 0 || this.isHeading(nextLine.trim())) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
      }
    }

    // Add any remaining paragraph
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }

    return paragraphs.join('\n\n');
  }

  /**
   * Check if line is a heading
   */
  private isHeading(line: string): boolean {
    // Headings are typically:
    // - All caps
    // - Short (< 100 chars)
    // - May have numbering (1., I., A.)
    // - Don't end with periods (usually)

    if (line.length > 100) return false;

    // Check for numbered sections
    if (/^[IVX0-9]+\./.test(line)) return true;
    if (/^[A-Z]\./.test(line)) return true;

    // Check for all caps (with some flexibility)
    const upperRatio = (line.match(/[A-Z]/g) || []).length / line.replace(/\s/g, '').length;
    if (upperRatio > 0.8) return true;

    return false;
  }

  /**
   * Apply legal document-specific formatting
   */
  private fixLegalFormatting(text: string): string {
    let formatted = text;

    // Fix "WHEREAS" clauses formatting
    formatted = formatted.replace(/WHEREAS,/gi, 'WHEREAS,');

    // Fix "NOW, THEREFORE" formatting
    formatted = formatted.replace(/NOW,?\s+THEREFORE/gi, 'NOW, THEREFORE');

    // Fix party references (ALL CAPS names)
    // Example: "JOHN DOE" should remain capitalized

    // Fix section references
    formatted = formatted.replace(/Section\s+(\d+)/gi, 'Section $1');

    // Fix exhibit references
    formatted = formatted.replace(/Exhibit\s+([A-Z0-9])/gi, 'Exhibit $1');

    return formatted;
  }

  /**
   * Final cleanup pass
   */
  private finalCleanup(text: string): string {
    let cleaned = text;

    // Trim each line
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');

    // Remove any remaining excessive whitespace
    cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');

    // Trim start and end
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Assess text quality after postprocessing
   */
  assessTextQuality(text: string): TextQualityMetrics {
    let readability = 100;
    let completeness = 100;
    let formatting = 100;

    // Check for incomplete words (single letters surrounded by spaces)
    const singleLetters = (text.match(/\b[a-z]\b/gi) || []).length;
    if (singleLetters > 10) {
      readability -= Math.min(30, singleLetters * 2);
    }

    // Check for excessive special characters
    const specialChars = (text.match(/[^a-zA-Z0-9\s.,;:!?'"()\-]/g) || []).length;
    const totalChars = text.length;
    const specialRatio = specialChars / totalChars;
    if (specialRatio > 0.05) {
      readability -= Math.min(25, specialRatio * 500);
    }

    // Check for proper sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = text.split(/\s+/).length / sentences.length;
    if (avgSentenceLength < 3 || avgSentenceLength > 50) {
      completeness -= 20;
    }

    // Check formatting consistency
    const properlyCapitalized = (text.match(/\. [A-Z]/g) || []).length;
    const totalSentences = sentences.length;
    const capitalizationRatio = properlyCapitalized / Math.max(totalSentences - 1, 1);
    if (capitalizationRatio < 0.8) {
      formatting -= 25;
    }

    const overallQuality = (readability + completeness + formatting) / 3;

    return {
      readability: Math.max(0, readability),
      completeness: Math.max(0, completeness),
      formatting: Math.max(0, formatting),
      overallQuality: Math.max(0, overallQuality),
    };
  }

  /**
   * Apply custom correction rules
   */
  applyCustomRules(text: string, rules: Array<{ pattern: RegExp; replacement: string }>): string {
    let corrected = text;

    for (const rule of rules) {
      corrected = corrected.replace(rule.pattern, rule.replacement);
    }

    return corrected;
  }

  /**
   * Extract and clean specific document sections
   */
  extractSection(text: string, sectionName: string): string | null {
    const sectionPattern = new RegExp(`${sectionName}[:\\s]+([\\s\\S]*?)(?=\\n\\n[A-Z]|$)`, 'i');
    const match = text.match(sectionPattern);

    if (match) {
      return match[1].trim();
    }

    return null;
  }

  /**
   * Batch postprocess multiple OCR results
   */
  async postprocessBatch(
    texts: Array<{ text: string; id: string }>,
  ): Promise<Array<{ id: string; result: PostprocessingResult }>> {
    this.logger.log(`Batch postprocessing ${texts.length} texts`);

    const results: Array<{ id: string; result: PostprocessingResult }> = [];

    for (const item of texts) {
      try {
        const result = await this.postprocessText(item.text);
        results.push({
          id: item.id,
          result,
        });
      } catch (error) {
        this.logger.error(`Batch postprocessing failed for ${item.id}: ${error.message}`);
      }
    }

    return results;
  }
}
