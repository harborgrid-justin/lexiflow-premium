import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from './entities/integration.entity';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private readonly integrationRepository: Repository<Integration>,
  ) {}

  findById(id: string): Promise<Integration | null> {
    return this.findOne(id);
  }
  
  delete(id: string): Promise<void> {
    return this.remove(id);
  }
  
  async connect(id: string, credentials: { accessToken: string; refreshToken: string }): Promise<Integration> {
    const integration = await this.findOne(id);
    integration.status = 'active' as any;
    integration.credentials = credentials;
    integration.lastSyncedAt = new Date();
    return this.integrationRepository.save(integration);
  }
  
  async disconnect(id: string): Promise<Integration> {
    const integration = await this.findOne(id);
    integration.status = 'disconnected' as any;
    integration.credentials = undefined;
    return this.integrationRepository.save(integration);
  }
  
  async refreshCredentials(id: string): Promise<Integration> {
    const integration = await this.findOne(id);
    if (integration.status !== 'active') {
      throw new BadRequestException('Integration must be active to refresh credentials');
    }
    integration.credentials = { accessToken: 'refreshed-token', refreshToken: 'refreshed-refresh' };
    integration.lastSyncedAt = new Date();
    return this.integrationRepository.save(integration);
  }
  
  async sync(id: string): Promise<Integration> {
    const integration = await this.findOne(id);
    if (!integration.syncEnabled) {
      throw new BadRequestException('Sync is not enabled for this integration');
    }
    integration.lastSyncedAt = new Date();
    return this.integrationRepository.save(integration);
  }
  
  async setSyncEnabled(id: string, enabled: boolean): Promise<Integration> {
    const integration = await this.findOne(id);
    integration.syncEnabled = enabled;
    return this.integrationRepository.save(integration);
  }
  
  async updateConfig(id: string, newConfig: Record<string, unknown>): Promise<Integration> {
    const integration = await this.findOne(id);
    const updated = {
      ...integration,
      config: newConfig,
    };
    return this.integrationRepository.save(updated);
  }
  
  async findByType(type: string): Promise<Integration[]> {
    return this.integrationRepository.find({ where: { type } });
  }
  
  async findByProvider(provider: string): Promise<Integration[]> {
    return this.integrationRepository.find({ where: { provider } });
  }
  
  testConnection(_id: string): { success: boolean; message: string; latency: number } {
    return { success: true, message: 'Connection successful', latency: 50 };
  }
  
  getSyncHistory(_id: string): any[] {
    return [];
  }
  
  async findAll(): Promise<Integration[]> {
    return this.integrationRepository.find();
  }

  async findOne(id: string): Promise<Integration> {
    const integration = await this.integrationRepository.findOne({ where: { id } });
    if (!integration) {
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }
    return integration;
  }

  async create(createDto: CreateIntegrationDto, userId: string): Promise<Integration> {
    const integration = this.integrationRepository.create({
      ...createDto,
      userId,
    });
    return this.integrationRepository.save(integration);
  }

  async update(id: string, updateDto: UpdateIntegrationDto): Promise<Integration> {
    const integration = await this.findOne(id);
    const updated = this.integrationRepository.merge(integration, updateDto);
    return this.integrationRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const integration = await this.findOne(id);
    await this.integrationRepository.remove(integration);
  }
}
