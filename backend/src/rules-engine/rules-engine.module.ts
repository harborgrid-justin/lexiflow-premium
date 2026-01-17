import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Rule } from "./entities/rule.entity";
import { RulesEngineController } from "./rules-engine.controller";
import { RulesEngineService } from "./rules-engine.service";

@Module({
  imports: [TypeOrmModule.forFeature([Rule])],
  controllers: [RulesEngineController],
  providers: [RulesEngineService],
  exports: [RulesEngineService],
})
export class RulesEngineModule {}
