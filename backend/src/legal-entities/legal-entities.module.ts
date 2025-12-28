import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { LegalEntitiesController } from './legal-entities.controller';
import { LegalEntitiesService } from './legal-entities.service';
import { LegalEntity } from './entities/legal-entity.entity';

/**
 * Legal Entities Module
 * Business entities, corporations, and organizations in legal matters
 * Features:
 * - Corporate entity profiles
 * - Entity relationship mapping
 * - Corporate structure visualization
 * - Entity compliance and filings tracking
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([LegalEntity]),
    PassportModule,
  ],
  controllers: [LegalEntitiesController],
  providers: [LegalEntitiesService],
  exports: [LegalEntitiesService],
})
export class LegalEntitiesModule {}
