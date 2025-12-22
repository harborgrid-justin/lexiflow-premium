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
import { ApiTags, ApiBearerAuth, ApiResponse }from '@nestjs/swagger';
import { CasePhasesService } from './case-phases.service';
import { CreateCasePhaseDto } from './dto/create-case-phase.dto';
import { UpdateCasePhaseDto } from './dto/update-case-phase.dto';
import { CasePhase } from './entities/case-phase.entity';

@ApiTags('Case Phases')
@ApiBearerAuth('JWT-auth')

@Controller('case-phases')
export class CasePhasesController {
  constructor(private readonly casePhasesService: CasePhasesService) {}

  @Get('cases/:caseId/phases')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<CasePhase[]> {
    return this.casePhasesService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/phases')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createCasePhaseDto: CreateCasePhaseDto): Promise<CasePhase> {
    return this.casePhasesService.create(createCasePhaseDto);
  }

  @Get('case-phases/:id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string): Promise<CasePhase> {
    return this.casePhasesService.findOne(id);
  }

  @Put('case-phases/:id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCasePhaseDto: UpdateCasePhaseDto,
  ): Promise<CasePhase> {
    return this.casePhasesService.update(id, updateCasePhaseDto);
  }

  @Delete('case-phases/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.casePhasesService.remove(id);
  }
}

