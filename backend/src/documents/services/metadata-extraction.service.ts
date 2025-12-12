import { Injectable, Logger } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

export interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  keywords?: string[];
  customProperties?: Record<string, any>;
}

@Injectable()
export class MetadataExtractionService {
  private readonly logger = new Logger(MetadataExtractionService.name);

  /**
   * Extract metadata from document buffer based on MIME type
   */
  async extractMetadata(
    buffer: Buffer,
    mimeType: string,
  ): Promise<DocumentMetadata> {
    this.logger.log(`Extracting metadata for type: ${mimeType}`);

    try {
      switch (mimeType) {
        case 'application/pdf':
          return await this.extractPdfMetadata(buffer);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.extractDocxMetadata(buffer);
        default:
          return await this.extractGenericMetadata(buffer);
      }
    } catch (error) {
      this.logger.error('Failed to extract metadata', error);
      return {};
    }
  }

  /**
   * Extract metadata from PDF files
   */
  private async extractPdfMetadata(buffer: Buffer): Promise<DocumentMetadata> {
    try {
      const data = await pdfParse(buffer);
      const info = data.info || {};

      // Count words in extracted text
      const wordCount = this.countWords(data.text);

      return {
        title: info.Title,
        author: info.Author,
        subject: info.Subject,
        creator: info.Creator,
        producer: info.Producer,
        creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
        modificationDate: info.ModDate ? new Date(info.ModDate) : undefined,
        pageCount: data.numpages,
        wordCount,
        keywords: info.Keywords ? info.Keywords.split(',').map((k: string) => k.trim()) : [],
      };
    } catch (error) {
      this.logger.error('Failed to extract PDF metadata', error);
      return {};
    }
  }

  /**
   * Extract metadata from DOCX files
   */
  private async extractDocxMetadata(buffer: Buffer): Promise<DocumentMetadata> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const wordCount = this.countWords(result.value);

      // Mammoth doesn't provide detailed metadata, so we extract basic info
      return {
        wordCount,
        pageCount: Math.ceil(wordCount / 250), // Estimate pages (avg 250 words/page)
      };
    } catch (error) {
      this.logger.error('Failed to extract DOCX metadata', error);
      return {};
    }
  }

  /**
   * Extract basic metadata for generic files
   */
  private async extractGenericMetadata(buffer: Buffer): Promise<DocumentMetadata> {
    try {
      // Try to extract text and count words
      const text = buffer.toString('utf-8');
      const wordCount = this.countWords(text);

      return {
        wordCount,
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Count words in text content
   */
  private countWords(text: string): number {
    if (!text) return 0;
    const words = text.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length;
  }

  /**
   * Detect document language (basic implementation)
   */
  async detectLanguage(text: string): Promise<string> {
    // This is a simplified version. In production, use a proper language detection library
    // like @google-cloud/language or franc

    const commonWords = {
      en: ['the', 'and', 'is', 'of', 'to', 'in', 'that', 'for'],
      es: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'por'],
      fr: ['le', 'de', 'un', 'et', 'être', 'à', 'il', 'que'],
      de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das'],
    };

    const textLower = text.toLowerCase();
    const scores: Record<string, number> = {};

    for (const [lang, words] of Object.entries(commonWords)) {
      scores[lang] = words.filter(word => textLower.includes(` ${word} `)).length;
    }

    const detectedLang = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return detectedLang ? detectedLang[0] : 'en';
  }

  /**
   * Extract text content from buffer
   */
  async extractTextContent(buffer: Buffer, mimeType: string): Promise<string> {
    try {
      switch (mimeType) {
        case 'application/pdf':
          const pdfData = await pdfParse(buffer);
          return pdfData.text;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          const docxResult = await mammoth.extractRawText({ buffer });
          return docxResult.value;
        default:
          return buffer.toString('utf-8');
      }
    } catch (error) {
      this.logger.error('Failed to extract text content', error);
      return '';
    }
  }
}
