import { Injectable, Logger } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { JSDOM } from 'jsdom';

export interface ExtractionResult {
  text: string;
  wordCount: number;
  pageCount?: number;
  language?: string;
  encoding?: string;
  extractionMethod: string;
  quality: 'high' | 'medium' | 'low';
  structuredData?: any;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  position?: { page: number; top: number; left: number };
}

export interface DocumentStructure {
  title?: string;
  sections: Array<{
    heading: string;
    content: string;
    level: number;
  }>;
  tables: TableData[];
  images: Array<{
    position: number;
    altText?: string;
    size?: { width: number; height: number };
  }>;
  footnotes: string[];
  headers: string[];
  footers: string[];
}

/**
 * Document Content Extraction Service
 * Extracts text, metadata, and structured content from various document formats:
 * - PDF documents (text extraction, structure analysis)
 * - Word documents (DOCX, DOC)
 * - Text files (TXT, CSV)
 * - Images (via OCR integration)
 * - HTML documents
 */
@Injectable()
export class DocumentExtractionService {
  private readonly logger = new Logger(DocumentExtractionService.name);

  /**
   * Extract content from any supported document type
   */
  async extractDocumentContent(
    buffer: Buffer,
    mimetype: string,
  ): Promise<ExtractionResult> {
    try {
      this.logger.log(`Extracting content from document type: ${mimetype}`);

      switch (mimetype) {
        case 'application/pdf':
          return await this.extractFromPdf(buffer);

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDocx(buffer);

        case 'application/msword':
          return await this.extractFromDoc(buffer);

        case 'text/plain':
          return this.extractFromText(buffer);

        case 'text/csv':
          return this.extractFromCsv(buffer);

        case 'text/html':
        case 'application/xhtml+xml':
          return this.extractFromHtml(buffer);

        case 'image/jpeg':
        case 'image/png':
        case 'image/tiff':
          return await this.extractFromImage(buffer, mimetype);

        default:
          this.logger.warn(`Unsupported mimetype for extraction: ${mimetype}`);
          return {
            text: '',
            wordCount: 0,
            extractionMethod: 'none',
            quality: 'low',
          };
      }
    } catch (error) {
      this.logger.error(`Content extraction failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Extract text and structure from PDF documents
   */
  private async extractFromPdf(buffer: Buffer): Promise<ExtractionResult> {
    try {
      const data = await pdfParse(buffer);

      const text = data.text;
      const wordCount = this.countWords(text);
      const pageCount = data.numpages;

      // Detect language
      const language = this.detectLanguage(text);

      return {
        text,
        wordCount,
        pageCount,
        language,
        extractionMethod: 'pdf-parse',
        quality: text.length > 100 ? 'high' : 'medium',
        structuredData: {
          metadata: data.info,
          version: data.version,
        },
      };
    } catch (error) {
      this.logger.error(`PDF extraction failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract text from DOCX documents
   */
  private async extractFromDocx(buffer: Buffer): Promise<ExtractionResult> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      const wordCount = this.countWords(text);
      const language = this.detectLanguage(text);

      // Extract structured content
      const htmlResult = await mammoth.convertToHtml({ buffer });
      const structure = this.parseHtmlStructure(htmlResult.value);

      return {
        text,
        wordCount,
        language,
        extractionMethod: 'mammoth',
        quality: 'high',
        structuredData: structure,
      };
    } catch (error) {
      this.logger.error(`DOCX extraction failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract text from DOC documents (legacy format)
   */
  private async extractFromDoc(buffer: Buffer): Promise<ExtractionResult> {
    // DOC format is binary and complex - in production, use antiword or similar
    this.logger.warn('Legacy DOC format - limited extraction support');

    return {
      text: '',
      wordCount: 0,
      extractionMethod: 'legacy-doc',
      quality: 'low',
    };
  }

  /**
   * Extract text from plain text files
   */
  private extractFromText(buffer: Buffer): ExtractionResult {
    const text = buffer.toString('utf-8');
    const wordCount = this.countWords(text);
    const language = this.detectLanguage(text);

    return {
      text,
      wordCount,
      language,
      encoding: 'utf-8',
      extractionMethod: 'text',
      quality: 'high',
    };
  }

  /**
   * Extract and parse CSV files
   */
  private extractFromCsv(buffer: Buffer): ExtractionResult {
    const text = buffer.toString('utf-8');
    const lines = text.split('\n').filter(line => line.trim());

    const rows = lines.map(line => {
      // Simple CSV parsing - in production use csv-parser library
      return line.split(',').map(cell => cell.trim());
    });

    const structuredData = {
      headers: rows.length > 0 ? rows[0] : [],
      rows: rows.slice(1),
      rowCount: rows.length - 1,
      columnCount: rows.length > 0 ? rows[0].length : 0,
    };

    return {
      text,
      wordCount: this.countWords(text),
      extractionMethod: 'csv-parse',
      quality: 'high',
      structuredData,
    };
  }

  /**
   * Extract text from HTML documents
   */
  private extractFromHtml(buffer: Buffer): ExtractionResult {
    const html = buffer.toString('utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract text content
    const text = document.body?.textContent || '';
    const wordCount = this.countWords(text);

    // Parse structure
    const structure = this.parseHtmlStructure(html);

    return {
      text,
      wordCount,
      extractionMethod: 'html-parse',
      quality: 'high',
      structuredData: structure,
    };
  }

  /**
   * Extract text from images (requires OCR)
   */
  private async extractFromImage(buffer: Buffer, mimetype: string): Promise<ExtractionResult> {
    // This would integrate with OCR service
    // For now, return placeholder indicating OCR is needed

    this.logger.log(`Image extraction requires OCR: ${mimetype}`);

    return {
      text: '',
      wordCount: 0,
      extractionMethod: 'ocr-required',
      quality: 'low',
      structuredData: {
        requiresOcr: true,
        imageType: mimetype,
      },
    };
  }

  /**
   * Parse HTML structure into sections, tables, etc.
   */
  private parseHtmlStructure(html: string): DocumentStructure {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const structure: DocumentStructure = {
      sections: [],
      tables: [],
      images: [],
      footnotes: [],
      headers: [],
      footers: [],
    };

    // Extract title
    const titleElement = document.querySelector('h1, title');
    structure.title = titleElement?.textContent || '';

    // Extract headings and sections
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.substring(1));
      structure.sections.push({
        heading: heading.textContent || '',
        content: this.getTextUntilNextHeading(heading),
        level,
      });
    });

    // Extract tables
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      const headers: string[] = [];
      const rows: string[][] = [];

      const headerRow = table.querySelector('thead tr, tr:first-child');
      if (headerRow) {
        headerRow.querySelectorAll('th, td').forEach(cell => {
          headers.push(cell.textContent?.trim() || '');
        });
      }

      const bodyRows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
      bodyRows.forEach(row => {
        const rowData: string[] = [];
        row.querySelectorAll('td').forEach(cell => {
          rowData.push(cell.textContent?.trim() || '');
        });
        if (rowData.length > 0) {
          rows.push(rowData);
        }
      });

      structure.tables.push({ headers, rows });
    });

    // Extract images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      structure.images.push({
        position: index,
        altText: img.getAttribute('alt') || undefined,
      });
    });

    return structure;
  }

  /**
   * Get text content until the next heading
   */
  private getTextUntilNextHeading(heading: Element): string {
    let content = '';
    let nextSibling = heading.nextElementSibling;

    while (nextSibling && !nextSibling.matches('h1, h2, h3, h4, h5, h6')) {
      content += nextSibling.textContent + '\n';
      nextSibling = nextSibling.nextElementSibling;
    }

    return content.trim();
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Detect language of text (simple heuristic)
   */
  private detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    // In production, use a proper language detection library

    const sample = text.substring(0, 1000).toLowerCase();

    // Check for common English words
    const englishWords = ['the', 'and', 'of', 'to', 'a', 'in', 'is', 'that'];
    const englishCount = englishWords.filter(word => sample.includes(word)).length;

    if (englishCount >= 5) {
      return 'en';
    }

    // Check for Spanish
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'los'];
    const spanishCount = spanishWords.filter(word => sample.includes(word)).length;

    if (spanishCount >= 5) {
      return 'es';
    }

    return 'unknown';
  }

  /**
   * Extract tables from document
   */
  async extractTables(buffer: Buffer, mimetype: string): Promise<TableData[]> {
    const result = await this.extractDocumentContent(buffer, mimetype);

    if (result.structuredData?.tables) {
      return result.structuredData.tables;
    }

    return [];
  }

  /**
   * Extract specific sections by heading
   */
  async extractSections(buffer: Buffer, mimetype: string, headingPattern: string): Promise<any[]> {
    const result = await this.extractDocumentContent(buffer, mimetype);

    if (!result.structuredData?.sections) {
      return [];
    }

    const regex = new RegExp(headingPattern, 'i');
    return result.structuredData.sections.filter(section =>
      regex.test(section.heading),
    );
  }

  /**
   * Extract metadata and statistics
   */
  async extractStatistics(buffer: Buffer, mimetype: string): Promise<any> {
    const result = await this.extractDocumentContent(buffer, mimetype);

    const sentences = result.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = result.text.split(/\n\n+/).filter(p => p.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? result.wordCount / sentences.length : 0;

    return {
      wordCount: result.wordCount,
      characterCount: result.text.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      pageCount: result.pageCount,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      language: result.language,
      extractionQuality: result.quality,
    };
  }

  /**
   * Extract text in chunks for processing
   */
  async extractChunks(
    buffer: Buffer,
    mimetype: string,
    chunkSize: number = 1000,
  ): Promise<string[]> {
    const result = await this.extractDocumentContent(buffer, mimetype);
    const words = result.text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Search for text patterns in document
   */
  async searchInDocument(
    buffer: Buffer,
    mimetype: string,
    searchPattern: string,
  ): Promise<Array<{ match: string; position: number; context: string }>> {
    const result = await this.extractDocumentContent(buffer, mimetype);
    const regex = new RegExp(searchPattern, 'gi');
    const matches: Array<{ match: string; position: number; context: string }> = [];

    let match: RegExpExecArray;
    while ((match = regex.exec(result.text)) !== null) {
      const position = match.index;
      const contextStart = Math.max(0, position - 50);
      const contextEnd = Math.min(result.text.length, position + match[0].length + 50);
      const context = result.text.substring(contextStart, contextEnd);

      matches.push({
        match: match[0],
        position,
        context,
      });
    }

    return matches;
  }
}
