import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RisksController } from './risks.controller';
import { RisksService } from './risks.service';
import { Risk } from './entities/risk.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Risk])],
  controllers: [RisksController],
  providers: [RisksService],
  exports: [RisksService]
})
export class RisksModule {}
