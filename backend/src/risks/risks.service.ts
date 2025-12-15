import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Risk } from './entities/risk.entity';
import { CreateRiskDto, RiskImpact, RiskProbability } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';

@Injectable()
export class RisksService {
  constructor(
    @InjectRepository(Risk)
    private readonly riskRepository: Repository<Risk>,
  ) {}

  async create(createRiskDto: CreateRiskDto): Promise<Risk> {
    // Auto-calculate risk score if not provided
    if (!createRiskDto.riskScore) {
      createRiskDto.riskScore = this.calculateRiskScore(createRiskDto.impact, createRiskDto.probability);
    }

    const risk = this.riskRepository.create(createRiskDto);
    return await this.riskRepository.save(risk);
  }

  async findAll(filters: {
    status?: string;
    impact?: RiskImpact;
    probability?: RiskProbability;
    caseId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, impact, probability, caseId, page = 1, limit = 50 } = filters;
    
    const where: FindOptionsWhere<Risk> = {};
    if (status) where.status = status as any;
    if (impact) where.impact = impact;
    if (probability) where.probability = probability;
    if (caseId) where.caseId = caseId;

    const [data, total] = await this.riskRepository.findAndCount({
      where,
      order: { riskScore: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
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

  async findOne(id: string): Promise<Risk> {
    const risk = await this.riskRepository.findOne({ where: { id } });
    
    if (!risk) {
      throw new NotFoundException(`Risk with ID ${id} not found`);
    }

    return risk;
  }

  async update(id: string, updateRiskDto: UpdateRiskDto): Promise<Risk> {
    const risk = await this.findOne(id);

    // Recalculate risk score if impact or probability changed
    if ((updateRiskDto.impact || updateRiskDto.probability) && !updateRiskDto.riskScore) {
      const impact = updateRiskDto.impact || risk.impact;
      const probability = updateRiskDto.probability || risk.probability;
      updateRiskDto.riskScore = this.calculateRiskScore(impact, probability);
    }

    Object.assign(risk, updateRiskDto);
    return await this.riskRepository.save(risk);
  }

  async remove(id: string): Promise<void> {
    const risk = await this.findOne(id);
    await this.riskRepository.remove(risk);
  }

  async getHeatmap(caseId?: string) {
    const where: FindOptionsWhere<Risk> = caseId ? { caseId } : {};
    const risks = await this.riskRepository.find({ where });

    const heatmap = [];
    const impacts = Object.values(RiskImpact);
    const probabilities = Object.values(RiskProbability);

    for (const impact of impacts) {
      for (const probability of probabilities) {
        const count = risks.filter(r => r.impact === impact && r.probability === probability).length;
        if (count > 0) {
          heatmap.push({ impact, probability, count });
        }
      }
    }

    return heatmap;
  }

  private calculateRiskScore(impact: RiskImpact, probability: RiskProbability): number {
    const impactScores = { Low: 1, Medium: 2, High: 3, Critical: 4 };
    const probabilityScores = { Low: 1, Medium: 2, High: 3 };
    
    const score = (impactScores[impact] * probabilityScores[probability]) * 0.833;
    return Math.round(score * 10) / 10;
  }
}
