import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvidenceItem } from './entities/evidence-item.entity';
import { ChainOfCustodyEvent } from './entities/chain-of-custody-event.entity';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { AuthModule } from '../auth/auth.module';

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
