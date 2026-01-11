import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminTenantController } from "./admin-tenant.controller";
import { SecurityController } from "./security.controller";
import { DatabaseController } from "./database.controller";
import { AdminTenantService } from "./admin-tenant.service";
import { TenantConfig } from "./entities/tenant-config.entity";

/**
 * Admin Module
 * Administrative endpoints for tenant management and configuration
 * Features:
 * - Tenant configuration
 * - Feature flags
 * - System settings
 * - Usage limits
 */
@Module({
  imports: [TypeOrmModule.forFeature([TenantConfig])],
  controllers: [AdminTenantController, SecurityController, DatabaseController],
  providers: [AdminTenantService],
  exports: [AdminTenantService],
})
export class AdminModule {}
