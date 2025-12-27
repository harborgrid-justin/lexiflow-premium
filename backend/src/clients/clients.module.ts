import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';

/**
 * Clients Module
 * Client relationship management (CRM) for law firms
 * Features:
 * - Client profiles and contact information
 * - Client-matter relationships
 * - Conflict checks and intake workflows
 * - Client communication history
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService]
})
export class ClientsModule {}
