import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CitationsModule } from "../../citations/citations.module";
import { Defense } from "./entities/defense.entity";
import { LegalArgument } from "./entities/legal-argument.entity";
import { StrategiesController } from "./strategies.controller";
import { StrategiesService } from "./strategies.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([LegalArgument, Defense]),
    CitationsModule,
  ],
  controllers: [StrategiesController],
  providers: [StrategiesService],
  exports: [StrategiesService],
})
export class StrategiesModule {}
