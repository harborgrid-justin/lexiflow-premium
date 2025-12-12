/**
 * ML Prediction Service
 * Handles all machine learning prediction API calls
 */

const API_BASE_URL = '/api/v1';

export const mlPredictionService = {
  /**
   * Get similar cases using ML similarity algorithm
   */
  async findSimilarCases(caseId: string, limit: number = 10, minSimilarity: number = 0.6) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/similar-cases/${caseId}?limit=${limit}&minSimilarity=${minSimilarity}`,
    );
    if (!response.ok) throw new Error('Failed to find similar cases');
    return response.json();
  },

  /**
   * Cluster documents using K-Means algorithm
   */
  async clusterDocuments(caseId: string, maxClusters?: number) {
    const url = maxClusters
      ? `${API_BASE_URL}/analytics/ml/document-clustering/${caseId}?maxClusters=${maxClusters}`
      : `${API_BASE_URL}/analytics/ml/document-clustering/${caseId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to cluster documents');
    return response.json();
  },

  /**
   * Get document organization suggestions
   */
  async getDocumentOrganizationSuggestions(caseId: string) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/document-clustering/${caseId}/suggestions`,
    );
    if (!response.ok) throw new Error('Failed to get document organization suggestions');
    return response.json();
  },

  /**
   * Analyze judge sentiment from court documents
   */
  async analyzeJudgeSentiment(caseId: string) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/sentiment/judge/${caseId}`,
    );
    if (!response.ok) throw new Error('Failed to analyze judge sentiment');
    return response.json();
  },

  /**
   * Analyze opposing counsel sentiment
   */
  async analyzeOpposingCounselSentiment(caseId: string) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/sentiment/opposing-counsel/${caseId}`,
    );
    if (!response.ok) throw new Error('Failed to analyze opposing counsel sentiment');
    return response.json();
  },

  /**
   * Analyze sentiment trends
   */
  async analyzeSentimentTrends(
    caseId: string,
    entityType: 'judge' | 'opposing_counsel',
  ) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/sentiment/trends/${caseId}?entity=${entityType}`,
    );
    if (!response.ok) throw new Error('Failed to analyze sentiment trends');
    return response.json();
  },

  /**
   * Predict case outcome using ensemble ML models
   */
  async predictOutcome(caseId: string) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/outcome-predictor/${caseId}`,
    );
    if (!response.ok) throw new Error('Failed to predict outcome');
    return response.json();
  },

  /**
   * Get settlement amount recommendation
   */
  async recommendSettlement(caseId: string) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/settlement-recommender/${caseId}`,
    );
    if (!response.ok) throw new Error('Failed to recommend settlement');
    return response.json();
  },

  /**
   * Calculate comprehensive risk score
   */
  async calculateRiskScore(caseId: string) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/risk-scorer/${caseId}`,
    );
    if (!response.ok) throw new Error('Failed to calculate risk score');
    return response.json();
  },

  /**
   * Compare risks across multiple cases
   */
  async compareRisks(caseIds: string[]) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/risk-scorer/compare`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseIds }),
      },
    );
    if (!response.ok) throw new Error('Failed to compare risks');
    return response.json();
  },

  /**
   * Batch predict outcomes for multiple cases
   */
  async batchPredictOutcomes(caseIds: string[]) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/outcome-predictor/batch`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseIds }),
      },
    );
    if (!response.ok) throw new Error('Failed to batch predict outcomes');
    return response.json();
  },

  /**
   * Get ML model accuracy metrics
   */
  async getModelAccuracy(modelType: 'outcome' | 'settlement' | 'risk') {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/accuracy/${modelType}`,
    );
    if (!response.ok) throw new Error('Failed to get model accuracy');
    return response.json();
  },

  /**
   * Explain similarity between two cases
   */
  async explainSimilarity(caseId1: string, caseId2: string) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/ml/similar-cases/explain?case1=${caseId1}&case2=${caseId2}`,
    );
    if (!response.ok) throw new Error('Failed to explain similarity');
    return response.json();
  },
};

export default mlPredictionService;
