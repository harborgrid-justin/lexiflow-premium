import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { Document } from '@documents/entities/document.entity';

export interface SummaryRequest {
  documentId: string;
  summaryLength?: 'SHORT' | 'MEDIUM' | 'LONG';
  focusAreas?: string[];
  includeKeyPoints?: boolean;
  includeQuotes?: boolean;
}

export interface DocumentSummary {
  documentId: string;
  summary: string;
  keyPoints: string[];
  importantQuotes?: { text: string; context: string }[];
  mainTopics: string[];
  entities: { type: string; name: string; frequency: number }[];
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  wordCount: number;
  readingTimeMinutes: number;
}

/**
 * Legal Summarization Service - AI-Powered Document Summarization
 *
 * Features:
 * - Generate concise summaries of legal documents
 * - Extract key points and arguments
 * - Identify important entities (parties, dates, amounts)
 * - Highlight critical clauses and provisions
 * - Analyze document complexity and tone
 * - Create executive summaries
 *
 * Uses GPT-4 for sophisticated summarization
 */
@Injectable()
export class LegalSummarizationService {
  private readonly logger = new Logger(LegalSummarizationService.name);
  private readonly openai: OpenAI;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Summarize a legal document
   */
  async summarizeDocument(request: SummaryRequest, userId: string): Promise<DocumentSummary> {
    this.logger.log(`Summarizing document ${request.documentId}`);

    // Find the document
    const document = await this.documentRepository.findOne({
      where: { id: request.documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${request.documentId} not found`);
    }

    if (!document.fullTextContent) {
      throw new Error('Document does not have text content available for summarization');
    }

    try {
      const summary = await this.generateSummary(
        document.fullTextContent,
        request.summaryLength || 'MEDIUM',
        request.focusAreas,
        request.includeKeyPoints !== false,
        request.includeQuotes !== false,
      );

      this.logger.log(`Successfully summarized document ${request.documentId}`);

      return {
        documentId: request.documentId,
        ...summary,
      };
    } catch (error) {
      this.logger.error(`Failed to summarize document ${request.documentId}:`, error);
      throw error;
    }
  }

  /**
   * Generate summary using AI
   */
  private async generateSummary(
    text: string,
    length: 'SHORT' | 'MEDIUM' | 'LONG',
    focusAreas?: string[],
    includeKeyPoints: boolean = true,
    includeQuotes: boolean = true,
  ) {
    const lengthInstructions = {
      SHORT: '1-2 paragraphs (100-200 words)',
      MEDIUM: '3-4 paragraphs (200-400 words)',
      LONG: '5-7 paragraphs (400-700 words)',
    };

    const maxTextLength = 12000; // Leave room for prompt
    const truncatedText =
      text.length > maxTextLength ? text.substring(0, maxTextLength) + '...' : text;

    const prompt = `You are an expert legal analyst. Provide a comprehensive summary of the following legal document.

Document Text:
${truncatedText}

Summary Requirements:
- Length: ${lengthInstructions[length]}
${focusAreas && focusAreas.length > 0 ? `- Focus Areas: ${focusAreas.join(', ')}` : ''}
${includeKeyPoints ? '- Extract key points and main arguments' : ''}
${includeQuotes ? '- Include important quotes with context' : ''}

Provide your analysis in the following JSON format:
{
  "summary": "string (comprehensive summary at specified length)",
  "keyPoints": ["string (key point or argument)"],
  "importantQuotes": [
    {
      "text": "string (exact quote)",
      "context": "string (why this quote is important)"
    }
  ],
  "mainTopics": ["string (main topic or theme)"],
  "entities": [
    {
      "type": "string (PERSON, ORGANIZATION, DATE, AMOUNT, LOCATION, etc.)",
      "name": "string",
      "frequency": number
    }
  ],
  "sentiment": "POSITIVE|NEGATIVE|NEUTRAL|MIXED",
  "complexity": "LOW|MEDIUM|HIGH",
  "wordCount": number,
  "readingTimeMinutes": number
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert legal analyst specializing in document summarization. Provide clear, accurate, and comprehensive summaries in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI model');
    }

    return JSON.parse(content);
  }

  /**
   * Batch summarize multiple documents
   */
  async summarizeMultipleDocuments(
    documentIds: string[],
    userId: string,
    summaryLength: 'SHORT' | 'MEDIUM' | 'LONG' = 'SHORT',
  ): Promise<DocumentSummary[]> {
    const summaries: DocumentSummary[] = [];

    for (const documentId of documentIds) {
      try {
        const summary = await this.summarizeDocument(
          {
            documentId,
            summaryLength,
          },
          userId,
        );
        summaries.push(summary);
      } catch (error) {
        this.logger.error(`Failed to summarize document ${documentId}:`, error);
        // Continue with other documents
      }
    }

    return summaries;
  }

  /**
   * Generate executive summary for a case
   */
  async generateExecutiveSummary(
    documentIds: string[],
    caseTitle: string,
    userId: string,
  ): Promise<{
    title: string;
    overview: string;
    keyFindings: string[];
    recommendations: string[];
    documentsAnalyzed: number;
  }> {
    this.logger.log(`Generating executive summary for case: ${caseTitle}`);

    // Get summaries of all documents
    const documentSummaries = await this.summarizeMultipleDocuments(
      documentIds,
      userId,
      'SHORT',
    );

    // Combine summaries for executive summary
    const combinedText = documentSummaries
      .map((s, i) => `Document ${i + 1}:\n${s.summary}`)
      .join('\n\n');

    const prompt = `You are an expert legal analyst. Create an executive summary for the case titled "${caseTitle}" based on the following document summaries:

${combinedText.substring(0, 10000)}

Provide your executive summary in the following JSON format:
{
  "overview": "string (high-level overview of the case, 2-3 paragraphs)",
  "keyFindings": ["string (important finding or fact)"],
  "recommendations": ["string (strategic recommendation)"]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert legal analyst creating executive summaries for senior attorneys and clients. Be clear, concise, and strategic. Provide valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI model');
    }

    const result = JSON.parse(content);

    return {
      title: caseTitle,
      overview: result.overview,
      keyFindings: result.keyFindings || [],
      recommendations: result.recommendations || [],
      documentsAnalyzed: documentSummaries.length,
    };
  }

  /**
   * Extract key clauses from a document
   */
  async extractKeyClauses(documentId: string): Promise<{
    clauses: Array<{
      title: string;
      content: string;
      importance: 'HIGH' | 'MEDIUM' | 'LOW';
      category: string;
    }>;
  }> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    if (!document.fullTextContent) {
      throw new Error('Document does not have text content available');
    }

    const prompt = `Extract the key clauses from this legal document. Identify the most important provisions, terms, and conditions.

Document Text:
${document.fullTextContent.substring(0, 12000)}

Provide your analysis in the following JSON format:
{
  "clauses": [
    {
      "title": "string (clause heading or name)",
      "content": "string (clause text)",
      "importance": "HIGH|MEDIUM|LOW",
      "category": "string (e.g., Payment, Liability, Termination, Confidentiality)"
    }
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert legal analyst specializing in contract analysis. Extract and categorize key clauses accurately in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI model');
    }

    return JSON.parse(content);
  }

  /**
   * Compare two documents
   */
  async compareDocuments(
    documentId1: string,
    documentId2: string,
  ): Promise<{
    similarities: string[];
    differences: string[];
    addedContent: string[];
    removedContent: string[];
    modifiedClauses: Array<{ title: string; change: string }>;
  }> {
    const [doc1, doc2] = await Promise.all([
      this.documentRepository.findOne({ where: { id: documentId1 } }),
      this.documentRepository.findOne({ where: { id: documentId2 } }),
    ]);

    if (!doc1 || !doc2) {
      throw new NotFoundException('One or both documents not found');
    }

    if (!doc1.fullTextContent || !doc2.fullTextContent) {
      throw new Error('Documents must have text content for comparison');
    }

    const prompt = `Compare these two legal documents and identify key similarities and differences.

Document 1:
${doc1.fullTextContent.substring(0, 6000)}

Document 2:
${doc2.fullTextContent.substring(0, 6000)}

Provide your comparison in the following JSON format:
{
  "similarities": ["string (similarity)"],
  "differences": ["string (difference)"],
  "addedContent": ["string (content in doc2 not in doc1)"],
  "removedContent": ["string (content in doc1 not in doc2)"],
  "modifiedClauses": [
    {
      "title": "string",
      "change": "string (description of change)"
    }
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert legal analyst specializing in document comparison. Identify meaningful differences and similarities accurately in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI model');
    }

    return JSON.parse(content);
  }
}
