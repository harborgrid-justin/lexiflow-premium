import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitationsController } from './citations.controller';
import { CitationsService } from './citations.service';
import { Citation } from './entities/citation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Citation])],
  controllers: [CitationsController],
  providers: [CitationsService],
  exports: [CitationsService]
})
export class CitationsModule {}
