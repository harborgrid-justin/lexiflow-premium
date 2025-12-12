import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeAgreementsController } from './fee-agreements.controller';
import { FeeAgreementsService } from './fee-agreements.service';
import { FeeAgreement } from './entities/fee-agreement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeeAgreement])],
  controllers: [FeeAgreementsController],
  providers: [FeeAgreementsService],
  exports: [FeeAgreementsService],
})
export class FeeAgreementsModule {}
