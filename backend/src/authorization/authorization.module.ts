import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role.permission.entity';
import { PermissionService } from './services/permission.service';
import { PolicyService } from './services/policy.service';
import { ResourceAccessGuard } from './guards/resource.access.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      RolePermission,
    ]),
  ],
  providers: [
    PermissionService,
    PolicyService,
    ResourceAccessGuard,
  ],
  exports: [
    PermissionService,
    PolicyService,
    ResourceAccessGuard,
    TypeOrmModule,
  ],
})
export class AuthorizationModule {}
