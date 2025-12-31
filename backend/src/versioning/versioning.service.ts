import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataVersion } from './entities/data-version.entity';

/**
 * ╔=================================================================================================================╗
 * ║VERSIONING                                                                                                       ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class VersioningService {
  constructor(
    @InjectRepository(DataVersion)
    private readonly versionRepository: Repository<DataVersion>,
  ) {}

  async createVersion(data: {
    entityType: string;
    entityId: string;
    data: Record<string, unknown>;
    branch?: string;
    tag?: string;
    commitMessage?: string;
    userId?: string;
  }): Promise<DataVersion> {
    // Get current version number
    const latestVersion = await this.versionRepository.findOne({
      where: { entityType: data.entityType, entityId: data.entityId },
      order: { version: 'DESC' },
    });

    const version = this.versionRepository.create({
      ...data,
      version: (latestVersion?.version || 0) + 1,
      createdBy: data.userId || 'system',
    });

    return await this.versionRepository.save(version);
  }

  async getVersionHistory(
    entityType: string,
    entityId: string,
    filters?: { branch?: string; page?: number; limit?: number },
  ) {
    const { branch, page = 1, limit = 50 } = filters || {};

    const queryBuilder = this.versionRepository
      .createQueryBuilder('version')
      .where('version.entityType = :entityType', { entityType })
      .andWhere('version.entityId = :entityId', { entityId });

    if (branch) {
      queryBuilder.andWhere('version.branch = :branch', { branch });
    }

    const [data, total] = await queryBuilder
      .orderBy('version.version', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getVersion(id: string): Promise<DataVersion> {
    const version = await this.versionRepository.findOne({ where: { id } });
    
    if (!version) {
      throw new NotFoundException(`Version with ID ${id} not found`);
    }

    return version;
  }

  async getBranches(entityType: string, entityId: string): Promise<string[]> {
    const result = await this.versionRepository
      .createQueryBuilder('version')
      .select('DISTINCT version.branch', 'branch')
      .where('version.entityType = :entityType', { entityType })
      .andWhere('version.entityId = :entityId', { entityId })
      .andWhere('version.branch IS NOT NULL')
      .getRawMany<{ branch: string }>();

    return result.map(r => r.branch);
  }

  async getTags(entityType: string, entityId: string) {
    const versions = await this.versionRepository.find({
      where: { entityType, entityId },
      select: ['id', 'version', 'tag', 'createdAt'],
      order: { version: 'DESC' },
    });

    return versions.filter(v => v.tag).map(v => ({
      id: v.id,
      version: v.version,
      tag: v.tag,
      createdAt: v.createdAt,
    }));
  }

  async tagVersion(id: string, tag: string): Promise<DataVersion> {
    const version = await this.getVersion(id);
    version.tag = tag;
    return await this.versionRepository.save(version);
  }

  async compareVersions(id1: string, id2: string) {
    const [version1, version2] = await Promise.all([
      this.getVersion(id1),
      this.getVersion(id2),
    ]);

    return {
      version1: {
        id: version1.id,
        version: version1.version,
        data: version1.data,
        createdAt: version1.createdAt,
      },
      version2: {
        id: version2.id,
        version: version2.version,
        data: version2.data,
        createdAt: version2.createdAt,
      },
    };
  }
}
