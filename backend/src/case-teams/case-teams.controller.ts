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
import { CaseTeamsService } from './case-teams.service';
import { CreateCaseTeamDto } from './dto/create-case-team.dto';
import { UpdateCaseTeamDto } from './dto/update-case-team.dto';
import { CaseTeamMember } from './entities/case-team.entity';

@Controller('api/v1')
export class CaseTeamsController {
  constructor(private readonly caseTeamsService: CaseTeamsService) {}

  @Get('cases/:caseId/team')
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<CaseTeamMember[]> {
    return this.caseTeamsService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/team')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCaseTeamDto: CreateCaseTeamDto): Promise<CaseTeamMember> {
    return this.caseTeamsService.create(createCaseTeamDto);
  }

  @Put('case-teams/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCaseTeamDto: UpdateCaseTeamDto,
  ): Promise<CaseTeamMember> {
    return this.caseTeamsService.update(id, updateCaseTeamDto);
  }

  @Delete('case-teams/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.caseTeamsService.remove(id);
  }
}
