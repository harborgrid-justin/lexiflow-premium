import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocketController } from './docket.controller';
import { DocketService } from './docket.service';
import { DocketEntry } from './entities/docket-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocketEntry])],
  controllers: [DocketController],
  providers: [DocketService],
  exports: [DocketService],
})
export class DocketModule {}
