import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CreateStrategyItemDto } from "./dto/create-strategy-item.dto";
import { StrategiesService } from "./strategies.service";

@Controller("strategies")
export class StrategiesController {
  constructor(private readonly strategiesService: StrategiesService) {}

  @Post()
  create(@Body() createDto: CreateStrategyItemDto) {
    return this.strategiesService.create(createDto);
  }

  @Get()
  findAll(@Query("caseId") caseId: string) {
    if (!caseId) {
      return { arguments: [], defenses: [], citations: [] };
    }
    return this.strategiesService.findAll(caseId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDto: Record<string, unknown>) {
    const type =
      (updateDto.type as string) || (updateDto.strategyType as string);
    return this.strategiesService.update(id, {
      ...updateDto,
      strategyType: type,
    });
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Query("type") type: string) {
    return this.strategiesService.remove(id, type);
  }
}
