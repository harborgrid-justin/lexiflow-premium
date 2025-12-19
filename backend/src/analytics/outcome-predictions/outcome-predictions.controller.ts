import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
 }from '@nestjs/swagger';
import { OutcomePredictionsService } from './outcome-predictions.service';
import {
  OutcomePredictionDto,
  AnalyzeOutcomeDto,
  SimilarCaseDto,
  PredictionAccuracyDto,
} from './dto/outcome-predictions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Analytics - Outcome Predictions')

@Controller('analytics/outcome-predictions')
@UseGuards(JwtAuthGuard)
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPredictionAccuracy(): Promise<PredictionAccuracyDto> {
    return this.outcomePredictionsService.getPredictionAccuracy();
  }
}

