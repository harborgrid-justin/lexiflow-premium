import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Communication } from './entities/communication.entity';
import { Template } from './entities/template.entity';

@Injectable()
export class CommunicationsService {
  constructor(
    @InjectRepository(Communication)
    private readonly communicationRepository: Repository<Communication>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async findAll(): Promise<Communication[]> {
    return this.communicationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByCaseId(caseId: string): Promise<Communication[]> {
    return this.communicationRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Communication> {
    const communication = await this.communicationRepository.findOne({ where: { id } });
    if (!communication) {
      throw new NotFoundException(`Communication with ID ${id} not found`);
    }
    return communication;
  }

  async create(data: any): Promise<Communication> {
    const communication = this.communicationRepository.create(data);
    const saved = await this.communicationRepository.save(communication);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async send(id: string): Promise<Communication> {
    const communication = await this.findById(id);
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

  async getCommunicationStats(caseId: string): Promise<any> {
    const communications = await this.findByCaseId(caseId);
    
    const stats = {
      total: communications.length,
      sent: communications.filter(c => c.status === 'sent').length,
      draft: communications.filter(c => c.status === 'draft').length,
      byType: communications.reduce((acc: any, comm) => {
        acc[comm.type] = (acc[comm.type] || 0) + 1;
        return acc;
      }, {}),
    };

    return stats;
  }
}
