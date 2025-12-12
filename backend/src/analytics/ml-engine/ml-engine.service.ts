import { Injectable, Logger } from '@nestjs/common';

/**
 * Machine Learning Engine Service
 * Provides ML algorithms and prediction models for case analytics
 */
@Injectable()
export class MLEngineService {
  private readonly logger = new Logger(MLEngineService.name);

  /**
   * Calculate cosine similarity between two feature vectors
   */
  cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }

    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  /**
   * Calculate Euclidean distance between two vectors
   */
  euclideanDistance(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have same length');
    }

    let sum = 0;
    for (let i = 0; i < vectorA.length; i++) {
      sum += Math.pow(vectorA[i] - vectorB[i], 2);
    }

    return Math.sqrt(sum);
  }

  /**
   * K-Nearest Neighbors for case similarity matching
   */
  knnMatch<T>(
    targetVector: number[],
    trainingData: Array<{ vector: number[]; data: T }>,
    k: number = 5,
  ): Array<{ data: T; score: number }> {
    const distances = trainingData.map(item => ({
      data: item.data,
      score: this.cosineSimilarity(targetVector, item.vector),
    }));

    // Sort by similarity score (descending)
    distances.sort((a, b) => b.score - a.score);

    // Return top k matches
    return distances.slice(0, k);
  }

  /**
   * Logistic Regression prediction
   * Simple implementation for binary classification
   */
  logisticRegression(features: number[], weights: number[], bias: number = 0): number {
    const z = features.reduce((sum, feature, i) => sum + feature * weights[i], bias);
    return 1 / (1 + Math.exp(-z));
  }

  /**
   * Softmax for multi-class probability distribution
   */
  softmax(scores: number[]): number[] {
    const maxScore = Math.max(...scores);
    const expScores = scores.map(s => Math.exp(s - maxScore));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    return expScores.map(s => s / sumExp);
  }

  /**
   * Normalize features using min-max scaling
   */
  minMaxNormalize(values: number[], min?: number, max?: number): number[] {
    const actualMin = min ?? Math.min(...values);
    const actualMax = max ?? Math.max(...values);
    const range = actualMax - actualMin;

    if (range === 0) return values.map(() => 0.5);

    return values.map(v => (v - actualMin) / range);
  }

  /**
   * Normalize features using z-score standardization
   */
  zScoreNormalize(values: number[]): number[] {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return values.map(() => 0);

    return values.map(v => (v - mean) / stdDev);
  }

  /**
   * Calculate weighted average
   */
  weightedAverage(values: number[], weights: number[]): number {
    if (values.length !== weights.length) {
      throw new Error('Values and weights must have same length');
    }

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = values.reduce((sum, val, i) => sum + val * weights[i], 0);
    return weightedSum / totalWeight;
  }

  /**
   * Calculate confidence interval
   */
  confidenceInterval(
    values: number[],
    confidenceLevel: number = 0.95,
  ): { lower: number; upper: number; mean: number } {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const stdError = stdDev / Math.sqrt(values.length);

    // Z-score for 95% confidence
    const zScore = confidenceLevel === 0.95 ? 1.96 : 2.576;
    const margin = zScore * stdError;

    return {
      mean,
      lower: mean - margin,
      upper: mean + margin,
    };
  }

  /**
   * Decision tree node evaluation (simple threshold-based)
   */
  evaluateDecisionNode(
    feature: number,
    threshold: number,
    leftValue: any,
    rightValue: any,
  ): any {
    return feature <= threshold ? leftValue : rightValue;
  }

  /**
   * Random Forest ensemble prediction
   * Combines multiple decision tree predictions
   */
  randomForestPredict(predictions: number[][]): number[] {
    const numClasses = predictions[0].length;
    const voteCounts = new Array(numClasses).fill(0);

    // Count votes from each tree
    predictions.forEach(prediction => {
      const predictedClass = prediction.indexOf(Math.max(...prediction));
      voteCounts[predictedClass]++;
    });

    // Convert to probabilities
    const totalVotes = predictions.length;
    return voteCounts.map(count => count / totalVotes);
  }

  /**
   * Calculate feature importance based on variance
   */
  calculateFeatureImportance(features: number[][]): number[] {
    const numFeatures = features[0].length;
    const importance: number[] = [];

    for (let i = 0; i < numFeatures; i++) {
      const featureColumn = features.map(row => row[i]);
      const variance =
        featureColumn.reduce((sum, v) => {
          const mean = featureColumn.reduce((a, b) => a + b, 0) / featureColumn.length;
          return sum + Math.pow(v - mean, 2);
        }, 0) / featureColumn.length;
      importance.push(variance);
    }

    // Normalize to sum to 1
    const totalImportance = importance.reduce((a, b) => a + b, 0);
    return importance.map(imp => (totalImportance === 0 ? 0 : imp / totalImportance));
  }

  /**
   * Predict case outcome using ensemble methods
   */
  predictCaseOutcome(features: {
    caseAge: number;
    documentCount: number;
    motionCount: number;
    depositionCount: number;
    judgeSettlementRate: number;
    practiceAreaScore: number;
    damagesAmount: number;
    discoveryCompletion: number;
  }): {
    outcome: string;
    probabilities: Record<string, number>;
    confidence: number;
  } {
    // Feature vector
    const featureVector = [
      features.caseAge / 365, // Normalize to years
      Math.log10(features.documentCount + 1) / 4, // Log scale
      features.motionCount / 20, // Normalize
      features.depositionCount / 10,
      features.judgeSettlementRate,
      features.practiceAreaScore,
      Math.log10(features.damagesAmount + 1) / 8, // Log scale
      features.discoveryCompletion,
    ];

    // Mock trained weights for each outcome
    const weights = {
      settlement: [0.3, 0.15, 0.2, 0.25, 0.45, 0.1, 0.2, 0.35],
      plaintiffWin: [0.25, 0.3, 0.35, 0.2, -0.3, 0.25, 0.4, 0.15],
      defendantWin: [0.2, 0.25, 0.3, 0.15, -0.25, 0.2, -0.3, 0.1],
      dismissal: [-0.4, -0.2, 0.1, -0.1, 0.05, -0.15, -0.35, -0.2],
    };

    // Calculate scores for each outcome
    const scores = {
      settlement: this.logisticRegression(featureVector, weights.settlement, 0.5),
      plaintiffWin: this.logisticRegression(featureVector, weights.plaintiffWin, 0.2),
      defendantWin: this.logisticRegression(featureVector, weights.defendantWin, 0.2),
      dismissal: this.logisticRegression(featureVector, weights.dismissal, -0.3),
    };

    // Apply softmax to get probabilities
    const probArray = this.softmax(Object.values(scores));
    const outcomes = Object.keys(scores);

    const probabilities: Record<string, number> = {};
    outcomes.forEach((outcome, i) => {
      probabilities[outcome] = Math.round(probArray[i] * 100);
    });

    // Find most likely outcome
    const maxProb = Math.max(...probArray);
    const maxIndex = probArray.indexOf(maxProb);
    const outcome = outcomes[maxIndex];

    return {
      outcome,
      probabilities,
      confidence: Math.round(maxProb * 100),
    };
  }

  /**
   * Calculate risk score for a case
   */
  calculateRiskScore(factors: {
    budgetOverrun: number; // percentage
    deadlineRisk: number; // 0-1
    complexityScore: number; // 0-1
    clientSatisfaction: number; // 0-1
    teamExperience: number; // 0-1
  }): {
    riskScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{ name: string; impact: number; weight: number }>;
  } {
    const weights = {
      budgetOverrun: 0.3,
      deadlineRisk: 0.25,
      complexityScore: 0.2,
      clientSatisfaction: 0.15,
      teamExperience: 0.1,
    };

    const normalizedFactors = {
      budgetOverrun: Math.min(factors.budgetOverrun / 100, 1),
      deadlineRisk: factors.deadlineRisk,
      complexityScore: factors.complexityScore,
      clientSatisfaction: 1 - factors.clientSatisfaction, // Invert (low satisfaction = high risk)
      teamExperience: 1 - factors.teamExperience, // Invert
    };

    const riskScore = this.weightedAverage(Object.values(normalizedFactors), Object.values(weights));

    const riskScorePercent = Math.round(riskScore * 100);

    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScorePercent < 25) riskLevel = 'low';
    else if (riskScorePercent < 50) riskLevel = 'medium';
    else if (riskScorePercent < 75) riskLevel = 'high';
    else riskLevel = 'critical';

    const factorDetails = Object.entries(normalizedFactors).map(([name, impact]) => ({
      name,
      impact: Math.round(impact * 100),
      weight: Math.round(weights[name as keyof typeof weights] * 100),
    }));

    return {
      riskScore: riskScorePercent,
      riskLevel,
      factors: factorDetails,
    };
  }

  /**
   * Predict case duration in days
   */
  predictDuration(features: {
    practiceArea: string;
    caseComplexity: number; // 0-1
    courtBacklog: number; // 0-1
    partyCooperation: number; // 0-1
    documentVolume: number;
    historicalAvgDuration: number;
  }): {
    predictedDays: number;
    confidenceInterval: { lower: number; upper: number };
    factors: Array<{ name: string; impact: string }>;
  } {
    // Base duration from historical data
    let baseDuration = features.historicalAvgDuration;

    // Adjust based on complexity
    const complexityMultiplier = 1 + features.caseComplexity * 0.5;
    baseDuration *= complexityMultiplier;

    // Adjust based on court backlog
    const backlogMultiplier = 1 + features.courtBacklog * 0.3;
    baseDuration *= backlogMultiplier;

    // Adjust based on party cooperation
    const cooperationMultiplier = 1 + (1 - features.partyCooperation) * 0.4;
    baseDuration *= cooperationMultiplier;

    // Adjust based on document volume (log scale)
    const docMultiplier = 1 + Math.log10(features.documentVolume + 1) * 0.1;
    baseDuration *= docMultiplier;

    const predictedDays = Math.round(baseDuration);

    // Calculate confidence interval (±20%)
    const margin = predictedDays * 0.2;

    return {
      predictedDays,
      confidenceInterval: {
        lower: Math.round(predictedDays - margin),
        upper: Math.round(predictedDays + margin),
      },
      factors: [
        {
          name: 'Case Complexity',
          impact: features.caseComplexity > 0.7 ? 'high' : features.caseComplexity > 0.4 ? 'medium' : 'low',
        },
        {
          name: 'Court Backlog',
          impact: features.courtBacklog > 0.7 ? 'high' : features.courtBacklog > 0.4 ? 'medium' : 'low',
        },
        {
          name: 'Party Cooperation',
          impact:
            features.partyCooperation > 0.7 ? 'positive' : features.partyCooperation > 0.4 ? 'neutral' : 'negative',
        },
      ],
    };
  }
}
