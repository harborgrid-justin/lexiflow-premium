import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PleadingsController } from './pleadings.controller';
import { PleadingsService } from './pleadings.service';
import { Pleading } from './entities/pleading.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pleading])],
  controllers: [PleadingsController],
  providers: [PleadingsService],
  exports: [PleadingsService],
})
export class PleadingsModule {}
