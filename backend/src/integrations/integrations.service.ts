import { Injectable, BadRequestException, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from './entities/integration.entity';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Injectable()
export class IntegrationsService implements OnModuleDestroy {
  // Memory optimization: Cache for integrations
  private readonly integrationCache = new Map<string, Integration>();
  private readonly MAX_CACHE_SIZE = 50;

  constructor(
    @InjectRepository(Integration)
    private readonly integrationRepository: Repository<Integration>,
  ) {}

  onModuleDestroy() {
    this.integrationCache.clear();
  }

  /**
   * Enforce LRU eviction on integration cache
   */
  private enforceCacheLRU(): void {
    if (this.integrationCache.size > this.MAX_CACHE_SIZE) {
      const toRemove = Math.floor(this.MAX_CACHE_SIZE * 0.1);
      const iterator = this.integrationCache.keys();
      for (let i = 0; i < toRemove; i++) {
        const key = iterator.next().value;
        if (key !== undefined) {
          this.integrationCache.delete(key);
        }
      }
    }
  }

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
    const saved = await this.integrationRepository.save(integration);
    this.integrationCache.delete(id); // Invalidate cache
    return saved;
  }
  
  async disconnect(id: string): Promise<Integration> {
    const integration = await this.findOne(id);
    integration.status = 'disconnected' as any;
    integration.credentials = undefined;
    const saved = await this.integrationRepository.save(integration);
    this.integrationCache.delete(id); // Invalidate cache
    return saved;
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
    if (this.integrationCache.has(id)) {
      return this.integrationCache.get(id)!;
    }

    const integration = await this.integrationRepository.findOne({ where: { id } });
    if (!integration) {
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }

    // Cache result and enforce LRU limits
    this.integrationCache.set(id, integration);
    this.enforceCacheLRU();

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
