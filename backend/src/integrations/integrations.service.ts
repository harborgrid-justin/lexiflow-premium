import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class IntegrationsService {
  private integrations: Map<string, any> = new Map();

  findById(id: string) {
    return this.findOne(id);
  }
  
  delete(id: string) {
    return this.remove(id);
  }
  
  async connect(id: string, credentials: { accessToken: string; refreshToken: string; }) {
    const integration = await this.findOne(id);
    integration.status = 'active';
    integration.credentials = credentials;
    integration.lastSyncedAt = new Date();
    this.integrations.set(id, integration);
    return integration;
  }
  
  async disconnect(id: string) {
    const integration = await this.findOne(id);
    integration.status = 'disconnected';
    integration.credentials = null;
    this.integrations.set(id, integration);
    return integration;
  }
  
  async refreshCredentials(id: string) {
    const integration = await this.findOne(id);
    if (integration.status !== 'active') {
      throw new BadRequestException('Integration must be active to refresh credentials');
    }
    integration.credentials = { accessToken: 'refreshed-token', refreshToken: 'refreshed-refresh' };
    integration.lastSyncedAt = new Date();
    this.integrations.set(id, integration);
    return integration;
  }
  
  async sync(id: string) {
    const integration = await this.findOne(id);
    if (!integration.syncEnabled) {
      throw new BadRequestException('Sync is not enabled for this integration');
    }
    integration.lastSyncedAt = new Date();
    this.integrations.set(id, integration);
    return integration;
  }
  
  async setSyncEnabled(id: string, enabled: boolean) {
    const integration = await this.findOne(id);
    integration.syncEnabled = enabled;
    this.integrations.set(id, integration);
    return integration;
  }
  
  async updateConfig(id: string, newConfig: any) {
    const integration = await this.findOne(id);
    integration.config = newConfig;
    this.integrations.set(id, integration);
    return integration;
  }
  
  findByType(type: string) {
    return Array.from(this.integrations.values()).filter(i => i.type === type);
  }
  
  findByProvider(provider: string) {
    return Array.from(this.integrations.values()).filter(i => i.provider === provider);
  }
  
  testConnection(_id: string) {
    return { success: true, message: 'Connection successful', latency: 50 };
  }
  
  getSyncHistory(_id: string) {
    return [];
  }
  
  async findAll(): Promise<any[]> { return Array.from(this.integrations.values()); }
  async findOne(id: string): Promise<any> {
    const integration = this.integrations.get(id);
    if (!integration) {
      const { NotFoundException } = require('@nestjs/common');
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }
    return integration;
  }
  async create(createDto: any, userId: string): Promise<any> { 
    const integration = { id: 'int-' + Date.now(), ...createDto, userId };
    this.integrations.set(integration.id, integration);
    return integration;
  }
  async update(id: string, updateDto: any): Promise<any> {
    const integration = await this.findOne(id);
    const updated = {
      ...integration,
      name: updateDto.name ?? integration.name,
      type: updateDto.type ?? integration.type,
      provider: updateDto.provider ?? integration.provider,
      config: updateDto.config ?? integration.config,
    };
    this.integrations.set(id, updated);
    return updated;
  }
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    this.integrations.delete(id);
  }
}
