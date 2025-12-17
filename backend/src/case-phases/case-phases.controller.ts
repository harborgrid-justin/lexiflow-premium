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
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CasePhasesService } from './case-phases.service';
import { CreateCasePhaseDto } from './dto/create-case-phase.dto';
import { UpdateCasePhaseDto } from './dto/update-case-phase.dto';
import { CasePhase } from './entities/case-phase.entity';

@ApiTags('Case Phases')
@ApiBearerAuth('JWT-auth')
@Public() // Allow public access for development
@Controller('case-phases')
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

  @Get('case-phases/:id')
  async findOne(@Param('id') id: string): Promise<CasePhase> {
    return this.casePhasesService.findOne(id);
  }

  @Put('case-phases/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCasePhaseDto: UpdateCasePhaseDto,
  ): Promise<CasePhase> {
    return this.casePhasesService.update(id, updateCasePhaseDto);
  }

  @Delete('case-phases/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.casePhasesService.remove(id);
  }
}

