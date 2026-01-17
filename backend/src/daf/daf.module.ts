import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DafController } from "./daf.controller";
import { DafService } from "./daf.service";
import { DafOperation } from "./entities/daf-operation.entity";

@Module({
  imports: [TypeOrmModule.forFeature([DafOperation])],
  controllers: [DafController],
  providers: [DafService],
  exports: [DafService],
})
export class DafModule {}
