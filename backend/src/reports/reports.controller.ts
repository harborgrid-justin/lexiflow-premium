import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
 }from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
  GenerateReportDto,
  ReportDto,
  ReportListDto,
  ReportTemplateDto,
  DownloadReportDto,
} from './dto/reports.dto';

@ApiTags('Reports')

@Controller('reports')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is available
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get list of available report templates' })
  @ApiResponse({
    status: 200,
    description: 'Report templates retrieved successfully',
    type: [ReportTemplateDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTemplates(): Promise<ReportTemplateDto[]> {
    return this.reportsService.getReportTemplates();
  }

  @Get()
  @ApiOperation({ summary: 'Get list of generated reports' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(): Promise<any[]> {
    return this.reportsService.findAll();
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get reports by type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByType(@Param('type') type: string): Promise<any[]> {
    return this.reportsService.findByType(type);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getTemplateById(@Param('id') id: string): Promise<any> {
    return this.reportsService.getTemplateById(id);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createTemplate(@Body() createDto: any, @Query('userId') userId: string): Promise<any> {
    return this.reportsService.createTemplate(createDto, userId);
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule recurring report' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async scheduleReport(@Body() scheduleDto: any, @Query('userId') userId: string): Promise<any> {
    return this.reportsService.scheduleReport(scheduleDto, userId);
  }

  @Get('scheduled/:userId')
  @ApiOperation({ summary: 'Get scheduled reports for user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getScheduledReports(@Param('userId') userId: string): Promise<any[]> {
    return this.reportsService.getScheduledReports(userId);
  }

  @Delete('scheduled/:id')
  @ApiOperation({ summary: 'Cancel scheduled report' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async cancelScheduledReport(@Param('id') id: string, @Query('userId') userId: string): Promise<void> {
    return this.reportsService.cancelScheduledReport(id, userId);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get report generation status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getReportStatus(@Param('id') id: string): Promise<any> {
    return this.reportsService.getReportStatus(id);
  }

  @Post(':id/export')
  @ApiOperation({ summary: 'Export report in different format' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async exportReport(@Param('id') id: string, @Body() exportDto: { format: string }): Promise<any> {
    return this.reportsService.exportReport(id, exportDto.format as any);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get list of generated reports (legacy)' })
  @ApiResponse({
    status: 200,
    description: 'Reports list retrieved successfully',
    type: ReportListDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getReports(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ReportListDto> {
    return this.reportsService.getReports(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific report by ID' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully',
    type: ReportDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getReport(@Param('id') id: string): Promise<ReportDto> {
    return this.reportsService.getReportById(id);
  }

  @Post('generate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate a new report' })
  @ApiResponse({
    status: 202,
    description: 'Report generation initiated',
    type: ReportDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async generate(@Body() dto: GenerateReportDto, @Query('userId') userId: string): Promise<ReportDto> {
    return this.reportsService.generateReport(dto, userId || 'current-user');
  }

  @Post('generateReport')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate a new report (alias)' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async generateReport(@Body() dto: GenerateReportDto): Promise<ReportDto> {
    const userId = 'current-user';
    return this.reportsService.generateReport(dto, userId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download URL for a generated report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({
    status: 200,
    description: 'Download URL retrieved successfully',
    type: DownloadReportDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async download(@Param('id') id: string): Promise<DownloadReportDto> {
    return this.reportsService.getDownloadUrl(id);
  }

  @Get(':id/getDownloadUrl')
  @ApiOperation({ summary: 'Get download URL (alias)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getDownloadUrl(@Param('id') id: string): Promise<DownloadReportDto> {
    return this.reportsService.getDownloadUrl(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({
    status: 204,
    description: 'Report deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteReport(@Param('id') id: string): Promise<void> {
    return this.reportsService.deleteReport(id);
  }
}

