import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContractAnalysisService } from './contract-analysis.service';
import { LegalBriefGeneratorService } from './legal-brief-generator.service';
import { DepositionPrepService } from './deposition-prep.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { LegalSummarizationService } from './legal-summarization.service';
import { DueDiligenceService } from './due-diligence.service';
import { AnalyzeContractDto } from './dto/analyze-contract.dto';
import { GenerateBriefDto } from './dto/generate-brief.dto';
import { GenerateDepositionOutlineDto } from './dto/generate-deposition-outline.dto';
import { PredictOutcomeDto } from './dto/predict-outcome.dto';
import { SummarizeDocumentDto, ExecutiveSummaryDto } from './dto/summarize-document.dto';
import { DueDiligenceDto } from './dto/due-diligence.dto';
import { BriefStatus } from './entities/legal-brief.entity';
import { OutlineStatus } from './entities/deposition-outline.entity';

/**
 * AI Legal Assistant Controller
 *
 * Provides AI-powered legal assistance including:
 * - Contract analysis
 * - Legal brief generation
 * - Deposition preparation
 * - Case outcome prediction
 * - Document summarization
 * - Due diligence analysis
 */
@ApiTags('AI Legal Assistant')
@Controller('ai-legal')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when authentication is ready
export class AiLegalController {
  constructor(
    private readonly contractAnalysisService: ContractAnalysisService,
    private readonly briefGeneratorService: LegalBriefGeneratorService,
    private readonly depositionPrepService: DepositionPrepService,
    private readonly predictiveAnalyticsService: PredictiveAnalyticsService,
    private readonly summarizationService: LegalSummarizationService,
    private readonly dueDiligenceService: DueDiligenceService,
  ) {}

  // ==================== Contract Analysis ====================

  @Post('contracts/analyze')
  @ApiOperation({ summary: 'Analyze a contract document' })
  @ApiResponse({ status: 201, description: 'Contract analysis completed successfully' })
  async analyzeContract(@Body() dto: AnalyzeContractDto, @Request() req: any) {
    const userId = req.user?.id || 'system';
    return this.contractAnalysisService.analyzeContract(dto.documentId, userId);
  }

  @Get('contracts/analyses')
  @ApiOperation({ summary: 'Get all contract analyses' })
  @ApiResponse({ status: 200, description: 'Contract analyses retrieved successfully' })
  async getAllAnalyses(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.contractAnalysisService.getAllAnalyses(page, limit);
  }

  @Get('contracts/analyses/:id')
  @ApiOperation({ summary: 'Get contract analysis by ID' })
  @ApiResponse({ status: 200, description: 'Contract analysis retrieved successfully' })
  async getAnalysisById(@Param('id') id: string) {
    return this.contractAnalysisService.getAnalysisById(id);
  }

  @Get('contracts/high-risk')
  @ApiOperation({ summary: 'Get high-risk contracts' })
  @ApiResponse({ status: 200, description: 'High-risk contracts retrieved successfully' })
  async getHighRiskContracts() {
    return this.contractAnalysisService.getHighRiskContracts();
  }

