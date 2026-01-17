import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PracticeArea } from "./entities/practice-area.entity";
import { PracticeController } from "./practice.controller";
import { PracticeService } from "./practice.service";

@Module({
  imports: [TypeOrmModule.forFeature([PracticeArea])],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule {}
