import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  TenantBranding,
  TenantConfig,
  TenantFeatures,
  TenantLimits,
  TenantSettings,
} from "./entities/tenant-config.entity";

export interface TenantConfigResponse {
  tenantId: string;
  name: string;
  features: TenantFeatures;
  limits: TenantLimits;
  branding: TenantBranding;
  settings: TenantSettings;
}

export interface UpdateTenantConfigDto {
  name?: string;
  features?: Partial<TenantFeatures>;
  limits?: Partial<TenantLimits>;
  branding?: Partial<TenantBranding>;
  settings?: Partial<TenantSettings>;
}

@Injectable()
export class AdminTenantService {
  private readonly logger = new Logger(AdminTenantService.name);
  private readonly DEFAULT_TENANT_ID = "default-tenant";

  constructor(
    @InjectRepository(TenantConfig)
    private readonly tenantConfigRepository: Repository<TenantConfig>
  ) {}

  private getDefaultFeatures(): TenantFeatures {
    return {
      caseManagement: true,
      discovery: true,
      legalResearch: true,
      billing: true,
      documentManagement: true,
      compliance: true,
      analytics: true,
      workflow: true,
    };
  }

  private getDefaultLimits(): TenantLimits {
    return {
      maxUsers: 100,
      maxCases: 10000,
      maxStorage: 500,
    };
  }

  private getDefaultBranding(): TenantBranding {
    return {
      primaryColor: "#3b82f6",
      logoUrl: null,
      companyName: "LexiFlow Legal Suite",
    };
  }

  private getDefaultSettings(): TenantSettings {
    return {
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY",
      currency: "USD",
    };
  }

  async getTenantConfig(tenantId?: string): Promise<TenantConfigResponse> {
    const targetTenantId = tenantId || this.DEFAULT_TENANT_ID;

    let config = await this.tenantConfigRepository.findOne({
      where: { tenantId: targetTenantId },
    });

    // If no config exists, create default one
    if (!config) {
      this.logger.log(
        `No tenant config found for ${targetTenantId}, creating default configuration`
      );
      config = await this.createDefaultConfig(targetTenantId);
    }

    return {
      tenantId: config.tenantId,
      name: config.name,
      features: config.features,
      limits: config.limits,
      branding: config.branding,
      settings: config.settings,
    };
  }

  private async createDefaultConfig(tenantId: string): Promise<TenantConfig> {
    const config = this.tenantConfigRepository.create({
      tenantId,
      name: "LexiFlow Enterprise",
      features: this.getDefaultFeatures(),
      limits: this.getDefaultLimits(),
      branding: this.getDefaultBranding(),
      settings: this.getDefaultSettings(),
      isActive: true,
    });

    return await this.tenantConfigRepository.save(config);
  }

  async updateTenantConfig(
    tenantId: string,
    dto: UpdateTenantConfigDto
  ): Promise<TenantConfigResponse> {
    let config = await this.tenantConfigRepository.findOne({
      where: { tenantId },
    });

    if (!config) {
      // Create with provided overrides
      config = await this.createDefaultConfig(tenantId);
    }

    if (dto.name) {
      config.name = dto.name;
    }

    if (dto.features) {
      config.features = { ...config.features, ...dto.features };
    }

    if (dto.limits) {
      config.limits = { ...config.limits, ...dto.limits };
    }

    if (dto.branding) {
      config.branding = { ...config.branding, ...dto.branding };
    }

    if (dto.settings) {
      config.settings = { ...config.settings, ...dto.settings };
    }

    const saved = await this.tenantConfigRepository.save(config);
    this.logger.log(`Updated tenant config for ${tenantId}`);

    return {
      tenantId: saved.tenantId,
      name: saved.name,
      features: saved.features,
      limits: saved.limits,
      branding: saved.branding,
      settings: saved.settings,
    };
  }

  async getAllTenants(): Promise<TenantConfigResponse[]> {
    const configs = await this.tenantConfigRepository.find({
      where: { isActive: true },
      order: { createdAt: "ASC" },
    });

    return configs.map((config) => ({
      tenantId: config.tenantId,
      name: config.name,
      features: config.features,
      limits: config.limits,
      branding: config.branding,
      settings: config.settings,
    }));
  }

  async deactivateTenant(tenantId: string): Promise<void> {
    const config = await this.tenantConfigRepository.findOne({
      where: { tenantId },
    });

    if (!config) {
      throw new NotFoundException(`Tenant config for ${tenantId} not found`);
    }

    config.isActive = false;
    await this.tenantConfigRepository.save(config);
    this.logger.log(`Deactivated tenant ${tenantId}`);
  }
}
