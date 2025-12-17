import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JurisdictionsController } from './jurisdictions.controller';
import { JurisdictionsService } from './jurisdictions.service';
import { Jurisdiction } from './entities/jurisdiction.entity';
import { JurisdictionRule } from './entities/jurisdiction-rule.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Jurisdiction, JurisdictionRule]),
    AuthModule,
  ],
  controllers: [JurisdictionsController],
  providers: [JurisdictionsService],
  exports: [JurisdictionsService],
})
export class JurisdictionsModule {}
