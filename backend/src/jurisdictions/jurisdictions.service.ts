import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { Jurisdiction, JurisdictionSystem } from './entities/jurisdiction.entity';
import { JurisdictionRule } from './entities/jurisdiction-rule.entity';
import { CreateJurisdictionDto } from './dto/create-jurisdiction.dto';
import { UpdateJurisdictionDto } from './dto/update-jurisdiction.dto';
import { CreateJurisdictionRuleDto } from './dto/create-jurisdiction-rule.dto';
import { UpdateJurisdictionRuleDto } from './dto/update-jurisdiction-rule.dto';
import { JurisdictionMapNode } from './interfaces/map-node.interface';

/**
 * ╔=================================================================================================================╗
 * ║JURISDICTIONS                                                                                                    ║
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
export class JurisdictionsService {
  constructor(
    @InjectRepository(Jurisdiction)
    private jurisdictionRepository: Repository<Jurisdiction>,
    @InjectRepository(JurisdictionRule)
    private ruleRepository: Repository<JurisdictionRule>,
  ) {}

  // ============================================================================
  // JURISDICTIONS
  // ============================================================================

  async create(createDto: CreateJurisdictionDto): Promise<Jurisdiction> {
    const jurisdiction = this.jurisdictionRepository.create(createDto);
    return this.jurisdictionRepository.save(jurisdiction);
  }

  async findAll(
    page: number = 1,
    limit: number = 100,
  ): Promise<{
    data: Jurisdiction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    // Use query builder to select only existing columns
    const queryBuilder = this.jurisdictionRepository
      .createQueryBuilder('jurisdiction')
      .leftJoinAndSelect('jurisdiction.rules', 'rules')
      .select([
        'jurisdiction.id',
        'jurisdiction.name',
        'jurisdiction.system',
        'jurisdiction.type',
        'jurisdiction.region',
        'jurisdiction.description',
        'jurisdiction.website',
        'jurisdiction.code',
        'jurisdiction.metadata',
        'jurisdiction.createdAt',
        'jurisdiction.updatedAt',
        'rules.id',
        'rules.code',
        'rules.name',
        'rules.type',
        'rules.description',
        'rules.fullText',
        'rules.url',
        'rules.citations',
        'rules.effectiveDate',
        'rules.isActive'
      ])
      .orderBy('jurisdiction.system', 'ASC')
      .addOrderBy('jurisdiction.region', 'ASC')
      .addOrderBy('jurisdiction.name', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Jurisdiction> {
    const jurisdiction = await this.jurisdictionRepository
      .createQueryBuilder('jurisdiction')
      .leftJoinAndSelect('jurisdiction.rules', 'rules')
      .select([
        'jurisdiction.id',
        'jurisdiction.name',
        'jurisdiction.system',
        'jurisdiction.type',
        'jurisdiction.region',
        'jurisdiction.description',
        'jurisdiction.website',
        'jurisdiction.code',
        'jurisdiction.metadata',
        'jurisdiction.createdAt',
        'jurisdiction.updatedAt',
        'rules.id',
        'rules.code',
        'rules.name',
        'rules.type',
        'rules.description',
        'rules.fullText',
        'rules.url',
        'rules.citations',
        'rules.effectiveDate',
        'rules.isActive'
      ])
      .where('jurisdiction.id = :id', { id })
      .getOne();
    
    if (!jurisdiction) {
      throw new NotFoundException(`Jurisdiction with ID ${id} not found`);
    }
    
    return jurisdiction;
  }

  async findBySystem(system: JurisdictionSystem): Promise<Jurisdiction[]> {
    return this.jurisdictionRepository
      .createQueryBuilder('jurisdiction')
      .leftJoinAndSelect('jurisdiction.rules', 'rules')
      .select([
        'jurisdiction.id',
        'jurisdiction.name',
        'jurisdiction.system',
        'jurisdiction.type',
        'jurisdiction.region',
        'jurisdiction.description',
        'jurisdiction.website',
        'jurisdiction.code',
        'jurisdiction.metadata',
        'jurisdiction.createdAt',
        'jurisdiction.updatedAt',
        'rules.id',
        'rules.code',
        'rules.name',
        'rules.type',
        'rules.description',
        'rules.fullText',
        'rules.url',
        'rules.citations',
        'rules.effectiveDate',
        'rules.isActive'
      ])
      .where('jurisdiction.system = :system', { system })
      .orderBy('jurisdiction.region', 'ASC')
      .addOrderBy('jurisdiction.name', 'ASC')
      .getMany();
  }

  async search(query: string): Promise<Jurisdiction[]> {
    return this.jurisdictionRepository
      .createQueryBuilder('jurisdiction')
      .leftJoinAndSelect('jurisdiction.rules', 'rules')
      .select([
        'jurisdiction.id',
        'jurisdiction.name',
        'jurisdiction.system',
        'jurisdiction.type',
        'jurisdiction.region',
        'jurisdiction.description',
        'jurisdiction.website',
        'jurisdiction.code',
        'jurisdiction.metadata',
        'jurisdiction.createdAt',
        'jurisdiction.updatedAt',
        'rules.id',
        'rules.code',
        'rules.name',
        'rules.type',
        'rules.description',
        'rules.fullText',
        'rules.url',
        'rules.citations',
        'rules.effectiveDate',
        'rules.isActive'
      ])
      .where('jurisdiction.name ILIKE :query', { query: `%${query}%` })
      .orWhere('jurisdiction.code ILIKE :query', { query: `%${query}%` })
      .orWhere('jurisdiction.region ILIKE :query', { query: `%${query}%` })
      .orderBy('jurisdiction.name', 'ASC')
      .getMany();
  }

  async update(id: string, updateDto: UpdateJurisdictionDto): Promise<Jurisdiction> {
    const jurisdiction = await this.findById(id);
    Object.assign(jurisdiction, updateDto);
    return this.jurisdictionRepository.save(jurisdiction);
  }

  async remove(id: string): Promise<void> {
    const jurisdiction = await this.findById(id);
    await this.jurisdictionRepository.remove(jurisdiction);
  }

  // ============================================================================
  // RULES
  // ============================================================================

  async createRule(createDto: CreateJurisdictionRuleDto): Promise<JurisdictionRule> {
    // Verify jurisdiction exists
    await this.findById(createDto.jurisdictionId);
    
    const rule = this.ruleRepository.create(createDto);
    return this.ruleRepository.save(rule);
  }

  async findAllRules(
    jurisdictionId?: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<{
    data: JurisdictionRule[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where = jurisdictionId ? { jurisdictionId } : {};
    const skip = (page - 1) * limit;
    const [data, total] = await this.ruleRepository.findAndCount({
      where,
      relations: ['jurisdiction'],
      order: { code: 'ASC' },
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

  async getAllRules(): Promise<JurisdictionRule[]> {
    return this.ruleRepository.find({
      relations: ['jurisdiction'],
      order: { code: 'ASC' },
    });
  }

  async findRuleById(id: string): Promise<JurisdictionRule> {
    const rule = await this.ruleRepository.findOne({
      where: { id },
      relations: ['jurisdiction']
    });
    
    if (!rule) {
      throw new NotFoundException(`Rule with ID ${id} not found`);
    }
    
    return rule;
  }

  async searchRules(query: string, jurisdictionId?: string): Promise<JurisdictionRule[]> {
    const queryBuilder = this.ruleRepository
      .createQueryBuilder('rule')
      .leftJoinAndSelect('rule.jurisdiction', 'jurisdiction')
      .where('(rule.code LIKE :query OR rule.name LIKE :query OR rule.type LIKE :query)', {
        query: `%${query}%`
      });

    if (jurisdictionId) {
      queryBuilder.andWhere('rule.jurisdictionId = :jurisdictionId', { jurisdictionId });
    }

    return queryBuilder
      .orderBy('rule.code', 'ASC')
      .getMany();
  }

  async updateRule(id: string, updateDto: UpdateJurisdictionRuleDto): Promise<JurisdictionRule> {
    const rule = await this.findRuleById(id);
    Object.assign(rule, updateDto);
    return this.ruleRepository.save(rule);
  }

  async removeRule(id: string): Promise<void> {
    const rule = await this.findRuleById(id);
    await this.ruleRepository.remove(rule);
  }

  // ============================================================================
  // SPECIALIZED QUERIES
  // ============================================================================

  async getFederalCourts(): Promise<Jurisdiction[]> {
    return this.findBySystem(JurisdictionSystem.FEDERAL);
  }

  async getStateCourts(): Promise<Jurisdiction[]> {
    return this.findBySystem(JurisdictionSystem.STATE);
  }

  async getRegulatoryBodies(): Promise<Jurisdiction[]> {
    return this.findBySystem(JurisdictionSystem.REGULATORY);
  }

  async getInternationalTreaties(): Promise<Jurisdiction[]> {
    return this.findBySystem(JurisdictionSystem.INTERNATIONAL);
  }

  async getArbitrationProviders(): Promise<Jurisdiction[]> {
    return this.findBySystem(JurisdictionSystem.ARBITRATION);
  }

  async getLocalRules(): Promise<Jurisdiction[]> {
    return this.findBySystem(JurisdictionSystem.LOCAL);
  }

  async getMapNodes(): Promise<JurisdictionMapNode[]> {
    const result = await this.findAll(1, 1000); // Get all jurisdictions
    const jurisdictions = result.data;

    // Convert to map visualization format
    return jurisdictions.map((j) => ({
      id: j.id,
      label: j.code || j.name.substring(0, 15),
      type: j.system.toLowerCase(),
      system: j.system,
      fullName: j.name,
      x: Math.random() * 800,
      y: Math.random() * 600,
      radius: j.system === 'Federal' ? 35 : 25
    }));
  }
}
