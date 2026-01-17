import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Property } from "./entities/property.entity";
import { RealEstateController } from "./real-estate.controller";
import { RealEstateService } from "./real-estate.service";

@Module({
  imports: [TypeOrmModule.forFeature([Property])],
  controllers: [RealEstateController],
  providers: [RealEstateService],
  exports: [RealEstateService],
})
export class RealEstateModule {}
