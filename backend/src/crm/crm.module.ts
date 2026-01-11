import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CrmController } from "./crm.controller";
import { CrmService } from "./crm.service";
import { Lead } from "./entities/lead.entity";
import { Opportunity } from "./entities/opportunity.entity";
import { ClientRelationship } from "./entities/client-relationship.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Opportunity, ClientRelationship])],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
