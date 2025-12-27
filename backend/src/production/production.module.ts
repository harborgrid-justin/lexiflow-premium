import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { Production } from '../discovery/productions/entities/production.entity';

/**
 * Production Module
 * Discovery document production management
 * Features:
 * - Production requests and responses
 * - Privilege logs and redaction tracking
 * - Bates numbering and organization
 * - Production delivery and load file generation
 */
@Module({
  imports: [TypeOrmModule.forFeature([Production])],
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}
