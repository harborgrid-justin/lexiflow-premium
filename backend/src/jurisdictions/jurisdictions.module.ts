import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JurisdictionsController } from './jurisdictions.controller';
import { JurisdictionsService } from './jurisdictions.service';
import { Jurisdiction } from './entities/jurisdiction.entity';
import { JurisdictionRule } from './entities/jurisdiction-rule.entity';
import { DeadlineRule } from './entities/deadline-rule.entity';
import { AuthModule } from '@auth/auth.module';

/**
 * Jurisdictions Module
 * Court jurisdiction and procedural rules management
 * Features:
 * - Federal, state, and local court rules
 * - Filing requirements and deadlines
 * - Deadline calculation rules with business days support
 * - Service of process rules
 * - Jurisdiction-specific compliance checks
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Jurisdiction, JurisdictionRule, DeadlineRule]),
    AuthModule,
  ],
  controllers: [JurisdictionsController],
  providers: [JurisdictionsService],
  exports: [JurisdictionsService],
})
export class JurisdictionsModule {}