  @Get('contracts/statistics')
  @ApiOperation({ summary: 'Get contract analysis statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getContractStatistics() {
    return this.contractAnalysisService.getStatistics();
  }

  @Delete('contracts/analyses/:id')
  @ApiOperation({ summary: 'Delete contract analysis' })
  @ApiResponse({ status: 200, description: 'Analysis deleted successfully' })
  async deleteAnalysis(@Param('id') id: string) {
    await this.contractAnalysisService.deleteAnalysis(id);
    return { message: 'Analysis deleted successfully' };
  }

  // ==================== Legal Briefs ====================

  @Post('briefs/generate')
  @ApiOperation({ summary: 'Generate a legal brief' })
  @ApiResponse({ status: 201, description: 'Legal brief generated successfully' })
  async generateBrief(@Body() dto: GenerateBriefDto, @Request() req: any) {
    const userId = req.user?.id || 'system';
    return this.briefGeneratorService.generateBrief(
      {
        matterId: dto.matterId,
        briefType: dto.briefType,
        title: dto.title,
        facts: dto.facts,
        legalIssues: dto.legalIssues,
        jurisdiction: dto.jurisdiction,
        court: dto.court,
        precedents: dto.precedents,
      },
      userId,
    );
  }

  @Get('briefs')
  @ApiOperation({ summary: 'Get briefs by matter ID' })
  @ApiResponse({ status: 200, description: 'Briefs retrieved successfully' })
  async getBriefsByMatter(@Query('matterId') matterId: string) {
    return this.briefGeneratorService.getBriefsByMatterId(matterId);
  }

  @Get('briefs/:id')
  @ApiOperation({ summary: 'Get brief by ID' })
  @ApiResponse({ status: 200, description: 'Brief retrieved successfully' })
  async getBriefById(@Param('id') id: string) {
    return this.briefGeneratorService.getBriefById(id);
  }

  @Patch('briefs/:id/status')
  @ApiOperation({ summary: 'Update brief status' })
  @ApiResponse({ status: 200, description: 'Brief status updated successfully' })
  async updateBriefStatus(
    @Param('id') id: string,
    @Body('status') status: BriefStatus,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.briefGeneratorService.updateBriefStatus(id, status, userId);
  }

  @Patch('briefs/:id')
  @ApiOperation({ summary: 'Update brief' })
  @ApiResponse({ status: 200, description: 'Brief updated successfully' })
  async updateBrief(
    @Param('id') id: string,
    @Body() updates: any,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.briefGeneratorService.updateBrief(id, updates, userId);
  }

  @Delete('briefs/:id')
  @ApiOperation({ summary: 'Delete brief' })
  @ApiResponse({ status: 200, description: 'Brief deleted successfully' })
  async deleteBrief(@Param('id') id: string) {
    await this.briefGeneratorService.deleteBrief(id);
    return { message: 'Brief deleted successfully' };
  }

  @Get('briefs-statistics')
  @ApiOperation({ summary: 'Get brief statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getBriefStatistics() {
    return this.briefGeneratorService.getStatistics();
  }

  // ==================== Deposition Preparation ====================

  @Post('depositions/generate-outline')
  @ApiOperation({ summary: 'Generate deposition outline' })
  @ApiResponse({ status: 201, description: 'Deposition outline generated successfully' })
  async generateDepositionOutline(
    @Body() dto: GenerateDepositionOutlineDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.depositionPrepService.generateOutline(
      {
        matterId: dto.matterId,
        witnessName: dto.witnessName,
        witnessRole: dto.witnessRole,
        witnessAffiliation: dto.witnessAffiliation,
        caseBackground: dto.caseBackground,
        keyFacts: dto.keyFacts,
        objectives: dto.objectives,
        availableExhibits: dto.availableExhibits,
      },
      userId,
    );
  }

  @Get('depositions/outlines')
  @ApiOperation({ summary: 'Get deposition outlines by matter ID' })
  @ApiResponse({ status: 200, description: 'Outlines retrieved successfully' })
  async getDepositionOutlinesByMatter(@Query('matterId') matterId: string) {
    return this.depositionPrepService.getOutlinesByMatterId(matterId);
  }

  @Get('depositions/outlines/:id')
  @ApiOperation({ summary: 'Get deposition outline by ID' })
  @ApiResponse({ status: 200, description: 'Outline retrieved successfully' })
  async getDepositionOutlineById(@Param('id') id: string) {
    return this.depositionPrepService.getOutlineById(id);
  }

  @Patch('depositions/outlines/:id/status')
  @ApiOperation({ summary: 'Update outline status' })
  @ApiResponse({ status: 200, description: 'Outline status updated successfully' })
  async updateOutlineStatus(
    @Param('id') id: string,
    @Body('status') status: OutlineStatus,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.depositionPrepService.updateOutlineStatus(id, status, userId);
  }

  @Patch('depositions/outlines/:id')
  @ApiOperation({ summary: 'Update deposition outline' })
  @ApiResponse({ status: 200, description: 'Outline updated successfully' })
  async updateOutline(
    @Param('id') id: string,
    @Body() updates: any,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.depositionPrepService.updateOutline(id, updates, userId);
  }

  @Delete('depositions/outlines/:id')
  @ApiOperation({ summary: 'Delete deposition outline' })
  @ApiResponse({ status: 200, description: 'Outline deleted successfully' })
  async deleteOutline(@Param('id') id: string) {
    await this.depositionPrepService.deleteOutline(id);
    return { message: 'Outline deleted successfully' };
  }

  @Get('depositions/statistics')
  @ApiOperation({ summary: 'Get deposition statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getDepositionStatistics() {
    return this.depositionPrepService.getStatistics();
  }

  // ==================== Predictive Analytics ====================

  @Post('predictions/predict-outcome')
  @ApiOperation({ summary: 'Predict case outcome' })
  @ApiResponse({ status: 201, description: 'Prediction generated successfully' })
  async predictOutcome(@Body() dto: PredictOutcomeDto, @Request() req: any) {
    const userId = req.user?.id || 'system';
    return this.predictiveAnalyticsService.predictOutcome(
      {
        matterId: dto.matterId,
        caseType: dto.caseType,
        jurisdiction: dto.jurisdiction,
        facts: dto.facts,
        legalIssues: dto.legalIssues,
        evidenceStrength: dto.evidenceStrength,
        opposingPartyStrength: dto.opposingPartyStrength,
        estimatedValue: dto.estimatedValue,
        judge: dto.judge,
        precedents: dto.precedents,
      },
      userId,
    );
  }

  @Get('predictions')
  @ApiOperation({ summary: 'Get predictions by matter ID' })
  @ApiResponse({ status: 200, description: 'Predictions retrieved successfully' })
  async getPredictionsByMatter(@Query('matterId') matterId: string) {
    return this.predictiveAnalyticsService.getPredictionsByMatterId(matterId);
  }

  @Get('predictions/:id')
  @ApiOperation({ summary: 'Get prediction by ID' })
  @ApiResponse({ status: 200, description: 'Prediction retrieved successfully' })
  async getPredictionById(@Param('id') id: string) {
    return this.predictiveAnalyticsService.getPredictionById(id);
  }

  @Get('predictions/compare/:matterId')
  @ApiOperation({ summary: 'Compare predictions over time' })
  @ApiResponse({ status: 200, description: 'Prediction comparison retrieved successfully' })
  async comparePredictions(@Param('matterId') matterId: string) {
    return this.predictiveAnalyticsService.comparePredictions(matterId);
  }

  @Delete('predictions/:id')
  @ApiOperation({ summary: 'Delete prediction' })
  @ApiResponse({ status: 200, description: 'Prediction deleted successfully' })
  async deletePrediction(@Param('id') id: string) {
    await this.predictiveAnalyticsService.deletePrediction(id);
    return { message: 'Prediction deleted successfully' };
  }

  @Get('predictions-statistics')
  @ApiOperation({ summary: 'Get prediction statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getPredictionStatistics() {
    return this.predictiveAnalyticsService.getStatistics();
  }

  // ==================== Document Summarization ====================

  @Post('summarization/summarize')
  @ApiOperation({ summary: 'Summarize a document' })
  @ApiResponse({ status: 201, description: 'Document summarized successfully' })
  async summarizeDocument(@Body() dto: SummarizeDocumentDto, @Request() req: any) {
    const userId = req.user?.id || 'system';
    return this.summarizationService.summarizeDocument(dto, userId);
  }

  @Post('summarization/executive-summary')
  @ApiOperation({ summary: 'Generate executive summary' })
  @ApiResponse({ status: 201, description: 'Executive summary generated successfully' })
  async generateExecutiveSummary(@Body() dto: ExecutiveSummaryDto, @Request() req: any) {
    const userId = req.user?.id || 'system';
    return this.summarizationService.generateExecutiveSummary(
      dto.documentIds,
      dto.caseTitle,
      userId,
    );
  }

  @Post('summarization/extract-clauses/:documentId')
  @ApiOperation({ summary: 'Extract key clauses from document' })
  @ApiResponse({ status: 200, description: 'Clauses extracted successfully' })
  async extractKeyClauses(@Param('documentId') documentId: string) {
    return this.summarizationService.extractKeyClauses(documentId);
  }

  @Post('summarization/compare')
  @ApiOperation({ summary: 'Compare two documents' })
  @ApiResponse({ status: 200, description: 'Documents compared successfully' })
  async compareDocuments(
    @Body('documentId1') documentId1: string,
    @Body('documentId2') documentId2: string,
  ) {
    return this.summarizationService.compareDocuments(documentId1, documentId2);
  }

  // ==================== Due Diligence ====================

  @Post('due-diligence/analyze')
  @ApiOperation({ summary: 'Conduct due diligence analysis' })
  @ApiResponse({ status: 201, description: 'Due diligence analysis completed successfully' })
  async conductDueDiligence(@Body() dto: DueDiligenceDto) {
    return this.dueDiligenceService.conductDueDiligence({
      entityName: dto.entityName,
      entityType: dto.entityType,
      jurisdiction: dto.jurisdiction,
      transactionType: dto.transactionType,
      documentsProvided: dto.documentsProvided,
      specificConcerns: dto.specificConcerns,
    });
  }

  @Post('due-diligence/quick-assessment')
  @ApiOperation({ summary: 'Quick risk assessment' })
  @ApiResponse({ status: 200, description: 'Quick assessment completed successfully' })
  async quickRiskAssessment(
    @Body('entityName') entityName: string,
    @Body('entityType') entityType: string,
    @Body('keyInfo') keyInfo: string,
  ) {
    return this.dueDiligenceService.quickRiskAssessment(entityName, entityType, keyInfo);
  }
}
