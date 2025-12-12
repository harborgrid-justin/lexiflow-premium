import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CasePhasesService } from './case-phases.service';
import { CreateCasePhaseDto } from './dto/create-case-phase.dto';
import { UpdateCasePhaseDto } from './dto/update-case-phase.dto';
import { CasePhase } from './entities/case-phase.entity';

@Controller('api/v1')
export class CasePhasesController {
  constructor(private readonly casePhasesService: CasePhasesService) {}

  @Get('cases/:caseId/phases')
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<CasePhase[]> {
    return this.casePhasesService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/phases')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCasePhaseDto: CreateCasePhaseDto): Promise<CasePhase> {
    return this.casePhasesService.create(createCasePhaseDto);
  }

  @Put('case-phases/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCasePhaseDto: UpdateCasePhaseDto,
  ): Promise<CasePhase> {
    return this.casePhasesService.update(id, updateCasePhaseDto);
  }
}
