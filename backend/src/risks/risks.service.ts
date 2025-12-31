import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Risk } from './entities/risk.entity';
import { CreateRiskDto, RiskImpact, RiskProbability } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { validatePagination, validateSortField, validateSortOrder} from '@common/utils/query-validation.util';
import { calculateOffset, calculateTotalPages } from '@common/utils/math.utils';

/**
 * ╔=================================================================================================================╗
 * ║RISKS                                                                                                            ║
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
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, impact, probability, caseId, sortBy, sortOrder } = filters;
    const { page, limit } = validatePagination(filters.page, filters.limit);
    
    const queryBuilder = this.riskRepository.createQueryBuilder('risk');
    
    if (status) queryBuilder.andWhere('risk.status = :status', { status });
    if (impact) queryBuilder.andWhere('risk.impact = :impact', { impact });
    if (probability) queryBuilder.andWhere('risk.probability = :probability', { probability });
    if (caseId) queryBuilder.andWhere('risk.caseId = :caseId', { caseId });

    const safeSortField = validateSortField('risk', sortBy, 'riskScore');
    const safeSortOrder = validateSortOrder(sortOrder, 'DESC');

    const [data, total] = await queryBuilder
      .orderBy(`risk.${safeSortField}`, safeSortOrder)
      .skip(calculateOffset(page, limit))
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: calculateTotalPages(total, limit),
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
