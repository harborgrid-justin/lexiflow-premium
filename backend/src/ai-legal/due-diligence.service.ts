import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

export interface DueDiligenceRequest {
  entityName: string;
  entityType: 'COMPANY' | 'INDIVIDUAL' | 'PROPERTY' | 'INVESTMENT';
  jurisdiction: string;
  transactionType: string;
  documentsProvided: string[];
  specificConcerns?: string[];
}

export interface DueDiligenceReport {
  entityName: string;
  entityType: string;
  overallRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  executiveSummary: string;
  findings: {
    category: string;
    title: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    recommendation: string;
  }[];
  redFlags: {
    issue: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details: string;
    actionRequired: string;
  }[];
  compliance: {
    area: string;
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNCLEAR' | 'NOT_APPLICABLE';
    details: string;
  }[];
  financialAnalysis?: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    concerns: string[];
  };
  legalIssues: {
    issue: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendedAction: string;
  }[];
  recommendations: {
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    recommendation: string;
    rationale: string;
  }[];
  nextSteps: string[];
  generatedAt: Date;
}

/**
 * Due Diligence Service - AI-Powered Due Diligence Analysis
 *
 * Features:
 * - Comprehensive due diligence reports
 * - Risk assessment and scoring
 * - Red flag identification
 * - Compliance checking
 * - Financial analysis
 * - Legal issue identification
 * - Strategic recommendations
 *
 * Uses GPT-4 for sophisticated analysis
 */
@Injectable()
export class DueDiligenceService {
  private readonly logger = new Logger(DueDiligenceService.name);
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Conduct due diligence analysis
   */
  async conductDueDiligence(request: DueDiligenceRequest): Promise<DueDiligenceReport> {
    this.logger.log(`Conducting due diligence for ${request.entityName}`);

    try {
      const analysis = await this.performDueDiligenceAnalysis(request);

      const report: DueDiligenceReport = {
        entityName: request.entityName,
        entityType: request.entityType,
        overallRiskScore: analysis.overallRiskScore,
        riskLevel: this.calculateRiskLevel(analysis.overallRiskScore),
        executiveSummary: analysis.executiveSummary,
        findings: analysis.findings,
        redFlags: analysis.redFlags,
        compliance: analysis.compliance,
        financialAnalysis: analysis.financialAnalysis,
        legalIssues: analysis.legalIssues,
        recommendations: analysis.recommendations,
        nextSteps: analysis.nextSteps,
        generatedAt: new Date(),
      };

      this.logger.log(
        `Successfully completed due diligence for ${request.entityName}. Risk Level: ${report.riskLevel}`,
      );

      return report;
    } catch (error) {
      this.logger.error(`Failed to conduct due diligence for ${request.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Perform due diligence analysis using AI
   */
  private async performDueDiligenceAnalysis(request: DueDiligenceRequest) {
    const prompt = `You are an expert due diligence analyst with deep expertise in legal, financial, and business analysis. Conduct a comprehensive due diligence review for the following:

Entity Name: ${request.entityName}
Entity Type: ${request.entityType}
Jurisdiction: ${request.jurisdiction}
Transaction Type: ${request.transactionType}

Documents Provided:
${request.documentsProvided.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}

${request.specificConcerns && request.specificConcerns.length > 0 ? `
Specific Concerns to Address:
${request.specificConcerns.join('\n')}
` : ''}

Provide a comprehensive due diligence analysis in the following JSON format:
{
  "overallRiskScore": number (0-100, where 0 is no risk and 100 is extreme risk),
  "executiveSummary": "string (2-3 paragraph executive summary)",
  "findings": [
    {
      "category": "string (e.g., Corporate Structure, Financial Health, Legal Compliance, Contracts)",
      "title": "string",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "description": "string",
      "recommendation": "string"
    }
  ],
  "redFlags": [
    {
      "issue": "string",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "details": "string",
      "actionRequired": "string"
    }
  ],
  "compliance": [
    {
      "area": "string (e.g., Tax Compliance, Labor Laws, Environmental Regulations)",
      "status": "COMPLIANT|NON_COMPLIANT|UNCLEAR|NOT_APPLICABLE",
      "details": "string"
    }
  ],
  "financialAnalysis": {
    "summary": "string",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "concerns": ["string"]
  },
  "legalIssues": [
    {
      "issue": "string",
      "description": "string",
      "impact": "LOW|MEDIUM|HIGH",
      "recommendedAction": "string"
    }
  ],
  "recommendations": [
    {
      "priority": "LOW|MEDIUM|HIGH|URGENT",
      "recommendation": "string",
      "rationale": "string"
    }
  ],
  "nextSteps": ["string (actionable next step)"]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert due diligence analyst with deep expertise in legal, financial, and business analysis. Provide comprehensive, actionable due diligence reports in valid JSON format.',
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
   * Calculate risk level from risk score
   */
  private calculateRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Quick risk assessment (simplified version)
   */
  async quickRiskAssessment(
    entityName: string,
    entityType: string,
    keyInfo: string,
  ): Promise<{
    riskScore: number;
    riskLevel: string;
    topConcerns: string[];
    quickRecommendations: string[];
  }> {
    this.logger.log(`Conducting quick risk assessment for ${entityName}`);

    const prompt = `Provide a quick risk assessment for:
Entity: ${entityName}
Type: ${entityType}
Key Information: ${keyInfo}

Respond in JSON format:
{
  "riskScore": number (0-100),
  "topConcerns": ["string (top 3-5 concerns)"],
  "quickRecommendations": ["string (immediate recommendations)"]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a risk assessment expert. Provide quick, accurate risk assessments in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI model');
    }

    const result = JSON.parse(content);

    return {
      riskScore: result.riskScore,
      riskLevel: this.calculateRiskLevel(result.riskScore),
      topConcerns: result.topConcerns || [],
      quickRecommendations: result.quickRecommendations || [],
    };
  }
}
