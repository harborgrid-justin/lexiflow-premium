import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Matter } from '@matters/entities/matter.entity';

export enum PredictionOutcome {
  PLAINTIFF_WIN = 'PLAINTIFF_WIN',
  DEFENDANT_WIN = 'DEFENDANT_WIN',
  SETTLEMENT = 'SETTLEMENT',
  DISMISSAL = 'DISMISSAL',
  MIXED = 'MIXED',
  UNCERTAIN = 'UNCERTAIN',
}

export interface PredictionFactor {
  id: string;
  category: string;
  description: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  weight: number;
  confidence: number;
  explanation: string;
}

export interface OutcomeProbability {
  outcome: PredictionOutcome;
  probability: number;
  confidence: number;
  reasoning: string;
}

export interface SettlementRange {
  minimum: number;
  maximum: number;
  mostLikely: number;
  confidence: number;
}

@Entity('case_predictions')
@Index(['matterId'])
@Index(['predictionDate'])
@Index(['overallConfidence'])
export class CasePrediction extends BaseEntity {
  @Column({ name: 'matter_id', type: 'uuid' })
  @Index()
  matterId!: string;

  @ManyToOne(() => Matter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matter_id' })
  matter!: Matter;

  @Column({ type: 'jsonb' })
  outcomeProbabilities!: OutcomeProbability[];

  @Column({
    type: 'enum',
    enum: PredictionOutcome,
  })
  primaryOutcome!: PredictionOutcome;

  @Column({ name: 'primary_outcome_probability', type: 'decimal', precision: 5, scale: 4 })
  primaryOutcomeProbability!: number;

  @Column({ type: 'jsonb' })
  factors!: PredictionFactor[];

  @Column({ name: 'overall_confidence', type: 'decimal', precision: 5, scale: 4 })
  overallConfidence!: number;

  @Column({ name: 'settlement_range', type: 'jsonb', nullable: true })
  settlementRange?: SettlementRange;

  @Column({ name: 'estimated_duration_months', type: 'int', nullable: true })
  estimatedDurationMonths?: number;

  @Column({ name: 'estimated_cost', type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedCost?: number;

  @Column({ name: 'similar_cases_analyzed', type: 'int', default: 0 })
  similarCasesAnalyzed!: number;

  @Column({ name: 'jurisdiction_win_rate', type: 'decimal', precision: 5, scale: 4, nullable: true })
  jurisdictionWinRate?: number;

  @Column({ name: 'judge_ruling_tendency', type: 'jsonb', nullable: true })
  judgeRulingTendency?: { favorable: number; unfavorable: number; neutral: number };

  @Column({ name: 'key_precedents', type: 'jsonb', nullable: true })
  keyPrecedents?: { caseTitle: string; citation: string; relevance: string }[];

  @Column({ name: 'prediction_date', type: 'timestamp with time zone' })
  predictionDate!: Date;

  @Column({ name: 'model_used', type: 'varchar', length: 100 })
  modelUsed!: string;

  @Column({ name: 'data_sources', type: 'jsonb', nullable: true })
  dataSources?: string[];

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'text', nullable: true })
  recommendations?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
