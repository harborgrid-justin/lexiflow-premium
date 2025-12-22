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

  async findAll(): Promise<Party[]> {
    return this.partyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByCaseId(caseId: string): Promise<Party[]> {
    return this.partyRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
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
    await this.partyRepository.update(id, { ...updatePartyDto });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.partyRepository.softDelete(id);
  }
}
