import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitationsController } from './citations.controller';
import { CitationsService } from './citations.service';
import { Citation } from './entities/citation.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * Citations Module
 * Manages legal citations, case references, and legal authority linking
 * Provides citation validation, extraction, and formatting services
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Citation]),
    AuthModule
  ],
  controllers: [CitationsController],
  providers: [CitationsService],
  exports: [CitationsService]
})
export class CitationsModule {}
