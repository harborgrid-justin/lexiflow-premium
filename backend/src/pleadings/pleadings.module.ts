import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PleadingsController } from './pleadings.controller';
import { PleadingsService } from './pleadings.service';
import { Pleading } from './entities/pleading.entity';
import { PleadingTemplate } from './entities/pleading-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pleading, PleadingTemplate])],
  controllers: [PleadingsController],
  providers: [PleadingsService],
  exports: [PleadingsService],
})
export class PleadingsModule {}
