import { IsString, IsOptional, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PredictedOutcome {
  PLAINTIFF_WIN = 'plaintiff_win',
  DEFENDANT_WIN = 'defendant_win',
  SETTLEMENT = 'settlement',
  DISMISSAL = 'dismissal',
  UNCERTAIN = 'uncertain',
}

export enum ConfidenceLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export class OutcomePredictionDto {
  @ApiProperty({ description: 'Case ID' })
  caseId!: string;

  @ApiProperty({ description: 'Predicted outcome', enum: PredictedOutcome })
  predictedOutcome!: PredictedOutcome;

  @ApiProperty({ description: 'Confidence level', enum: ConfidenceLevel })
  confidenceLevel!: ConfidenceLevel;

  @ApiProperty({ description: 'Confidence score (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceScore!: number;

  @ApiProperty({ description: 'Probability breakdown by outcome' })
  probabilities: {
    [key in PredictedOutcome]: number;
  };

  @ApiProperty({ description: 'Factors influencing the prediction' })
  influencingFactors!: InfluencingFactor[];

  @ApiProperty({ description: 'Similar historical cases analyzed' })
  similarCasesCount!: number;

  @ApiProperty({ description: 'Predicted settlement range (if applicable)' })
  settlementRange?: {
    min: number;
    max: number;
    median: number;
  };

  @ApiProperty({ description: 'Predicted duration in days' })
  predictedDuration?: number;

  @ApiProperty({ description: 'Risk factors' })
  riskFactors!: RiskFactor[];

  @ApiProperty({ description: 'Recommendation summary' })
  recommendations!: string[];

  @ApiProperty({ description: 'Model version used' })
  modelVersion!: string;

  @ApiProperty({ description: 'Analysis timestamp' })
  analyzedAt!: Date;
}

export class InfluencingFactor {
  @ApiProperty({ description: 'Factor name' })
  name!: string;

  @ApiProperty({ description: 'Factor description' })
  description!: string;

  @ApiProperty({ description: 'Impact weight (-1 to 1)' })
  @IsNumber()
  @Min(-1)
  @Max(1)
  weight!: number;

  @ApiProperty({ description: 'Impact direction' })
  impact: 'positive' | 'negative' | 'neutral';

  @ApiProperty({ description: 'Explanation' })
  explanation!: string;
}

export class RiskFactor {
  @ApiProperty({ description: 'Risk category' })
  category!: string;

  @ApiProperty({ description: 'Risk level' })
  level: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'Risk description' })
  description!: string;

  @ApiProperty({ description: 'Mitigation strategies' })
  mitigationStrategies?: string[];

  @ApiProperty({ description: 'Probability percentage' })
  probability!: number;
}

export class AnalyzeOutcomeDto {
  @ApiProperty({
    description: 'Case ID to analyze',
  })
  @IsString()
  caseId!: string;

  @ApiPropertyOptional({
    description: 'Include detailed factor analysis',
    default: true,
  })
  @IsOptional()
  includeDetails?: boolean = true;

  @ApiPropertyOptional({
    description: 'Number of similar cases to consider',
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(500)
  similarCasesLimit?: number = 100;

  @ApiPropertyOptional({
    description: 'Additional factors to consider',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalFactors?: string[];
}

export class SimilarCaseDto {
  @ApiProperty({ description: 'Case ID' })
  caseId!: string;

  @ApiProperty({ description: 'Case number' })
  caseNumber!: string;

  @ApiProperty({ description: 'Case title' })
  title!: string;

  @ApiProperty({ description: 'Similarity score (0-100)' })
  similarityScore!: number;

  @ApiProperty({ description: 'Actual outcome' })
  outcome!: string;

  @ApiProperty({ description: 'Duration in days' })
  duration!: number;

  @ApiProperty({ description: 'Settlement amount (if applicable)' })
  settlementAmount?: number;

  @ApiProperty({ description: 'Matching factors' })
  matchingFactors!: string[];

  @ApiProperty({ description: 'Judge name' })
  judge?: string;

  @ApiProperty({ description: 'Court' })
  court?: string;
}

export class PredictionAccuracyDto {
  @ApiProperty({ description: 'Overall accuracy percentage' })
  overallAccuracy!: number;

  @ApiProperty({ description: 'Accuracy by confidence level' })
  accuracyByConfidence: {
    [key in ConfidenceLevel]: {
      predictions: number;
      correct: number;
      accuracy: number;
    };
  };

  @ApiProperty({ description: 'Accuracy by outcome type' })
  accuracyByOutcome: {
    [key in PredictedOutcome]: {
      predictions: number;
      correct: number;
      accuracy: number;
    };
  };

  @ApiProperty({ description: 'Total predictions made' })
  totalPredictions!: number;

  @ApiProperty({ description: 'Total validated predictions' })
  validatedPredictions!: number;

  @ApiProperty({ description: 'Last model update' })
  lastModelUpdate!: Date;
}
