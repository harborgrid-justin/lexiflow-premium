import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Communication } from './entities/communication.entity';
import { Template } from './entities/template.entity';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  scheduleMessage(scheduleMessage: any) {
    throw new Error('Method not implemented.');
  }
  getScheduledMessages(getScheduledMessages: any) {
    throw new Error('Method not implemented.');
  }
  getDeliveryStatus(getDeliveryStatus: any) {
    throw new Error('Method not implemented.');
  }
  
  constructor(
    @InjectRepository(Communication)
    private readonly communicationRepository: Repository<Communication>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async findAll(): Promise<Communication[]> {
    this.logger.debug('Fetching all communications');
    return this.communicationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByCaseId(caseId: string): Promise<Communication[]> {
    this.logger.debug(`Fetching communications for case: ${caseId}`);
    return this.communicationRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Communication> {
    this.logger.debug(`Fetching communication by id: ${id}`);
    const communication = await this.communicationRepository.findOne({ where: { id } });
    if (!communication) {
      this.logger.warn(`Communication with ID ${id} not found`);
      throw new NotFoundException(`Communication with ID ${id} not found`);
    }
    return communication;
  }

  async create(data: any): Promise<Communication> {
    this.logger.log(`Creating new communication for case: ${data.caseId}`);
    const communication = this.communicationRepository.create(data);
    const saved = await this.communicationRepository.save(communication);
    const result = Array.isArray(saved) ? saved[0] : saved;
    this.logger.log(`Communication created successfully with ID: ${result.id}`);
    return result;
  }

  async send(id: string): Promise<Communication> {
    const communication = await this.findById(id);
    if (communication.status === 'sent') {
      throw new Error('Communication has already been sent');
    }
    communication.status = 'sent';
    communication.sentAt = new Date();
    const saved = await this.communicationRepository.save(communication);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.communicationRepository.delete(id);
  }

  async getByType(type: string): Promise<Communication[]> {
    return this.communicationRepository.find({
      where: { type },
      order: { createdAt: 'DESC' },
    });
  }

  async getSentCommunications(caseId: string): Promise<Communication[]> {
    return this.communicationRepository.find({
      where: { caseId, status: 'sent' },
      order: { sentAt: 'DESC' },
    });
  }

  async getDraftCommunications(caseId: string): Promise<Communication[]> {
    return this.communicationRepository.find({
      where: { caseId, status: 'draft' },
      order: { createdAt: 'DESC' },
    });
  }

  async getCommunicationStats(caseId: string): Promise<any> {
    const all = await this.findByCaseId(caseId);
    const byType: any = {};
    const byStatus: any = {};
    let sent = 0;
    let draft = 0;
    
    all.forEach(c => {
      byType[c.type] = (byType[c.type] || 0) + 1;
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      if (c.status === 'sent') sent++;
      if (c.status === 'draft') draft++;
    });

    return {
      total: all.length,
      sent,
      draft,
      byType,
      byStatus,
    };
  }

  async getAllTemplates(): Promise<Template[]> {
    return this.templateRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getTemplateById(id: string): Promise<Template> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async createTemplate(data: any): Promise<Template> {
    const template = this.templateRepository.create(data);
    const saved = await this.templateRepository.save(template);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async updateTemplate(id: string, data: any): Promise<Template> {
    const template = await this.getTemplateById(id);
    Object.assign(template, data);
    const saved = await this.templateRepository.save(template);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.getTemplateById(id);
    await this.templateRepository.delete(id);
  }

  async getActiveTemplates(): Promise<Template[]> {
    return this.templateRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getTemplatesByType(type: string): Promise<Template[]> {
    return this.templateRepository.find({
      where: { type },
      order: { createdAt: 'DESC' },
    });
  }

  async renderTemplate(templateId: string, variables: any): Promise<{ subject: string; body: string }> {
    const template = await this.getTemplateById(templateId);
    
    let subject = template.subject;
    let body = template.body;

    // Replace variables in template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, variables[key]);
      body = body.replace(regex, variables[key]);
    });

    return { subject, body };
  }

  async createFromTemplate(params: any): Promise<Communication> {
    const { templateId, caseId, variables, ...otherData } = params;
    const rendered = await this.renderTemplate(templateId, variables);
    
    const communication = this.communicationRepository.create({
      caseId,
      subject: rendered.subject,
      body: rendered.body,
      ...otherData,
    });

    const saved = await this.communicationRepository.save(communication);
    return Array.isArray(saved) ? saved[0] : saved;
  }
}
