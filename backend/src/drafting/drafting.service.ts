import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
import { DocumentStatus, DocumentType } from '../common/enums/document.enum';

@Injectable()
export class DraftingService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async getRecentDrafts(userId: string, limit: number = 5): Promise<Document[]> {
    return this.documentRepository.find({
      where: {
        creatorId: userId,
        status: DocumentStatus.DRAFT,
      },
      order: {
        updatedAt: 'DESC',
      },
      take: limit,
      relations: ['case'],
    });
  }

  async getTemplates(limit: number = 10): Promise<Document[]> {
    try {
      return this.documentRepository.find({
        where: {
          type: DocumentType.TEMPLATE,
        },
        order: {
          title: 'ASC',
        },
        take: limit,
      });
    } catch (error) {
      // If Template enum value doesn't exist in database, return empty array
      console.warn('Template enum not found in database, returning empty array');
      return [];
    }
  }

  async getPendingApprovals(userId: string): Promise<Document[]> {
    return this.documentRepository
      .createQueryBuilder('document')
      .innerJoin('document.reviewers', 'reviewer', 'reviewer.userId = :userId', { userId })
      .where('document.status = :status', { status: DocumentStatus.UNDER_REVIEW })
      .orderBy('document.updatedAt', 'DESC')
      .leftJoinAndSelect('document.creator', 'creator')
      .leftJoinAndSelect('document.case', 'case')
      .getMany();
  }

  async getStats(userId: string) {
    const draftsCount = await this.documentRepository.count({
      where: { creatorId: userId, status: DocumentStatus.DRAFT },
    });
    
    const templatesCount = await this.documentRepository.count({
      where: { type: DocumentType.TEMPLATE },
    });

    const pendingCount = await this.documentRepository.count({
      where: { status: DocumentStatus.UNDER_REVIEW },
    });

    return {
      drafts: draftsCount,
      templates: templatesCount,
      pendingReviews: pendingCount,
    };
  }
}
