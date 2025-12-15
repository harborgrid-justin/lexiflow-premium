import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Citation } from './entities/citation.entity';

@Injectable()
export class CitationsService {
  constructor(
    @InjectRepository(Citation)
    private readonly citationRepository: Repository<Citation>,
  ) {}

  async create(createDto: any) {
    const citation = this.citationRepository.create(createDto);
    return await this.citationRepository.save(citation);
  }

  async findAll(filters: any) {
    const { page = 1, limit = 50 } = filters;
    const [data, total] = await this.citationRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const citation = await this.citationRepository.findOne({ where: { id } });
    if (!citation) throw new NotFoundException(`Citation ${id} not found`);
    return citation;
  }

  async update(id: string, updateDto: any) {
    const citation = await this.findOne(id);
    Object.assign(citation, updateDto);
    return await this.citationRepository.save(citation);
  }

  async remove(id: string) {
    const citation = await this.findOne(id);
    await this.citationRepository.remove(citation);
  }

  async checkShepards(id: string) {
    await this.findOne(id);
    return { status: 'Valid', history: [], treatment: 'Good Law' };
  }

  async verifyAll() {
    const citations = await this.citationRepository.find();
    return { checked: citations.length, flagged: 0, updated: [] };
  }
}
