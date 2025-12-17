import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Jurisdiction, JurisdictionSystem } from './entities/jurisdiction.entity';
import { JurisdictionRule } from './entities/jurisdiction-rule.entity';
import { CreateJurisdictionDto } from './dto/create-jurisdiction.dto';
import { UpdateJurisdictionDto } from './dto/update-jurisdiction.dto';
import { CreateJurisdictionRuleDto } from './dto/create-jurisdiction-rule.dto';
import { UpdateJurisdictionRuleDto } from './dto/update-jurisdiction-rule.dto';

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

  async findAll(): Promise<Jurisdiction[]> {
    return this.jurisdictionRepository.find({
      relations: ['rules'],
      order: { system: 'ASC', region: 'ASC', name: 'ASC' }
    });
  }

  async findById(id: string): Promise<Jurisdiction> {
    const jurisdiction = await this.jurisdictionRepository.findOne({
      where: { id },
      relations: ['rules']
    });
    
    if (!jurisdiction) {
      throw new NotFoundException(`Jurisdiction with ID ${id} not found`);
    }
    
    return jurisdiction;
  }

  async findBySystem(system: JurisdictionSystem): Promise<Jurisdiction[]> {
    return this.jurisdictionRepository.find({
      where: { system },
      relations: ['rules'],
      order: { region: 'ASC', name: 'ASC' }
    });
  }

  async search(query: string): Promise<Jurisdiction[]> {
    return this.jurisdictionRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { code: Like(`%${query}%`) },
        { region: Like(`%${query}%`) }
      ],
      relations: ['rules'],
      order: { name: 'ASC' }
    });
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

  async findAllRules(jurisdictionId?: string): Promise<JurisdictionRule[]> {
    const where = jurisdictionId ? { jurisdictionId } : {};
    return this.ruleRepository.find({
      where,
      relations: ['jurisdiction'],
      order: { code: 'ASC' }
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

  async getMapNodes(): Promise<any[]> {
    const jurisdictions = await this.findAll();
    
    // Convert to map visualization format
    return jurisdictions.map((j, index) => ({
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
