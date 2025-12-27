import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

/**
 * Users Module
 * User account management and authentication
 * Features:
 * - User profile management
 * - Role-based access control (RBAC)
 * - User preferences and settings
 * - Activity tracking and audit logs
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
