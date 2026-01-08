import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import {
  DepositionOutline,
  DepositionTopic,
  DepositionQuestion,
  ExhibitReference,
  OutlineStatus,
} from './entities/deposition-outline.entity';
import { Matter } from '@matters/entities/matter.entity';

export interface DepositionPrepRequest {
  matterId: string;
  witnessName: string;
  witnessRole?: string;
  witnessAffiliation?: string;
  caseBackground: string;
  keyFacts: string[];
  objectives: string[];
  availableExhibits?: { exhibitNumber: string; description: string }[];
}

/**
 * Deposition Preparation Service - AI-Powered Deposition Planning
 *
 * Features:
 * - Generate comprehensive deposition outlines
 * - Organize topics and subtopics strategically
 * - Create targeted question sequences
 * - Map exhibits to topics
 * - Identify follow-up questions
 * - Estimate deposition duration
 *
 * Uses GPT-4 for strategic deposition planning
 */
@Injectable()
export class DepositionPrepService {
  private readonly logger = new Logger(DepositionPrepService.name);
  private readonly openai: OpenAI;

  constructor(
    @InjectRepository(DepositionOutline)
    private readonly outlineRepository: Repository<DepositionOutline>,
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate deposition outline
   */
  async generateOutline(
    request: DepositionPrepRequest,
    userId: string,
  ): Promise<DepositionOutline> {
    this.logger.log(
      `Generating deposition outline for witness ${request.witnessName} in matter ${request.matterId}`,
    );

    // Verify matter exists
    const matter = await this.matterRepository.findOne({
      where: { id: request.matterId },
    });

    if (!matter) {
      throw new NotFoundException(`Matter with ID ${request.matterId} not found`);
    }

    // Create draft outline
    const outline = this.outlineRepository.create({
      matterId: request.matterId,
      witnessName: request.witnessName,
      witnessRole: request.witnessRole,
      witnessAffiliation: request.witnessAffiliation,
      status: OutlineStatus.DRAFT,
      objectives: request.objectives.join('\n'),
      generationDate: new Date(),
      modelUsed: 'gpt-4-turbo-preview',
      topics: [],
      questions: [],
      exhibits: [],
      createdBy: userId,
    });

    await this.outlineRepository.save(outline);

    try {
      // Generate outline content with AI
      const content = await this.generateOutlineContent(request);

      // Update outline with generated content
      outline.topics = content.topics;
      outline.questions = content.questions;
      outline.exhibits = content.exhibits;
      outline.keyFacts = request.keyFacts.map(fact => ({
        fact,
        importance: 'HIGH',
      }));
      outline.estimatedDurationMinutes = this.calculateEstimatedDuration(content.topics);
      outline.preparationNotes = content.preparationNotes;

      await this.outlineRepository.save(outline);

      this.logger.log(
        `Successfully generated deposition outline ${outline.id} for matter ${request.matterId}`,
      );

      return outline;
    } catch (error) {
      this.logger.error(
        `Failed to generate deposition outline for matter ${request.matterId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate outline content using AI
   */
  private async generateOutlineContent(request: DepositionPrepRequest) {
    const prompt = `You are an expert litigation attorney preparing for a deposition. Generate a comprehensive deposition outline for the following:

Witness: ${request.witnessName}
Role: ${request.witnessRole || 'Not specified'}
Affiliation: ${request.witnessAffiliation || 'Not specified'}

Case Background:
${request.caseBackground}

Key Facts:
${request.keyFacts.map((fact, i) => `${i + 1}. ${fact}`).join('\n')}

Deposition Objectives:
${request.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

${request.availableExhibits && request.availableExhibits.length > 0 ? `
Available Exhibits:
${request.availableExhibits.map(ex => `${ex.exhibitNumber}: ${ex.description}`).join('\n')}
` : ''}

Generate a strategic deposition outline in the following JSON format:
{
  "topics": [
    {
      "id": "string",
      "title": "string (topic heading)",
      "description": "string (what to cover)",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "estimatedTimeMinutes": number,
      "order": number,
      "subtopics": ["string (subtopic)"]
    }
  ],
  "questions": [
    {
      "id": "string",
      "topicId": "string (matching topic id)",
      "question": "string (clear, targeted question)",
      "followUpQuestions": ["string (potential follow-ups)"],
      "expectedAnswer": "string (what you expect to learn)",
      "documentReferences": ["exhibit numbers if applicable"],
      "order": number,
      "notes": "string (strategy notes)"
    }
  ],
  "exhibits": [
    {
      "id": "string",
      "exhibitNumber": "string",
      "description": "string",
      "relevantTopics": ["topicId"],
      "notes": "string (when and how to use)"
    }
  ],
  "preparationNotes": "string (overall strategy and tips)"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert litigation attorney specializing in deposition preparation. Generate comprehensive, strategic deposition outlines in valid JSON format.',
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
   * Calculate estimated deposition duration
   */
  private calculateEstimatedDuration(topics: DepositionTopic[]): number {
    const topicTime = topics.reduce((sum, topic) => sum + (topic.estimatedTimeMinutes || 0), 0);
    const buffer = topicTime * 0.2; // 20% buffer for unexpected questions
    return Math.ceil(topicTime + buffer);
  }

  /**
   * Get outline by ID
   */
  async getOutlineById(id: string): Promise<DepositionOutline> {
    const outline = await this.outlineRepository.findOne({
      where: { id },
      relations: ['matter'],
    });

    if (!outline) {
      throw new NotFoundException(`Deposition outline with ID ${id} not found`);
    }

    return outline;
  }

  /**
   * Get all outlines for a matter
   */
  async getOutlinesByMatterId(matterId: string): Promise<DepositionOutline[]> {
    return this.outlineRepository.find({
      where: { matterId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update outline status
   */
  async updateOutlineStatus(
    id: string,
    status: OutlineStatus,
    userId: string,
  ): Promise<DepositionOutline> {
    const outline = await this.getOutlineById(id);

    outline.status = status;
    outline.lastModifiedBy = userId;
    outline.updatedBy = userId;

    return this.outlineRepository.save(outline);
  }

  /**
   * Add topic to outline
   */
  async addTopic(id: string, topic: DepositionTopic): Promise<DepositionOutline> {
    const outline = await this.getOutlineById(id);
    outline.topics.push(topic);
    return this.outlineRepository.save(outline);
  }

  /**
   * Add question to outline
   */
  async addQuestion(id: string, question: DepositionQuestion): Promise<DepositionOutline> {
    const outline = await this.getOutlineById(id);
    outline.questions.push(question);
    return this.outlineRepository.save(outline);
  }

  /**
   * Add exhibit reference
   */
  async addExhibit(id: string, exhibit: ExhibitReference): Promise<DepositionOutline> {
    const outline = await this.getOutlineById(id);
    outline.exhibits.push(exhibit);
    return this.outlineRepository.save(outline);
  }

  /**
   * Update outline
   */
  async updateOutline(
    id: string,
    updates: Partial<DepositionOutline>,
    userId: string,
  ): Promise<DepositionOutline> {
    const outline = await this.getOutlineById(id);

    Object.assign(outline, updates);
    outline.lastModifiedBy = userId;
    outline.updatedBy = userId;

    // Recalculate estimated duration if topics changed
    if (updates.topics) {
      outline.estimatedDurationMinutes = this.calculateEstimatedDuration(updates.topics);
    }

    return this.outlineRepository.save(outline);
  }

  /**
   * Delete an outline
   */
  async deleteOutline(id: string): Promise<void> {
    const outline = await this.getOutlineById(id);
    await this.outlineRepository.remove(outline);
    this.logger.log(`Deleted deposition outline ${id}`);
  }

  /**
   * Get questions by topic
   */
  async getQuestionsByTopic(outlineId: string, topicId: string): Promise<DepositionQuestion[]> {
    const outline = await this.getOutlineById(outlineId);
    return outline.questions
      .filter(q => q.topicId === topicId)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const total = await this.outlineRepository.count();
    const draft = await this.outlineRepository.count({ where: { status: OutlineStatus.DRAFT } });
    const inReview = await this.outlineRepository.count({
      where: { status: OutlineStatus.IN_REVIEW },
    });
    const approved = await this.outlineRepository.count({
      where: { status: OutlineStatus.APPROVED },
    });
    const inUse = await this.outlineRepository.count({ where: { status: OutlineStatus.IN_USE } });
    const completed = await this.outlineRepository.count({
      where: { status: OutlineStatus.COMPLETED },
    });

    return {
      total,
      byStatus: { draft, inReview, approved, inUse, completed },
    };
  }
}
