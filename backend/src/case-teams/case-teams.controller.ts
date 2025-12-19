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
import { ApiTags, ApiOperation, ApiBearerAuth , ApiResponse }from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CaseTeamsService } from './case-teams.service';
import { CreateCaseTeamDto } from './dto/create-case-team.dto';
import { UpdateCaseTeamDto } from './dto/update-case-team.dto';
import { CaseTeamMember } from './entities/case-team.entity';


@Controller('cases')
export class CaseTeamsController {
  constructor(private readonly caseTeamsService: CaseTeamsService) {}

  @Get('cases/:caseId/team')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<CaseTeamMember[]> {
    return this.caseTeamsService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/team')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createCaseTeamDto: CreateCaseTeamDto): Promise<CaseTeamMember> {
    return this.caseTeamsService.create(createCaseTeamDto);
  }

  @Put('case-teams/:id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCaseTeamDto: UpdateCaseTeamDto,
  ): Promise<CaseTeamMember> {
    return this.caseTeamsService.update(id, updateCaseTeamDto);
  }

  @Delete('case-teams/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.caseTeamsService.remove(id);
  }
}

