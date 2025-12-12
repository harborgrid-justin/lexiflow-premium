import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OutcomePredictionsService } from './outcome-predictions.service';
import {
  OutcomePredictionDto,
  AnalyzeOutcomeDto,
  SimilarCaseDto,
  PredictionAccuracyDto,
} from './dto/outcome-predictions.dto';

@ApiTags('Analytics - Outcome Predictions')
@Controller('api/v1/analytics/outcome-predictions')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is available
@ApiBearerAuth()
export class OutcomePredictionsController {
  constructor(
    private readonly outcomePredictionsService: OutcomePredictionsService,
  ) {}

  @Get(':caseId')
  @ApiOperation({ summary: 'Get outcome prediction for a case' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({
    status: 200,
    description: 'Outcome prediction retrieved successfully',
    type: OutcomePredictionDto,
  })
  async getPrediction(
    @Param('caseId') caseId: string,
  ): Promise<OutcomePredictionDto> {
    return this.outcomePredictionsService.getPrediction(caseId);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze case and generate new prediction' })
  @ApiResponse({
    status: 200,
    description: 'Case analyzed and prediction generated',
    type: OutcomePredictionDto,
  })
  async analyzeCase(@Body() dto: AnalyzeOutcomeDto): Promise<OutcomePredictionDto> {
    return this.outcomePredictionsService.analyzeCase(dto);
  }

  @Get(':caseId/similar-cases')
  @ApiOperation({ summary: 'Get similar historical cases' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({
    status: 200,
    description: 'Similar cases retrieved successfully',
    type: [SimilarCaseDto],
  })
  async getSimilarCases(
    @Param('caseId') caseId: string,
    @Query('limit') limit?: number,
  ): Promise<SimilarCaseDto[]> {
    return this.outcomePredictionsService.getSimilarCases(caseId, limit);
  }

  @Get('model/accuracy')
  @ApiOperation({ summary: 'Get prediction model accuracy metrics' })
  @ApiResponse({
    status: 200,
    description: 'Model accuracy metrics retrieved successfully',
    type: PredictionAccuracyDto,
  })
  async getPredictionAccuracy(): Promise<PredictionAccuracyDto> {
    return this.outcomePredictionsService.getPredictionAccuracy();
  }
}
