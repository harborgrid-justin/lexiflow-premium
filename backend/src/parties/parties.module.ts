import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';
import { Party } from './entities/party.entity';
import { ConflictCheckService } from './conflict-check.service';

@Module({
  imports: [TypeOrmModule.forFeature([Party])],
  controllers: [PartiesController],
  providers: [PartiesService, ConflictCheckService],
  exports: [PartiesService, ConflictCheckService],
})
export class PartiesModule {}
