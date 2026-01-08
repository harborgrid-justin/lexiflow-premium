import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscoveryProject } from './entities/discovery-project.entity';
import { ReviewDocument, ResponsivenessCode } from './entities/review-document.entity';
import { TARModel, TARModelStatus, TARModelType } from './entities/tar-model.entity';

export interface TrainingDocument {
  documentId: string;
  batesNumber: string;
  label: 'responsive' | 'non_responsive';
  reviewer: string;
  reviewDate: Date;
}

export interface TARPrediction {
  documentId: string;
  batesNumber: string;
  score: number;
  prediction: 'responsive' | 'non_responsive';
  confidence: number;
}

export interface TARMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
}

@Injectable()
export class TARService {
  private readonly logger = new Logger(TARService.name);

  constructor(
    @InjectRepository(DiscoveryProject)
    private readonly projectRepository: Repository<DiscoveryProject>,
    @InjectRepository(ReviewDocument)
    private readonly documentRepository: Repository<ReviewDocument>,
    @InjectRepository(TARModel)
    private readonly tarModelRepository: Repository<TARModel>,
  ) {}

  /**
   * Create a new TAR model for a project
   */
  async createTARModel(
    projectId: string,
    modelName: string,
    modelType: TARModelType = TARModelType.CAL,
    seedKeywords?: string[],
    userId?: string,
  ): Promise<TARModel> {
    this.logger.log(`Creating TAR model for project ${projectId}`);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Discovery project ${projectId} not found`);
    }

    const model = this.tarModelRepository.create({
      projectId,
      modelName,
      modelType,
      modelVersion: '1.0',
      status: TARModelStatus.TRAINING,
      seedKeywords: seedKeywords || [],
      trainingDocuments: [],
      totalTrainingDocs: 0,
      positiveTrainingDocs: 0,
      negativeTrainingDocs: 0,
      currentIteration: 0,
      documentsScored: 0,
      documentsAboveThreshold: 0,
      documentsBelowThreshold: 0,
      performanceHistory: [],
      createdBy: userId,
    });

    const saved = await this.tarModelRepository.save(model);

    // Update project
    project.tarEnabled = true;
    project.tarModelId = saved.id;
    project.updatedBy = userId;
    await this.projectRepository.save(project);

    return saved;
  }

  /**
   * Add training documents to the model
   */
  async addTrainingDocuments(
    modelId: string,
    trainingDocs: TrainingDocument[],
    userId?: string,
  ): Promise<TARModel> {
    this.logger.log(`Adding ${trainingDocs.length} training documents to model ${modelId}`);

    const model = await this.tarModelRepository.findOne({
      where: { id: modelId },
    });

    if (!model) {
      throw new NotFoundException(`TAR model ${modelId} not found`);
    }

    // Add training documents
    const existingDocs = model.trainingDocuments || [];
    const newDocs = trainingDocs.map((doc) => ({
      documentId: doc.documentId,
      batesNumber: doc.batesNumber,
      label: doc.label,
      reviewer: doc.reviewer,
      reviewDate: doc.reviewDate,
    }));

    model.trainingDocuments = [...existingDocs, ...newDocs];
    model.totalTrainingDocs = model.trainingDocuments.length;
    model.positiveTrainingDocs = model.trainingDocuments.filter(
      (doc) => doc.label === 'responsive',
    ).length;
    model.negativeTrainingDocs = model.trainingDocuments.filter(
      (doc) => doc.label === 'non_responsive',
    ).length;
    model.updatedBy = userId;

    return this.tarModelRepository.save(model);
  }

  /**
   * Train the TAR model
   */
  async trainModel(modelId: string, userId?: string): Promise<TARModel> {
    this.logger.log(`Training TAR model ${modelId}`);

    const model = await this.tarModelRepository.findOne({
      where: { id: modelId },
    });

    if (!model) {
      throw new NotFoundException(`TAR model ${modelId} not found`);
    }

    if (!model.trainingDocuments || model.trainingDocuments.length < 10) {
      throw new BadRequestException(
        'Insufficient training documents. At least 10 documents are required.',
      );
    }

    const positiveCount = model.positiveTrainingDocs;
    const negativeCount = model.negativeTrainingDocs;

    if (positiveCount < 5 || negativeCount < 5) {
      throw new BadRequestException(
        'Insufficient training balance. At least 5 positive and 5 negative examples are required.',
      );
    }

    // In a real implementation, this would:
    // 1. Extract features from training documents (TF-IDF, word embeddings, etc.)
    // 2. Train a machine learning model (SVM, Logistic Regression, Random Forest, etc.)
    // 3. Evaluate model performance using cross-validation
    // 4. Save model weights and parameters

    // Simulated training
    const metrics = this.simulateModelTraining(model);

    // Update model with training results
    model.currentPrecision = metrics.precision;
    model.currentRecall = metrics.recall;
    model.f1Score = metrics.f1Score;
    model.accuracy = metrics.accuracy;
    model.currentIteration = (model.currentIteration || 0) + 1;
    model.lastTrainingDate = new Date();
    model.trainedBy = userId;
    model.updatedBy = userId;

    // Add to performance history
    const history = model.performanceHistory || [];
    history.push({
      iteration: model.currentIteration,
      date: new Date(),
      precision: metrics.precision,
      recall: metrics.recall,
      f1Score: metrics.f1Score,
      accuracy: metrics.accuracy,
      trainingDocsAdded: model.totalTrainingDocs,
    });
    model.performanceHistory = history;

    // Check if model has stabilized
    if (this.isModelStabilized(history, model.stabilizationThreshold)) {
      model.isStabilized = true;
      model.stabilizationDate = new Date();
      model.status = TARModelStatus.ACTIVE;
    }

    return this.tarModelRepository.save(model);
  }

  /**
   * Score documents using the TAR model
   */
  async scoreDocuments(
    modelId: string,
    documentIds?: string[],
    userId?: string,
  ): Promise<TARPrediction[]> {
    this.logger.log(`Scoring documents with TAR model ${modelId}`);

    const model = await this.tarModelRepository.findOne({
      where: { id: modelId },
    });

    if (!model) {
      throw new NotFoundException(`TAR model ${modelId} not found`);
    }

    if (!model.lastTrainingDate) {
      throw new BadRequestException('Model has not been trained yet');
    }

    // Get documents to score
    const whereClause: any = { projectId: model.projectId };
    if (documentIds && documentIds.length > 0) {
      whereClause.id = documentIds;
    }

    const documents = await this.documentRepository.find({
      where: whereClause,
    });

    // In a real implementation, this would:
    // 1. Extract features from documents
    // 2. Load trained model
    // 3. Generate predictions and confidence scores
    // 4. Update documents with TAR scores

    const predictions: TARPrediction[] = [];

    for (const doc of documents) {
      // Simulated prediction
      const score = this.simulateDocumentScore(doc, model);
      const prediction: TARPrediction = {
        documentId: doc.id,
        batesNumber: doc.batesNumber,
        score,
        prediction: score >= model.confidenceThreshold ? 'responsive' : 'non_responsive',
        confidence: score,
      };

      predictions.push(prediction);

      // Update document with TAR score
      await this.documentRepository.update(doc.id, {
        tarScore: score,
        tarPrediction: prediction.prediction,
        tarModelVersion: model.modelVersion,
        updatedBy: userId,
      });
    }

    // Update model statistics
    const aboveThreshold = predictions.filter(
      (p) => p.score >= model.confidenceThreshold,
    ).length;
    const belowThreshold = predictions.filter(
      (p) => p.score < model.confidenceThreshold,
    ).length;

    model.documentsScored = (model.documentsScored || 0) + predictions.length;
    model.documentsAboveThreshold = aboveThreshold;
    model.documentsBelowThreshold = belowThreshold;
    model.lastScoringDate = new Date();
    model.updatedBy = userId;

    await this.tarModelRepository.save(model);

    return predictions;
  }

  /**
   * Get active learning suggestions (documents for manual review)
   */
  async getActiveLearningCandidates(
    modelId: string,
    count: number = 50,
  ): Promise<ReviewDocument[]> {
    this.logger.log(`Getting active learning candidates for model ${modelId}`);

    const model = await this.tarModelRepository.findOne({
      where: { id: modelId },
    });

    if (!model) {
      throw new NotFoundException(`TAR model ${modelId} not found`);
    }

    // Get documents with scores closest to the threshold (most uncertain)
    const documents = await this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.projectId = :projectId', { projectId: model.projectId })
      .andWhere('doc.tarScore IS NOT NULL')
      .andWhere('doc.reviewStatus = :status', { status: 'not_started' })
      .orderBy(`ABS(doc.tarScore - ${model.confidenceThreshold})`, 'ASC')
      .limit(count)
      .getMany();

    return documents;
  }

  /**
   * Validate TAR model performance
   */
  async validateModel(
    modelId: string,
    validationSetSize: number = 100,
  ): Promise<TARMetrics> {
    this.logger.log(`Validating TAR model ${modelId}`);

    const model = await this.tarModelRepository.findOne({
      where: { id: modelId },
    });

    if (!model) {
      throw new NotFoundException(`TAR model ${modelId} not found`);
    }

    // Get validation set (already reviewed documents not in training set)
    const trainingDocIds = model.trainingDocuments?.map((doc) => doc.documentId) || [];

    const validationDocs = await this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.projectId = :projectId', { projectId: model.projectId })
      .andWhere('doc.reviewStatus IN (:...statuses)', {
        statuses: ['reviewed', 'qc_complete'],
      })
      .andWhere('doc.id NOT IN (:...trainingIds)', {
        trainingIds: trainingDocIds.length > 0 ? trainingDocIds : [''],
      })
      .limit(validationSetSize)
      .getMany();

    // Calculate metrics
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    validationDocs.forEach((doc) => {
      const actualResponsive =
        doc.responsivenessCode === ResponsivenessCode.RESPONSIVE ||
        doc.responsivenessCode === ResponsivenessCode.PARTIALLY_RESPONSIVE;

      const predictedResponsive =
        doc.tarScore !== null && doc.tarScore >= model.confidenceThreshold;

      if (actualResponsive && predictedResponsive) {
        truePositives++;
      } else if (!actualResponsive && predictedResponsive) {
        falsePositives++;
      } else if (!actualResponsive && !predictedResponsive) {
        trueNegatives++;
      } else if (actualResponsive && !predictedResponsive) {
        falseNegatives++;
      }
    });

    const precision =
      truePositives + falsePositives > 0
        ? truePositives / (truePositives + falsePositives)
        : 0;

    const recall =
      truePositives + falseNegatives > 0
        ? truePositives / (truePositives + falseNegatives)
        : 0;

    const f1Score =
      precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    const accuracy =
      validationDocs.length > 0
        ? (truePositives + trueNegatives) / validationDocs.length
        : 0;

    const metrics: TARMetrics = {
      precision,
      recall,
      f1Score,
      accuracy,
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
    };

    // Update model with validation results
    model.validationResults = {
      validationSetSize: validationDocs.length,
      validationPrecision: precision,
      validationRecall: recall,
      validationF1: f1Score,
      confusionMatrix: {
        truePositives,
        falsePositives,
        trueNegatives,
        falseNegatives,
      },
    };

    await this.tarModelRepository.save(model);

    return metrics;
  }

  /**
   * Get TAR model statistics
   */
  async getModelStatistics(modelId: string): Promise<{
    model: TARModel;
    metrics: TARMetrics | null;
    coverageEstimate: number;
    reviewReduction: number;
  }> {
    const model = await this.tarModelRepository.findOne({
      where: { id: modelId },
    });

    if (!model) {
      throw new NotFoundException(`TAR model ${modelId} not found`);
    }

    // Get metrics from validation results
    const metrics: TARMetrics | null = model.validationResults
      ? {
          precision: model.validationResults.validationPrecision || 0,
          recall: model.validationResults.validationRecall || 0,
          f1Score: model.validationResults.validationF1 || 0,
          accuracy: 0,
          truePositives: model.validationResults.confusionMatrix?.truePositives || 0,
          falsePositives: model.validationResults.confusionMatrix?.falsePositives || 0,
          trueNegatives: model.validationResults.confusionMatrix?.trueNegatives || 0,
          falseNegatives: model.validationResults.confusionMatrix?.falseNegatives || 0,
        }
      : null;

    // Estimate coverage and review reduction
    const totalDocs = await this.documentRepository.count({
      where: { projectId: model.projectId },
    });

    const scoredDocs = model.documentsScored || 0;
    const coverageEstimate = totalDocs > 0 ? (scoredDocs / totalDocs) * 100 : 0;

    const estimatedNonResponsive = model.documentsBelowThreshold || 0;
    const reviewReduction = totalDocs > 0 ? (estimatedNonResponsive / totalDocs) * 100 : 0;

    return {
      model,
      metrics,
      coverageEstimate,
      reviewReduction,
    };
  }

  // Helper methods

  private simulateModelTraining(model: TARModel): TARMetrics {
    // Simulate training - in production this would be real ML training
    const baseAccuracy = 0.75 + Math.random() * 0.15;
    const precision = 0.70 + Math.random() * 0.20;
    const recall = 0.75 + Math.random() * 0.15;
    const f1Score = (2 * precision * recall) / (precision + recall);

    return {
      precision,
      recall,
      f1Score,
      accuracy: baseAccuracy,
      truePositives: Math.floor(model.positiveTrainingDocs * recall),
      falsePositives: Math.floor(model.negativeTrainingDocs * (1 - precision)),
      trueNegatives: Math.floor(model.negativeTrainingDocs * precision),
      falseNegatives: Math.floor(model.positiveTrainingDocs * (1 - recall)),
    };
  }

  private simulateDocumentScore(doc: ReviewDocument, model: TARModel): number {
    // Simulate scoring - in production this would use the trained model
    // Base score on various factors
    let score = 0.5;

    // Adjust based on keywords
    if (model.seedKeywords && model.seedKeywords.length > 0) {
      const text = (doc.extractedText || '').toLowerCase();
      const matchCount = model.seedKeywords.filter((keyword) =>
        text.includes(keyword.toLowerCase()),
      ).length;
      score += (matchCount / model.seedKeywords.length) * 0.3;
    }

    // Add some randomness for simulation
    score += (Math.random() - 0.5) * 0.4;

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  private isModelStabilized(
    history: Array<{ precision: number; recall: number; f1Score: number }>,
    threshold: number,
  ): boolean {
    if (history.length < 3) return false;

    // Check if last 3 iterations have similar performance
    const recent = history.slice(-3);
    const avgF1 = recent.reduce((sum, h) => sum + h.f1Score, 0) / recent.length;

    const maxDiff = Math.max(
      ...recent.map((h) => Math.abs(h.f1Score - avgF1)),
    );

    return maxDiff < threshold;
  }
}
