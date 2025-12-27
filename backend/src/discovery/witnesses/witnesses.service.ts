import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Witness, WitnessType, WitnessStatus } from './entities/witness.entity';

@Injectable()
export class WitnessesService {
  constructor(
    @InjectRepository(Witness)
    private readonly witnessRepository: Repository<Witness>,
  ) {}

  async create(witnessData: Partial<Witness>): Promise<Witness> {
    const witness = this.witnessRepository.create(witnessData);
    return this.witnessRepository.save(witness);
  }

  async findAll(page = 1, limit = 50): Promise<{ items: Witness[]; total: number; page: number; limit: number; totalPages: number }> {
    const [items, total] = await this.witnessRepository.findAndCount({
      order: { name: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Witness> {
    const witness = await this.witnessRepository.findOne({
      where: { id },
    });

    if (!witness) {
      throw new NotFoundException(`Witness with ID ${id} not found`);
    }

    return witness;
  }

  async findByCase(caseId: string): Promise<Witness[]> {
    return this.witnessRepository.find({
      where: { caseId },
      order: { name: 'ASC' },
      cache: {
        id: `witnesses_case_${caseId}`,
        milliseconds: 120000, // 2 minutes
      },
    });
  }

  async findByType(witnessType: WitnessType): Promise<Witness[]> {
    return this.witnessRepository.find({
      where: { witnessType },
      order: { name: 'ASC' },
    });
  }

  async findByStatus(status: WitnessStatus): Promise<Witness[]> {
    return this.witnessRepository.find({
      where: { status },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateData: Partial<Witness>): Promise<Witness> {
    const result = await this.witnessRepository
      .createQueryBuilder()
      .update(Witness)
      .set(updateData)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    if (!result.affected) {
      throw new NotFoundException(`Witness with ID ${id} not found`);
    }
    return result.raw[0];
  }

  async remove(id: string): Promise<void> {
    const result = await this.witnessRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute();

    if (!result.affected) {
      throw new NotFoundException(`Witness with ID ${id} not found`);
    }
  }

  async updateStatus(id: string, status: WitnessStatus): Promise<Witness> {
    return this.update(id, { status });
  }
}
