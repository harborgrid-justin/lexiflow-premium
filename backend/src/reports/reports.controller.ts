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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
  GenerateReportDto,
  ReportDto,
  ReportListDto,
  ReportTemplateDto,
  DownloadReportDto,
} from './dto/reports.dto';

@ApiTags('Reports')
@Controller('api/v1/reports')
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
  async getTemplates(): Promise<ReportTemplateDto[]> {
    return this.reportsService.getReportTemplates();
  }

  @Get()
  @ApiOperation({ summary: 'Get list of generated reports' })
  @ApiResponse({
    status: 200,
    description: 'Reports list retrieved successfully',
    type: ReportListDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
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
  async generateReport(@Body() dto: GenerateReportDto): Promise<ReportDto> {
    // In production, get userId from JWT token
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
  async deleteReport(@Param('id') id: string): Promise<void> {
    return this.reportsService.deleteReport(id);
  }
}
