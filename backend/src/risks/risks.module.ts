import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RisksController } from "./risks.controller";
import { StrategiesController } from "./strategies.controller";
import { RisksService } from "./risks.service";
import { Risk } from "./entities/risk.entity";

/**
 * Risks Module
 * Legal risk assessment and mitigation tracking
 * Features:
 * - Risk identification and categorization
 * - Risk scoring (probability × impact)
 * - Mitigation strategy tracking
 * - Risk reporting and dashboards
 */
@Module({
  imports: [TypeOrmModule.forFeature([Risk])],
  controllers: [RisksController, StrategiesController],
  providers: [RisksService],
  exports: [RisksService],
})
export class RisksModule {}
