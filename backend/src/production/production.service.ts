import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Production, ProductionStatus } from './entities/production.entity';
import { CreateProductionDto, UpdateProductionDto } from './dto';

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);

  constructor(
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
  ) {}

  async create(createProductionDto: CreateProductionDto): Promise<Production> {
    const production = this.productionRepository.create(createProductionDto);
    return this.productionRepository.save(production);
  }

  async findAll(): Promise<Production[]> {
    return this.productionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Production> {
    const production = await this.productionRepository.findOne({
      where: { id },
    });

    if (!production) {
      throw new NotFoundException(`Production with ID ${id} not found`);
    }

    return production;
  }

  async findByCaseId(caseId: string): Promise<Production[]> {
    return this.productionRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: ProductionStatus): Promise<Production[]> {
    return this.productionRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateProductionDto: UpdateProductionDto): Promise<Production> {
    await this.findOne(id);
    await this.productionRepository.update(id, updateProductionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const production = await this.findOne(id);
    await this.productionRepository.delete(id);
    this.logger.log(`Production ${production.name} deleted`);
  }

  async updateStatus(id: string, status: ProductionStatus): Promise<Production> {
    await this.findOne(id);
    await this.productionRepository.update(id, { status });
    return this.findOne(id);
  }

  async getStatistics(caseId: string): Promise<any> {
    const productions = await this.findByCaseId(caseId);
    
    const stats = {
      total: productions.length,
      byStatus: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
      },
      totalDocuments: 0,
      totalPages: 0,
      totalSize: 0,
    };

    productions.forEach(prod => {
      stats.byStatus[prod.status]++;
      stats.totalDocuments += prod.totalDocuments;
      stats.totalPages += prod.totalPages;
      stats.totalSize += Number(prod.totalSize);
    });

    return stats;
  }
}
