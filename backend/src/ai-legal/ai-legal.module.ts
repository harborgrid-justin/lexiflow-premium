import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiLegalController } from './ai-legal.controller';
import { ContractAnalysisService } from './contract-analysis.service';
import { LegalBriefGeneratorService } from './legal-brief-generator.service';
import { DepositionPrepService } from './deposition-prep.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { LegalSummarizationService } from './legal-summarization.service';
import { DueDiligenceService } from './due-diligence.service';
import { ContractAnalysis } from './entities/contract-analysis.entity';
import { LegalBrief } from './entities/legal-brief.entity';
import { DepositionOutline } from './entities/deposition-outline.entity';
import { CasePrediction } from './entities/case-prediction.entity';
import { Document } from '@documents/entities/document.entity';
import { Matter } from '@matters/entities/matter.entity';

/**
 * AI Legal Assistant Module
 *
 * Comprehensive AI-powered legal assistance system including:
 *
 * SERVICES:
 * - Contract Analysis: AI-powered contract review, clause extraction, risk detection
 * - Legal Brief Generator: Automated legal brief writing with citations
 * - Deposition Prep: Strategic deposition outline generation
 * - Predictive Analytics: Case outcome prediction with probability analysis
 * - Legal Summarization: Document summarization and key point extraction
 * - Due Diligence: Comprehensive due diligence analysis and reporting
 *
 * FEATURES:
 * - GPT-4 powered analysis
 * - Production-ready TypeScript
 * - RESTful API endpoints
 * - Comprehensive entity models
 * - Input validation with DTOs
 * - Swagger documentation
 *
 * INTEGRATIONS:
 * - OpenAI API for AI capabilities
 * - TypeORM for database persistence
 * - NestJS for enterprise architecture
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractAnalysis,
      LegalBrief,
      DepositionOutline,
      CasePrediction,
      Document,
      Matter,
    ]),
    ConfigModule,
  ],
  controllers: [AiLegalController],
  providers: [
    ContractAnalysisService,
    LegalBriefGeneratorService,
    DepositionPrepService,
    PredictiveAnalyticsService,
    LegalSummarizationService,
    DueDiligenceService,
  ],
  exports: [
    ContractAnalysisService,
    LegalBriefGeneratorService,
    DepositionPrepService,
    PredictiveAnalyticsService,
    LegalSummarizationService,
    DueDiligenceService,
  ],
})
export class AiLegalModule {}
