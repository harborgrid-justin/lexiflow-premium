import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import {
  CasePrediction,
  PredictionOutcome,
  PredictionFactor,
  OutcomeProbability,
  SettlementRange,
} from './entities/case-prediction.entity';
import { Matter } from '@matters/entities/matter.entity';

export interface PredictionRequest {
  matterId: string;
  caseType: string;
  jurisdiction: string;
  facts: string;
  legalIssues: string[];
  evidenceStrength: 'WEAK' | 'MODERATE' | 'STRONG';
  opposingPartyStrength: 'WEAK' | 'MODERATE' | 'STRONG';
  estimatedValue?: number;
  judge?: string;
  precedents?: string[];
}

/**
 * Predictive Analytics Service - AI-Powered Case Outcome Prediction
 *
 * Features:
 * - Predict case outcomes with probability analysis
 * - Identify key success factors
 * - Analyze jurisdiction-specific trends
 * - Estimate settlement ranges
 * - Calculate expected case duration
 * - Provide data-driven recommendations
 *
 * Uses GPT-4 for sophisticated legal analysis
 */
@Injectable()
export class PredictiveAnalyticsService {
  private readonly logger = new Logger(PredictiveAnalyticsService.name);
  private readonly openai: OpenAI;

  constructor(
    @InjectRepository(CasePrediction)
    private readonly predictionRepository: Repository<CasePrediction>,
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate case outcome prediction
   */
  async predictOutcome(request: PredictionRequest, userId: string): Promise<CasePrediction> {
    this.logger.log(`Generating prediction for matter ${request.matterId}`);

    // Verify matter exists
    const matter = await this.matterRepository.findOne({
      where: { id: request.matterId },
    });

    if (!matter) {
      throw new NotFoundException(`Matter with ID ${request.matterId} not found`);
    }

    try {
      // Generate prediction with AI
      const analysis = await this.performPredictiveAnalysis(request);

      // Create prediction entity
      const prediction = this.predictionRepository.create({
        matterId: request.matterId,
        outcomeProbabilities: analysis.outcomeProbabilities,
        primaryOutcome: analysis.primaryOutcome,
        primaryOutcomeProbability: analysis.primaryOutcomeProbability,
        factors: analysis.factors,
        overallConfidence: analysis.overallConfidence,
        settlementRange: analysis.settlementRange,
        estimatedDurationMonths: analysis.estimatedDurationMonths,
        estimatedCost: analysis.estimatedCost,
        similarCasesAnalyzed: analysis.similarCasesAnalyzed,
        jurisdictionWinRate: analysis.jurisdictionWinRate,
        judgeRulingTendency: analysis.judgeRulingTendency,
        keyPrecedents: analysis.keyPrecedents,
        predictionDate: new Date(),
        modelUsed: 'gpt-4-turbo-preview',
        summary: analysis.summary,
        recommendations: analysis.recommendations,
        dataSources: analysis.dataSources,
        createdBy: userId,
      });

      await this.predictionRepository.save(prediction);

      this.logger.log(`Successfully generated prediction ${prediction.id} for matter ${request.matterId}`);

      return prediction;
    } catch (error) {
      this.logger.error(`Failed to generate prediction for matter ${request.matterId}:`, error);
      throw error;
    }
  }

  /**
   * Perform predictive analysis using AI
   */
  private async performPredictiveAnalysis(request: PredictionRequest) {
    const prompt = `You are an expert legal analytics specialist with deep knowledge of case outcomes, litigation trends, and predictive modeling. Analyze the following case and predict its likely outcome.

Case Type: ${request.caseType}
Jurisdiction: ${request.jurisdiction}
${request.judge ? `Judge: ${request.judge}` : ''}

Facts:
${request.facts}

Legal Issues:
${request.legalIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

Evidence Strength: ${request.evidenceStrength}
Opposing Party Strength: ${request.opposingPartyStrength}
${request.estimatedValue ? `Estimated Value: $${request.estimatedValue}` : ''}

${request.precedents && request.precedents.length > 0 ? `
Relevant Precedents:
${request.precedents.join('\n')}
` : ''}

Provide a comprehensive prediction in the following JSON format:
{
  "outcomeProbabilities": [
    {
      "outcome": "PLAINTIFF_WIN|DEFENDANT_WIN|SETTLEMENT|DISMISSAL|MIXED|UNCERTAIN",
      "probability": number (0-1),
      "confidence": number (0-1),
      "reasoning": "string"
    }
  ],
  "primaryOutcome": "PLAINTIFF_WIN|DEFENDANT_WIN|SETTLEMENT|DISMISSAL|MIXED|UNCERTAIN",
  "primaryOutcomeProbability": number (0-1),
  "factors": [
    {
      "id": "string",
      "category": "string (e.g., Evidence, Legal Precedent, Procedural)",
      "description": "string",
      "impact": "POSITIVE|NEGATIVE|NEUTRAL",
      "weight": number (0-1),
      "confidence": number (0-1),
      "explanation": "string"
    }
  ],
  "overallConfidence": number (0-1),
  "settlementRange": {
    "minimum": number,
    "maximum": number,
    "mostLikely": number,
    "confidence": number (0-1)
  },
  "estimatedDurationMonths": number,
  "estimatedCost": number,
  "similarCasesAnalyzed": number,
  "jurisdictionWinRate": number (0-1),
  "judgeRulingTendency": {
    "favorable": number (0-1),
    "unfavorable": number (0-1),
    "neutral": number (0-1)
  },
  "keyPrecedents": [
    {
      "caseTitle": "string",
      "citation": "string",
      "relevance": "string"
    }
  ],
  "dataSources": ["string (types of data considered)"],
  "summary": "string (2-3 paragraph summary)",
  "recommendations": "string (strategic recommendations)"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert legal analytics specialist with deep knowledge of case outcomes, litigation trends, and predictive modeling. Provide detailed, data-driven predictions in valid JSON format.',
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

    return JSON.parse(content);
  }

  /**
   * Get prediction by ID
   */
  async getPredictionById(id: string): Promise<CasePrediction> {
    const prediction = await this.predictionRepository.findOne({
      where: { id },
      relations: ['matter'],
    });

    if (!prediction) {
      throw new NotFoundException(`Prediction with ID ${id} not found`);
    }

    return prediction;
  }

  /**
   * Get predictions for a matter
   */
  async getPredictionsByMatterId(matterId: string): Promise<CasePrediction[]> {
    return this.predictionRepository.find({
      where: { matterId },
      order: { predictionDate: 'DESC' },
    });
  }

  /**
   * Get latest prediction for a matter
   */
  async getLatestPrediction(matterId: string): Promise<CasePrediction | null> {
    return this.predictionRepository.findOne({
      where: { matterId },
      order: { predictionDate: 'DESC' },
    });
  }

  /**
   * Compare predictions over time
   */
  async comparePredictions(matterId: string): Promise<{
    predictions: CasePrediction[];
    trends: {
      outcomeStability: number;
      confidenceChange: number;
      settlementTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
    };
  }> {
    const predictions = await this.getPredictionsByMatterId(matterId);

    if (predictions.length < 2) {
      return {
        predictions,
        trends: {
          outcomeStability: 1,
          confidenceChange: 0,
          settlementTrend: 'STABLE',
        },
      };
    }

    // Calculate outcome stability (how often primary outcome changes)
    let outcomeChanges = 0;
    for (let i = 1; i < predictions.length; i++) {
      if (predictions[i].primaryOutcome !== predictions[i - 1].primaryOutcome) {
        outcomeChanges++;
      }
    }
    const outcomeStability = 1 - outcomeChanges / (predictions.length - 1);

    // Calculate confidence change
    const firstConfidence = predictions[predictions.length - 1].overallConfidence;
    const lastConfidence = predictions[0].overallConfidence;
    const confidenceChange = Number(lastConfidence) - Number(firstConfidence);

    // Determine settlement trend
    const settlementsWithRanges = predictions.filter(p => p.settlementRange);
    let settlementTrend: 'INCREASING' | 'DECREASING' | 'STABLE' = 'STABLE';

    if (settlementsWithRanges.length >= 2) {
      const firstSettlement = settlementsWithRanges[settlementsWithRanges.length - 1].settlementRange!.mostLikely;
      const lastSettlement = settlementsWithRanges[0].settlementRange!.mostLikely;
      const change = (lastSettlement - firstSettlement) / firstSettlement;

      if (change > 0.1) settlementTrend = 'INCREASING';
      else if (change < -0.1) settlementTrend = 'DECREASING';
    }

    return {
      predictions,
      trends: {
        outcomeStability,
        confidenceChange,
        settlementTrend,
      },
    };
  }

  /**
   * Get high-confidence predictions
   */
  async getHighConfidencePredictions(threshold: number = 0.8): Promise<CasePrediction[]> {
    const predictions = await this.predictionRepository.find({
      relations: ['matter'],
      order: { predictionDate: 'DESC' },
      take: 100,
    });

    return predictions.filter(p => Number(p.overallConfidence) >= threshold);
  }

  /**
   * Get predictions by outcome
   */
  async getPredictionsByOutcome(outcome: PredictionOutcome): Promise<CasePrediction[]> {
    return this.predictionRepository.find({
      where: { primaryOutcome: outcome },
      relations: ['matter'],
      order: { predictionDate: 'DESC' },
    });
  }

  /**
   * Delete prediction
   */
  async deletePrediction(id: string): Promise<void> {
    const prediction = await this.getPredictionById(id);
    await this.predictionRepository.remove(prediction);
    this.logger.log(`Deleted prediction ${id}`);
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const total = await this.predictionRepository.count();

    const outcomeDistribution = await this.predictionRepository
      .createQueryBuilder('prediction')
      .select('prediction.primaryOutcome', 'outcome')
      .addSelect('COUNT(*)', 'count')
      .groupBy('prediction.primaryOutcome')
      .getRawMany();

    const avgConfidence = await this.predictionRepository
      .createQueryBuilder('prediction')
      .select('AVG(prediction.overallConfidence)', 'avgConfidence')
      .getRawOne();

    const recentPredictions = await this.predictionRepository.count({
      where: {
        predictionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) as any, // Last 30 days
      },
    });

    return {
      total,
      outcomeDistribution,
      averageConfidence: parseFloat(avgConfidence?.avgConfidence || '0'),
      recentPredictions,
    };
  }
}
