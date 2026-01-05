import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CrmController } from "./crm.controller";
import { CrmService } from "./crm.service";
import { Lead } from "./entities/lead.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Lead])],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
