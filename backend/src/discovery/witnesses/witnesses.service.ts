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

  async findAll(): Promise<Witness[]> {
    return this.witnessRepository.find({
      order: { name: 'ASC' },
    });
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
    const witness = await this.findOne(id);
    Object.assign(witness, updateData);
    return this.witnessRepository.save(witness);
  }

  async remove(id: string): Promise<void> {
    const witness = await this.findOne(id);
    await this.witnessRepository.remove(witness);
  }

  async updateStatus(id: string, status: WitnessStatus): Promise<Witness> {
    return this.update(id, { status });
  }
}
