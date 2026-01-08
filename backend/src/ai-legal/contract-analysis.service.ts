import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import {
  ContractAnalysis,
  AnalysisStatus,
  ClauseExtraction,
  RiskDetection,
  RiskLevel,
  Recommendation,
} from './entities/contract-analysis.entity';
import { Document } from '@documents/entities/document.entity';

/**
 * Contract Analysis Service - AI-Powered Contract Review
 *
 * Features:
 * - Clause extraction and classification
 * - Risk detection and assessment
 * - Compliance checking
 * - Obligation tracking
 * - Key term extraction
 * - Party identification
 *
 * Uses GPT-4 for deep legal analysis
 */
@Injectable()
export class ContractAnalysisService {
  private readonly logger = new Logger(ContractAnalysisService.name);
  private readonly openai: OpenAI;

  constructor(
    @InjectRepository(ContractAnalysis)
    private readonly analysisRepository: Repository<ContractAnalysis>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Analyze a contract document
   */
  async analyzeContract(documentId: string, userId: string): Promise<ContractAnalysis> {
    const startTime = Date.now();

    // Find the document
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Create pending analysis
    const analysis = this.analysisRepository.create({
      documentId,
      status: AnalysisStatus.PROCESSING,
      analysisDate: new Date(),
      modelUsed: 'gpt-4-turbo-preview',
      clauses: [],
      risks: [],
      recommendations: [],
      confidence: 0,
      createdBy: userId,
    });

    await this.analysisRepository.save(analysis);

    try {
      // Analyze with OpenAI
      const result = await this.performAIAnalysis(document.fullTextContent || '');

      // Update analysis with results
      analysis.clauses = result.clauses;
      analysis.risks = result.risks;
      analysis.recommendations = result.recommendations;
      analysis.confidence = result.confidence;
      analysis.summary = result.summary;
      analysis.keyTerms = result.keyTerms;
      analysis.contractType = result.contractType;
      analysis.partiesIdentified = result.parties;
      analysis.effectiveDate = result.effectiveDate;
      analysis.expirationDate = result.expirationDate;
      analysis.totalValue = result.totalValue;
      analysis.status = AnalysisStatus.COMPLETED;
      analysis.processingTimeMs = Date.now() - startTime;

      await this.analysisRepository.save(analysis);

      this.logger.log(`Contract analysis completed for document ${documentId} in ${analysis.processingTimeMs}ms`);

      return analysis;
    } catch (error) {
      // Handle errors
      analysis.status = AnalysisStatus.FAILED;
      analysis.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.analysisRepository.save(analysis);

      this.logger.error(`Contract analysis failed for document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Perform AI-powered contract analysis
   */
  private async performAIAnalysis(contractText: string) {
    const prompt = `You are an expert legal contract analyst. Analyze the following contract and provide a comprehensive analysis.

Contract Text:
${contractText.substring(0, 15000)}

Provide your analysis in the following JSON format:
{
  "contractType": "string (e.g., NDA, Employment Agreement, Purchase Agreement)",
  "summary": "string (2-3 sentence summary)",
  "parties": [{"name": "string", "role": "string"}],
  "effectiveDate": "YYYY-MM-DD or null",
  "expirationDate": "YYYY-MM-DD or null",
  "totalValue": number or null,
  "clauses": [
    {
      "id": "string",
      "type": "string (e.g., Confidentiality, Payment Terms, Termination)",
      "title": "string",
      "content": "string",
      "importance": "LOW|MEDIUM|HIGH"
    }
  ],
  "keyTerms": {
    "term": "definition"
  },
  "risks": [
    {
      "id": "string",
      "category": "string (e.g., Liability, Compliance, Financial)",
      "description": "string",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "recommendation": "string",
      "confidence": number (0-1)
    }
  ],
  "recommendations": [
    {
      "id": "string",
      "type": "string",
      "priority": "LOW|MEDIUM|HIGH",
      "description": "string",
      "suggestedAction": "string",
      "relatedClauses": ["clauseId"]
    }
  ],
  "confidence": number (0-1)
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert legal contract analyst. Provide detailed, accurate analysis in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI model');
    }

    const result = JSON.parse(content);

    return {
      contractType: result.contractType || 'Unknown',
      summary: result.summary || '',
      parties: result.parties || [],
      effectiveDate: result.effectiveDate ? new Date(result.effectiveDate) : undefined,
      expirationDate: result.expirationDate ? new Date(result.expirationDate) : undefined,
      totalValue: result.totalValue,
      clauses: result.clauses || [],
      keyTerms: result.keyTerms || {},
      risks: result.risks || [],
      recommendations: result.recommendations || [],
      confidence: result.confidence || 0.8,
    };
  }

  /**
   * Get analysis by document ID
   */
  async getAnalysisByDocumentId(documentId: string): Promise<ContractAnalysis | null> {
    return this.analysisRepository.findOne({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get analysis by ID
   */
  async getAnalysisById(id: string): Promise<ContractAnalysis> {
    const analysis = await this.analysisRepository.findOne({
      where: { id },
      relations: ['document'],
    });

    if (!analysis) {
      throw new NotFoundException(`Analysis with ID ${id} not found`);
    }

    return analysis;
  }

  /**
   * Get all analyses with pagination
   */
  async getAllAnalyses(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.analysisRepository.findAndCount({
      relations: ['document'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get high-risk contracts
   */
  async getHighRiskContracts(): Promise<ContractAnalysis[]> {
    const analyses = await this.analysisRepository.find({
      where: { status: AnalysisStatus.COMPLETED },
      relations: ['document'],
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return analyses.filter(analysis => {
      return analysis.risks.some(risk =>
        risk.severity === RiskLevel.HIGH || risk.severity === RiskLevel.CRITICAL
      );
    });
  }

  /**
   * Re-analyze a contract
   */
  async reanalyzeContract(analysisId: string, userId: string): Promise<ContractAnalysis> {
    const existingAnalysis = await this.getAnalysisById(analysisId);
    return this.analyzeContract(existingAnalysis.documentId, userId);
  }

  /**
   * Delete an analysis
   */
  async deleteAnalysis(id: string): Promise<void> {
    const analysis = await this.getAnalysisById(id);
    await this.analysisRepository.remove(analysis);
    this.logger.log(`Deleted analysis ${id}`);
  }

  /**
   * Extract specific clause types
   */
  async extractClausesByType(documentId: string, clauseType: string): Promise<ClauseExtraction[]> {
    const analysis = await this.getAnalysisByDocumentId(documentId);

    if (!analysis) {
      throw new NotFoundException(`No analysis found for document ${documentId}`);
    }

    return analysis.clauses.filter(clause =>
      clause.type.toLowerCase().includes(clauseType.toLowerCase())
    );
  }

  /**
   * Get contract summary statistics
   */
  async getStatistics() {
    const total = await this.analysisRepository.count();
    const completed = await this.analysisRepository.count({
      where: { status: AnalysisStatus.COMPLETED },
    });
    const failed = await this.analysisRepository.count({
      where: { status: AnalysisStatus.FAILED },
    });
    const processing = await this.analysisRepository.count({
      where: { status: AnalysisStatus.PROCESSING },
    });

    const highRisk = await this.getHighRiskContracts();

    return {
      total,
      completed,
      failed,
      processing,
      highRiskCount: highRisk.length,
    };
  }
}
