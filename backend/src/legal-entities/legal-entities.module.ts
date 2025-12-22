import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalEntitiesController } from './legal-entities.controller';
import { LegalEntitiesService } from './legal-entities.service';
import { LegalEntity } from './entities/legal-entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LegalEntity])],
  controllers: [LegalEntitiesController],
  providers: [LegalEntitiesService],
  exports: [LegalEntitiesService],
})
export class LegalEntitiesModule {}
