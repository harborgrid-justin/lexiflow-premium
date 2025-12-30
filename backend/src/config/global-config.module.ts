import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DefaultAdminConfigService } from '../core/services/default-admin-config.service';

/**
 * GlobalConfigModule
 *
 * Provides globally injectable configuration services that are available
 * across ALL modules in the application, including those loaded by CoreModule.
 *
 * This module is loaded BEFORE CoreModule in AppModule to ensure configuration
 * services are available during the initialization of all enterprise modules.
 *
 * Load Order in AppModule:
 * 1. ConfigModule.forRoot() - NestJS configuration
 * 2. GlobalConfigModule - Custom config services (THIS MODULE)
 * 3. TypeOrmModule - Database
 * 4. CoreModule - Enterprise infrastructure
 * 5. APP_IMPORTS - 40+ feature modules
 *
 * Services Provided:
 * - DefaultAdminConfigService: Access to default admin user/profile configuration
 *
 * Usage in any module:
 * @Injectable()
 * export class AnyService {
 *   constructor(private defaultAdminConfig: DefaultAdminConfigService) {}
 * }
 */
@Global()
@Module({
  imports: [
    // Ensure ConfigModule is available for ConfigService injection
    ConfigModule,
  ],
  providers: [
    DefaultAdminConfigService,
  ],
  exports: [
    DefaultAdminConfigService,
  ],
})
export class GlobalConfigModule {}
