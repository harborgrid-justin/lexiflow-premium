import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth , ApiResponse }from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ComplianceReportingService } from './compliance-reporting.service';
import {
  GenerateAccessReportDto,
  GenerateActivityReportDto,
  GenerateConflictsReportDto,
  GenerateEthicalWallsReportDto,
} from './dto/compliance-report.dto';


@Controller('compliance/reports')
export class ComplianceReportingController {
  constructor(
    private readonly reportingService: ComplianceReportingService,
  ) {}

  @Get('access')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async generateAccessReport(@Query() dto: GenerateAccessReportDto) {
    return this.reportingService.generateAccessReport(dto);
  }

  @Get('activity')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async generateActivityReport(@Query() dto: GenerateActivityReportDto) {
    return this.reportingService.generateActivityReport(dto);
  }

  @Get('conflicts')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async generateConflictsReport(@Query() dto: GenerateConflictsReportDto) {
    return this.reportingService.generateConflictsReport(dto);
  }

  @Get('ethical-walls')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async generateEthicalWallsReport(@Query() dto: GenerateEthicalWallsReportDto) {
    return this.reportingService.generateEthicalWallsReport(dto);
  }
}

