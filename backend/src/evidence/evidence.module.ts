import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvidenceItem } from './entities/evidence-item.entity';
import { ChainOfCustodyEvent } from './entities/chain-of-custody-event.entity';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { AuthModule } from '@auth/auth.module';

/**
 * Evidence Module
 * Evidence tracking with chain of custody management
 * Features:
 * - Evidence item cataloging
 * - Chain of custody tracking
 * - Admissibility status management
 * - Exhibits and demonstratives
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([EvidenceItem, ChainOfCustodyEvent]),
    AuthModule,
  ],
  controllers: [EvidenceController],
  providers: [EvidenceService],
  exports: [EvidenceService],
})
export class EvidenceModule {}
