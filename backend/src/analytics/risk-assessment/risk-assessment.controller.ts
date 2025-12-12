import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RiskAssessmentService } from './risk-assessment.service';

@ApiTags('Analytics - Risk Assessment')
@Controller('api/v1/analytics/risk-assessment')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
export class RiskAssessmentController {
  constructor(private readonly riskAssessmentService: RiskAssessmentService) {}

  @Get('cases/:caseId')
  @ApiOperation({ summary: 'Get risk assessment for a case' })
  async getCaseRiskAssessment(@Param('caseId') caseId: string) {
    return this.riskAssessmentService.assessCaseRisk(caseId);
  }
}
