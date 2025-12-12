import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentTemplate } from '../entities/document-template.entity';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import Handlebars from 'handlebars';

@Injectable()
export class DocumentTemplateService {
  private readonly logger = new Logger(DocumentTemplateService.name);

  constructor(
    @InjectRepository(DocumentTemplate)
    private templateRepository: Repository<DocumentTemplate>,
  ) {
    this.registerHandlebarsHelpers();
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHandlebarsHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: Date, format: string) => {
      if (!date) return '';
      const d = new Date(date);
      // Basic date formatting
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    // Currency formatting helper
    Handlebars.registerHelper('currency', (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    });

    // Upper case helper
    Handlebars.registerHelper('upper', (str: string) => {
      return str ? str.toUpperCase() : '';
    });

    // Lower case helper
    Handlebars.registerHelper('lower', (str: string) => {
      return str ? str.toLowerCase() : '';
    });

    // Conditional helper
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
  }

  /**
   * Create a new document template
   */
  async create(
    createTemplateDto: CreateTemplateDto,
    userId?: string,
  ): Promise<DocumentTemplate> {
    try {
      const template = this.templateRepository.create({
        ...createTemplateDto,
        createdBy: userId,
      });

      const savedTemplate = await this.templateRepository.save(template);
      this.logger.log(`Template created: ${savedTemplate.id}`);

      return savedTemplate;
    } catch (error) {
      this.logger.error('Failed to create template', error);
      throw error;
    }
  }

  /**
   * Find all templates
   */
  async findAll(category?: string, isActive?: boolean): Promise<DocumentTemplate[]> {
    const query = this.templateRepository.createQueryBuilder('template');

    if (category) {
      query.andWhere('template.category = :category', { category });
    }

    if (isActive !== undefined) {
      query.andWhere('template.isActive = :isActive', { isActive });
    }

    query.orderBy('template.name', 'ASC');

    return await query.getMany();
  }

  /**
   * Find a template by ID
   */
  async findOne(id: string): Promise<DocumentTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  /**
   * Update a template
   */
  async update(
    id: string,
    updateTemplateDto: UpdateTemplateDto,
    userId?: string,
  ): Promise<DocumentTemplate> {
    const template = await this.findOne(id);

    Object.assign(template, updateTemplateDto);
    template.updatedBy = userId;

    const updatedTemplate = await this.templateRepository.save(template);
    this.logger.log(`Template updated: ${id}`);

    return updatedTemplate;
  }

  /**
   * Delete a template
   */
  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);

    await this.templateRepository.remove(template);
    this.logger.log(`Template deleted: ${id}`);
  }

  /**
   * Generate document from template
   */
  async generateFromTemplate(
    templateId: string,
    variables: Record<string, any>,
  ): Promise<string> {
    const template = await this.findOne(templateId);

    if (!template.isActive) {
      throw new Error('Template is not active');
    }

    try {
      // Compile the template
      const compiledTemplate = Handlebars.compile(template.content);

      // Merge default variables with provided variables
      const mergedVariables = {
        ...template.defaultVariables,
        ...variables,
      };

      // Generate the document
      const result = compiledTemplate(mergedVariables);

      // Increment usage count
      await this.incrementUsage(templateId);

      this.logger.log(`Document generated from template: ${templateId}`);

      return result;
    } catch (error) {
      this.logger.error('Failed to generate document from template', error);
      throw error;
    }
  }

  /**
   * Increment template usage count
   */
  async incrementUsage(id: string): Promise<void> {
    const template = await this.findOne(id);

    template.usageCount += 1;
    template.lastUsedAt = new Date();

    await this.templateRepository.save(template);
  }

  /**
   * Get most used templates
   */
  async getMostUsed(limit: number = 10): Promise<DocumentTemplate[]> {
    return await this.templateRepository.find({
      where: { isActive: true },
      order: { usageCount: 'DESC' },
      take: limit,
    });
  }

  /**
   * Validate template syntax
   */
  async validateTemplate(content: string): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    try {
      Handlebars.compile(content);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        errors: [error.message],
      };
    }
  }

  /**
   * Get template variables
   */
  extractTemplateVariables(content: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      // Extract variable name (remove helper names, paths, etc.)
      const variable = match[1].trim().split(' ')[0].split('.')[0];
      if (variable && !['if', 'unless', 'each', 'with'].includes(variable)) {
        variables.add(variable);
      }
    }

    return Array.from(variables);
  }
}
