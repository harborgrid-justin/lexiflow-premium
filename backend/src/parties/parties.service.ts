import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Party } from './entities/party.entity';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';

@Injectable()
export class PartiesService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
  ) {}

  async findAll(options?: { page?: number; limit?: number }): Promise<{ data: Party[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50 } = options || {};
    const skip = (page - 1) * limit;

    const [parties, total] = await this.partyRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: parties,
      total,
      page,
      limit,
    };
  }

  async findAllByCaseId(caseId: string, options?: { page?: number; limit?: number }): Promise<{ data: Party[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50 } = options || {};
    const skip = (page - 1) * limit;

    const [parties, total] = await this.partyRepository.findAndCount({
      where: { caseId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: parties,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Party> {
    const party = await this.partyRepository.findOne({
      where: { id },
    });

    if (!party) {
      throw new NotFoundException(`Party with ID ${id} not found`);
    }

    return party;
  }

  async create(createPartyDto: CreatePartyDto): Promise<Party> {
    const party = this.partyRepository.create(createPartyDto);
    return this.partyRepository.save(party);
  }

  async update(id: string, updatePartyDto: UpdatePartyDto): Promise<Party> {
    await this.findOne(id);
    const updateData: any = { ...updatePartyDto };
    if (updatePartyDto.metadata) {
      updateData.metadata = JSON.stringify(updatePartyDto.metadata);
    }
    await this.partyRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.partyRepository.softDelete(id);
  }
}
