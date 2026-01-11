import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connector } from './entities/connector.entity';
import { CreateConnectorDto, UpdateConnectorDto } from './dto/create-connector.dto';

@Injectable()
export class ConnectorsService {
  constructor(
    @InjectRepository(Connector)
    private readonly connectorRepository: Repository<Connector>,
  ) {}

  async create(createConnectorDto: CreateConnectorDto): Promise<Connector> {
    const connector = this.connectorRepository.create(createConnectorDto);
    return await this.connectorRepository.save(connector);
  }

  async findAll(): Promise<Connector[]> {
    return await this.connectorRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Connector> {
    const connector = await this.connectorRepository.findOne({ where: { id } });
    if (!connector) {
      throw new NotFoundException(`Connector with ID ${id} not found`);
    }
    return connector;
  }

  async update(id: string, updateConnectorDto: UpdateConnectorDto): Promise<Connector> {
    const connector = await this.findOne(id);
    Object.assign(connector, updateConnectorDto);
    return await this.connectorRepository.save(connector);
  }

  async remove(id: string): Promise<void> {
    const connector = await this.findOne(id);
    await this.connectorRepository.remove(connector);
  }
}
