import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('War Room')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/war-room')
export class WarRoomController {
  @Get(':caseId')
  @ApiOperation({ summary: 'Get war room data for case' })
  async getData(@Param('caseId') caseId: string) {
    return {
      case: null,
      witnesses: [],
      documents: [],
      motions: [],
      docket: [],
      evidence: [],
      tasks: []
    };
  }

  @Get('advisors')
  @ApiOperation({ summary: 'Get advisors' })
  async getAdvisors(@Query('caseId') caseId?: string) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 50
    };
  }

  @Post('advisors')
  @ApiOperation({ summary: 'Create advisor' })
  async createAdvisor(@Body() createDto: any) {
    return {
      id: Date.now().toString(),
      ...createDto,
      createdAt: new Date().toISOString()
    };
  }

  @Get('experts')
  @ApiOperation({ summary: 'Get expert witnesses' })
  async getExperts(@Query('caseId') caseId?: string) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 50
    };
  }

  @Get('opposition')
  @ApiOperation({ summary: 'Get opposition counsel and parties' })
  async getOpposition(@Query('caseId') caseId?: string) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 50
    };
  }

  @Put(':caseId/strategy')
  @ApiOperation({ summary: 'Update case strategy' })
  async updateStrategy(@Param('caseId') caseId: string, @Body() strategy: any) {
    return {
      caseId,
      ...strategy,
      updatedAt: new Date().toISOString()
    };
  }
}
