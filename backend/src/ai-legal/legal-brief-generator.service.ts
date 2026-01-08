import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { LegalBrief, BriefType, BriefStatus, LegalArgument, Citation } from './entities/legal-brief.entity';
import { Matter } from '@matters/entities/matter.entity';

export interface BriefGenerationRequest {
  matterId: string;
  briefType: BriefType;
  title: string;
  facts: string;
  legalIssues: string[];
  jurisdiction: string;
  court?: string;
  precedents?: string[];
}

/**
 * Legal Brief Generator Service - AI-Powered Legal Writing
 *
 * Features:
 * - Generate comprehensive legal briefs
 * - Research and cite relevant case law
 * - Structure persuasive arguments
 * - Format according to court rules
 * - Generate multiple brief types (motions, memoranda, responses, etc.)
 *
 * Uses GPT-4 for sophisticated legal writing
 */
@Injectable()
export class LegalBriefGeneratorService {
  private readonly logger = new Logger(LegalBriefGeneratorService.name);
  private readonly openai: OpenAI;

  constructor(
    @InjectRepository(LegalBrief)
    private readonly briefRepository: Repository<LegalBrief>,
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate a legal brief
   */
  async generateBrief(request: BriefGenerationRequest, userId: string): Promise<LegalBrief> {
    this.logger.log(`Generating ${request.briefType} brief for matter ${request.matterId}`);

    // Verify matter exists
    const matter = await this.matterRepository.findOne({
      where: { id: request.matterId },
    });

    if (!matter) {
      throw new NotFoundException(`Matter with ID ${request.matterId} not found`);
    }

    // Create draft brief
    const brief = this.briefRepository.create({
      matterId: request.matterId,
      title: request.title,
      type: request.briefType,
      status: BriefStatus.DRAFT,
      jurisdiction: request.jurisdiction,
      court: request.court,
      generationDate: new Date(),
      modelUsed: 'gpt-4-turbo-preview',
      arguments: [],
      citations: [],
      introduction: '',
      conclusion: '',
      createdBy: userId,
    });

    await this.briefRepository.save(brief);

    try {
      // Generate brief content with AI
      const content = await this.generateBriefContent(request);

      // Update brief with generated content
      brief.introduction = content.introduction;
      brief.statementOfFacts = content.statementOfFacts;
      brief.proceduralHistory = content.proceduralHistory;
      brief.legalStandard = content.legalStandard;
      brief.arguments = content.arguments;
      brief.citations = content.citations;
      brief.conclusion = content.conclusion;
      brief.wordCount = this.calculateWordCount(content);
      brief.pageCount = Math.ceil(brief.wordCount / 250); // Rough estimate

      await this.briefRepository.save(brief);

      this.logger.log(`Successfully generated brief ${brief.id} for matter ${request.matterId}`);

      return brief;
    } catch (error) {
      this.logger.error(`Failed to generate brief for matter ${request.matterId}:`, error);
      throw error;
    }
  }

  /**
   * Generate brief content using AI
   */
  private async generateBriefContent(request: BriefGenerationRequest) {
    const briefTypeInstructions = this.getBriefTypeInstructions(request.briefType);

    const prompt = `You are an expert legal brief writer. Generate a ${request.briefType} with the following details:

Title: ${request.title}
Jurisdiction: ${request.jurisdiction}
Court: ${request.court || 'Not specified'}

Facts:
${request.facts}

Legal Issues:
${request.legalIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

${request.precedents && request.precedents.length > 0 ? `
Relevant Precedents to Consider:
${request.precedents.join('\n')}
` : ''}

Instructions:
${briefTypeInstructions}

Provide your response in the following JSON format:
{
  "introduction": "string (compelling introduction)",
  "statementOfFacts": "string (neutral, chronological statement of facts)",
  "proceduralHistory": "string (history of the case proceedings)",
  "legalStandard": "string (applicable legal standard or test)",
  "arguments": [
    {
      "id": "string",
      "heading": "string (clear, assertive heading)",
      "content": "string (detailed argument with analysis)",
      "legalBasis": ["statute or case law"],
      "strength": "WEAK|MODERATE|STRONG",
      "order": number
    }
  ],
  "citations": [
    {
      "id": "string",
      "caseTitle": "string",
      "citation": "string (Bluebook format)",
      "jurisdiction": "string",
      "year": number,
      "relevance": "string",
      "quotation": "string (key quote if applicable)"
    }
  ],
  "conclusion": "string (strong, summarizing conclusion)"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert legal brief writer with deep knowledge of legal writing, case law, and persuasive argumentation. Generate comprehensive, well-structured legal briefs in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
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
   * Get specific instructions for each brief type
   */
  private getBriefTypeInstructions(briefType: BriefType): string {
    const instructions = {
      [BriefType.MOTION]: 'Draft a persuasive motion with clear grounds for relief. Focus on why the court should grant the motion.',
      [BriefType.MEMORANDUM]: 'Write a balanced memorandum of law analyzing the legal issues. Present both sides but emphasize favorable arguments.',
      [BriefType.RESPONSE]: 'Craft a strong response addressing and refuting opposing arguments. Focus on weaknesses in opposing position.',
      [BriefType.REPLY]: 'Write a concise reply brief addressing new arguments raised in response. No need to repeat earlier arguments.',
      [BriefType.APPELLATE]: 'Draft an appellate brief arguing for reversal or affirmance. Include standard of review and clear statement of errors.',
      [BriefType.AMICUS]: 'Write an amicus curiae brief providing additional perspective. Focus on broader implications and policy considerations.',
      [BriefType.TRIAL]: 'Prepare a trial brief outlining evidence and legal arguments for trial. Be comprehensive and organized.',
      [BriefType.OTHER]: 'Draft a well-structured legal brief appropriate for the stated purpose.',
    };

    return instructions[briefType] || instructions[BriefType.OTHER];
  }

  /**
   * Calculate word count from brief content
   */
  private calculateWordCount(content: any): number {
    const allText = [
      content.introduction || '',
      content.statementOfFacts || '',
      content.proceduralHistory || '',
      content.legalStandard || '',
      ...(content.arguments || []).map((arg: any) => `${arg.heading} ${arg.content}`),
      content.conclusion || '',
    ].join(' ');

    return allText.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get brief by ID
   */
  async getBriefById(id: string): Promise<LegalBrief> {
    const brief = await this.briefRepository.findOne({
      where: { id },
      relations: ['matter'],
    });

    if (!brief) {
      throw new NotFoundException(`Brief with ID ${id} not found`);
    }

    return brief;
  }

  /**
   * Get all briefs for a matter
   */
  async getBriefsByMatterId(matterId: string): Promise<LegalBrief[]> {
    return this.briefRepository.find({
      where: { matterId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update brief status
   */
  async updateBriefStatus(
    id: string,
    status: BriefStatus,
    userId: string,
  ): Promise<LegalBrief> {
    const brief = await this.getBriefById(id);

    brief.status = status;
    brief.updatedBy = userId;

    if (status === BriefStatus.APPROVED) {
      brief.reviewedBy = userId;
      brief.reviewedAt = new Date();
    } else if (status === BriefStatus.FILED) {
      brief.filedDate = new Date();
    }

    return this.briefRepository.save(brief);
  }

  /**
   * Edit brief content
   */
  async updateBrief(
    id: string,
    updates: Partial<LegalBrief>,
    userId: string,
  ): Promise<LegalBrief> {
    const brief = await this.getBriefById(id);

    Object.assign(brief, updates);
    brief.updatedBy = userId;

    // Recalculate word count if content changed
    if (updates.arguments || updates.introduction || updates.conclusion) {
      brief.wordCount = this.calculateWordCount({
        introduction: brief.introduction,
        statementOfFacts: brief.statementOfFacts,
        proceduralHistory: brief.proceduralHistory,
        legalStandard: brief.legalStandard,
        arguments: brief.arguments,
        conclusion: brief.conclusion,
      });
      brief.pageCount = Math.ceil(brief.wordCount / 250);
    }

    return this.briefRepository.save(brief);
  }

  /**
   * Delete a brief
   */
  async deleteBrief(id: string): Promise<void> {
    const brief = await this.getBriefById(id);
    await this.briefRepository.remove(brief);
    this.logger.log(`Deleted brief ${id}`);
  }

  /**
   * Add citation to brief
   */
  async addCitation(id: string, citation: Citation): Promise<LegalBrief> {
    const brief = await this.getBriefById(id);
    brief.citations.push(citation);
    return this.briefRepository.save(brief);
  }

  /**
   * Get briefs statistics
   */
  async getStatistics() {
    const total = await this.briefRepository.count();
    const draft = await this.briefRepository.count({ where: { status: BriefStatus.DRAFT } });
    const review = await this.briefRepository.count({ where: { status: BriefStatus.REVIEW } });
    const approved = await this.briefRepository.count({ where: { status: BriefStatus.APPROVED } });
    const filed = await this.briefRepository.count({ where: { status: BriefStatus.FILED } });

    const typeDistribution = await this.briefRepository
      .createQueryBuilder('brief')
      .select('brief.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('brief.type')
      .getRawMany();

    return {
      total,
      byStatus: { draft, review, approved, filed },
      byType: typeDistribution,
    };
  }
}
