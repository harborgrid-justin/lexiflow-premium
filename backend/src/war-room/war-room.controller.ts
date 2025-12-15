import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WarRoomService } from './war-room.service';
import { CreateAdvisorDto, CreateExpertDto, UpdateStrategyDto } from './dto/war-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('War Room')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/war-room')
export class WarRoomController {
  constructor(private readonly warRoomService: WarRoomService) {}
  @Get('advisors')
  @ApiOperation({ summary: 'Get advisors' })
  @ApiResponse({ status: 200, description: 'Advisors retrieved' })
  async getAdvisors(@Query() query: any) {
    return await this.warRoomService.findAllAdvisors(query);
  }

  @Get('advisors/:id')
  @ApiOperation({ summary: 'Get advisor by ID' })
  @ApiResponse({ status: 200, description: 'Advisor found' })
  async getAdvisor(@Param('id') id: string) {
    return await this.warRoomService.findOneAdvisor(id);
  }

  @Post('advisors')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create advisor' })
  @ApiResponse({ status: 201, description: 'Advisor created' })
  async createAdvisor(@Body() createDto: CreateAdvisorDto) {
    return await this.warRoomService.createAdvisor(createDto);
  }

  @Delete('advisors/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete advisor' })
  @ApiResponse({ status: 204, description: 'Advisor deleted' })
  async deleteAdvisor(@Param('id') id: string) {
    await this.warRoomService.removeAdvisor(id);
  }

  @Get('experts')
  @ApiOperation({ summary: 'Get expert witnesses' })
  @ApiResponse({ status: 200, description: 'Experts retrieved' })
  async getExperts(@Query() query: any) {
    return await this.warRoomService.findAllExperts(query);
  }

  @Get('experts/:id')
  @ApiOperation({ summary: 'Get expert by ID' })
  @ApiResponse({ status: 200, description: 'Expert found' })
  async getExpert(@Param('id') id: string) {
    return await this.warRoomService.findOneExpert(id);
  }

  @Post('experts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create expert' })
  @ApiResponse({ status: 201, description: 'Expert created' })
  async createExpert(@Body() createDto: CreateExpertDto) {
    return await this.warRoomService.createExpert(createDto);
  }

  @Delete('experts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete expert' })
  @ApiResponse({ status: 204, description: 'Expert deleted' })
  async deleteExpert(@Param('id') id: string) {
    await this.warRoomService.removeExpert(id);
  }

  @Get(':caseId/strategy')
  @ApiOperation({ summary: 'Get case strategy' })
  @ApiResponse({ status: 200, description: 'Strategy retrieved' })
  async getStrategy(@Param('caseId') caseId: string) {
    return await this.warRoomService.getStrategy(caseId);
  }

  @Put(':caseId/strategy')
  @ApiOperation({ summary: 'Update case strategy' })
  @ApiResponse({ status: 200, description: 'Strategy updated' })
  async updateStrategy(@Param('caseId') caseId: string, @Body() updateDto: UpdateStrategyDto) {
    return await this.warRoomService.updateStrategy(caseId, updateDto);
  }
}
