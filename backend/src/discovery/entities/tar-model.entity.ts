import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { DiscoveryProject } from './discovery-project.entity';

export enum TARModelStatus {
  TRAINING = 'training',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum TARModelType {
  CAL = 'cal', // Continuous Active Learning
  SAL = 'sal', // Simple Active Learning
  RANDOM_SAMPLE = 'random_sample',
  KEYWORD_SEED = 'keyword_seed',
  HYBRID = 'hybrid',
}

@Entity('tar_models')
@Index(['projectId'])
@Index(['status'])
@Index(['createdAt'])
export class TARModel extends BaseEntity {
  @Column({ name: 'project_id', type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => DiscoveryProject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: DiscoveryProject;

  @Column({ name: 'model_name', type: 'varchar', length: 300 })
  modelName!: string;

  @Column({ name: 'model_version', type: 'varchar', length: 50 })
  modelVersion!: string;

  @Column({
    name: 'model_type',
    type: 'enum',
    enum: TARModelType,
    default: TARModelType.CAL,
  })
  modelType!: TARModelType;

  @Column({
    type: 'enum',
    enum: TARModelStatus,
    default: TARModelStatus.TRAINING,
  })
  status!: TARModelStatus;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'training_documents', type: 'jsonb', nullable: true })
  trainingDocuments!: Array<{
    documentId: string;
    batesNumber: string;
    label: string;
    reviewer: string;
    reviewDate: Date;
    confidence?: number;
  }>;

  @Column({ name: 'total_training_docs', type: 'int', default: 0 })
  totalTrainingDocs!: number;

  @Column({ name: 'positive_training_docs', type: 'int', default: 0 })
  positiveTrainingDocs!: number;

  @Column({ name: 'negative_training_docs', type: 'int', default: 0 })
  negativeTrainingDocs!: number;

  @Column({ name: 'seed_keywords', type: 'jsonb', nullable: true })
  seedKeywords!: string[];

  @Column({ name: 'current_precision', type: 'decimal', precision: 5, scale: 4, nullable: true })
  currentPrecision!: number;

  @Column({ name: 'current_recall', type: 'decimal', precision: 5, scale: 4, nullable: true })
  currentRecall!: number;

  @Column({ name: 'f1_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
  f1Score!: number;

  @Column({ name: 'accuracy', type: 'decimal', precision: 5, scale: 4, nullable: true })
  accuracy!: number;

  @Column({ name: 'target_recall', type: 'decimal', precision: 5, scale: 4, default: 0.75 })
  targetRecall!: number;

  @Column({ name: 'target_precision', type: 'decimal', precision: 5, scale: 4, default: 0.70 })
  targetPrecision!: number;

  @Column({ name: 'confidence_threshold', type: 'decimal', precision: 5, scale: 4, default: 0.50 })
  confidenceThreshold!: number;

  @Column({ name: 'documents_scored', type: 'int', default: 0 })
  documentsScored!: number;

  @Column({ name: 'documents_above_threshold', type: 'int', default: 0 })
  documentsAboveThreshold!: number;

  @Column({ name: 'documents_below_threshold', type: 'int', default: 0 })
  documentsBelowThreshold!: number;

  @Column({ name: 'current_iteration', type: 'int', default: 0 })
  currentIteration!: number;

  @Column({ name: 'max_iterations', type: 'int', default: 20 })
  maxIterations!: number;

  @Column({ name: 'batch_size', type: 'int', default: 100 })
  batchSize!: number;

  @Column({ name: 'stabilization_threshold', type: 'decimal', precision: 5, scale: 4, default: 0.02 })
  stabilizationThreshold!: number;

  @Column({ name: 'is_stabilized', type: 'boolean', default: false })
  isStabilized!: boolean;

  @Column({ name: 'stabilization_date', type: 'timestamp', nullable: true })
  stabilizationDate!: Date;

  @Column({ name: 'model_parameters', type: 'jsonb', nullable: true })
  modelParameters!: {
    algorithm?: string;
    vectorizer?: string;
    features?: string[];
    hyperparameters?: Record<string, unknown>;
  };

  @Column({ name: 'feature_importance', type: 'jsonb', nullable: true })
  featureImportance!: Array<{
    feature: string;
    importance: number;
  }>;

  @Column({ name: 'performance_history', type: 'jsonb', nullable: true })
  performanceHistory!: Array<{
    iteration: number;
    date: Date;
    precision: number;
    recall: number;
    f1Score: number;
    accuracy: number;
    trainingDocsAdded: number;
  }>;

  @Column({ name: 'validation_results', type: 'jsonb', nullable: true })
  validationResults!: {
    validationSetSize?: number;
    validationPrecision?: number;
    validationRecall?: number;
    validationF1?: number;
    confusionMatrix?: {
      truePositives: number;
      falsePositives: number;
      trueNegatives: number;
      falseNegatives: number;
    };
  };

  @Column({ name: 'last_training_date', type: 'timestamp', nullable: true })
  lastTrainingDate!: Date;

  @Column({ name: 'last_scoring_date', type: 'timestamp', nullable: true })
  lastScoringDate!: Date;

  @Column({ name: 'model_file_path', type: 'varchar', length: 1000, nullable: true })
  modelFilePath!: string;

  @Column({ name: 'training_data_path', type: 'varchar', length: 1000, nullable: true })
  trainingDataPath!: string;

  @Column({ name: 'trained_by', type: 'uuid', nullable: true })
  trainedBy!: string;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string;

  @Column({ name: 'approval_date', type: 'timestamp', nullable: true })
  approvalDate!: Date;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
