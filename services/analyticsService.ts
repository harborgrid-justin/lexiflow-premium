/**
 * Analytics Service
 * Handles all analytics-related API calls
 */

const API_BASE_URL = '/api/v1';

export interface CaseMetricsQuery {
  startDate?: Date;
  endDate?: Date;
  practiceArea?: string;
  status?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export const analyticsService = {
  /**
   * Get case analytics metrics
   */
  async getCaseMetrics(query: CaseMetricsQuery = {}) {
    const params = new URLSearchParams();
    if (query.startDate) params.append('startDate', query.startDate.toISOString());
    if (query.endDate) params.append('endDate', query.endDate.toISOString());
    if (query.practiceArea) params.append('practiceArea', query.practiceArea);
    if (query.status) params.append('status', query.status);
    if (query.period) params.append('period', query.period);

    const response = await fetch(`${API_BASE_URL}/analytics/case-analytics?${params}`);
    if (!response.ok) throw new Error('Failed to fetch case metrics');
    return response.json();
  },

  /**
   * Get case-specific metrics
   */
  async getCaseSpecificMetrics(caseId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/case-analytics/${caseId}`);
    if (!response.ok) throw new Error('Failed to fetch case metrics');
    return response.json();
  },

  /**
   * Get billing analytics
   */
  async getBillingAnalytics(query: { startDate?: Date; endDate?: Date } = {}) {
    const params = new URLSearchParams();
    if (query.startDate) params.append('startDate', query.startDate.toISOString());
    if (query.endDate) params.append('endDate', query.endDate.toISOString());

    const response = await fetch(`${API_BASE_URL}/analytics/billing-analytics?${params}`);
    if (!response.ok) throw new Error('Failed to fetch billing analytics');
    return response.json();
  },

  /**
   * Get discovery analytics
   */
  async getDiscoveryAnalytics(caseId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/discovery-analytics/${caseId}`);
    if (!response.ok) throw new Error('Failed to fetch discovery analytics');
    return response.json();
  },

  /**
   * Get outcome prediction for a case
   */
  async getOutcomePrediction(caseId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/outcome-predictions/${caseId}`);
    if (!response.ok) throw new Error('Failed to fetch outcome prediction');
    return response.json();
  },

  /**
   * Analyze case for new prediction
   */
  async analyzeCase(caseId: string, options: {
    includeDetails?: boolean;
    similarCasesLimit?: number;
    additionalFactors?: string[];
  } = {}) {
    const response = await fetch(`${API_BASE_URL}/analytics/outcome-predictions/${caseId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    if (!response.ok) throw new Error('Failed to analyze case');
    return response.json();
  },

  /**
   * Get similar historical cases
   */
  async getSimilarCases(caseId: string, limit: number = 10) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/outcome-predictions/${caseId}/similar?limit=${limit}`,
    );
    if (!response.ok) throw new Error('Failed to fetch similar cases');
    return response.json();
  },

  /**
   * Get prediction model accuracy
   */
  async getPredictionAccuracy() {
    const response = await fetch(`${API_BASE_URL}/analytics/outcome-predictions/accuracy`);
    if (!response.ok) throw new Error('Failed to fetch prediction accuracy');
    return response.json();
  },

  /**
   * Get judge statistics
   */
  async getJudgeStatistics(judgeId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/judge-stats/${judgeId}`);
    if (!response.ok) throw new Error('Failed to fetch judge statistics');
    return response.json();
  },

  /**
   * Get list of judges
   */
  async getJudgeList() {
    const response = await fetch(`${API_BASE_URL}/analytics/judge-stats/list`);
    if (!response.ok) throw new Error('Failed to fetch judge list');
    return response.json();
  },

  /**
   * Get dashboard aggregated data
   */
  async getDashboard(period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month') {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard?period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  },

  /**
   * Get risk assessment for a case
   */
  async getRiskAssessment(caseId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/risk-assessment/cases/${caseId}`);
    if (!response.ok) throw new Error('Failed to fetch risk assessment');
    return response.json();
  },

  /**
   * Get predictive analytics for a case
   */
  async getPredictiveAnalytics(caseId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/predictive/${caseId}`);
    if (!response.ok) throw new Error('Failed to fetch predictive analytics');
    return response.json();
  },

  /**
   * Get resource forecasting
   */
  async getResourceForecast(practiceArea: string, days: number = 90) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/resource-forecast?practiceArea=${practiceArea}&days=${days}`,
    );
    if (!response.ok) throw new Error('Failed to fetch resource forecast');
    return response.json();
  },

  /**
   * Get trend analysis
   */
  async getTrendAnalysis(practiceArea: string, months: number = 24) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/trends/${practiceArea}?months=${months}`,
    );
    if (!response.ok) throw new Error('Failed to fetch trend analysis');
    return response.json();
  },

  /**
   * Get benchmarks
   */
  async getBenchmarks(firmId: string, practiceArea?: string) {
    const url = practiceArea
      ? `${API_BASE_URL}/analytics/benchmarks/${firmId}?practiceArea=${practiceArea}`
      : `${API_BASE_URL}/analytics/benchmarks/${firmId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch benchmarks');
    return response.json();
  },

  /**
   * Get executive dashboard
   */
  async getExecutiveDashboard(firmId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    const response = await fetch(
      `${API_BASE_URL}/analytics/reports/executive-dashboard/${firmId}?period=${period}`,
    );
    if (!response.ok) throw new Error('Failed to fetch executive dashboard');
    return response.json();
  },

  /**
   * Get attorney performance
   */
  async getAttorneyPerformance(attorneyId: string, period: 'month' | 'quarter' | 'year' = 'year') {
    const response = await fetch(
      `${API_BASE_URL}/analytics/reports/attorney-performance/${attorneyId}?period=${period}`,
    );
    if (!response.ok) throw new Error('Failed to fetch attorney performance');
    return response.json();
  },

  /**
   * Get matter profitability
   */
  async getMatterProfitability(caseId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/reports/matter-profitability/${caseId}`);
    if (!response.ok) throw new Error('Failed to fetch matter profitability');
    return response.json();
  },

  /**
   * Get practice area report
   */
  async getPracticeAreaReport(practiceArea: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/reports/practice-area/${practiceArea}`);
    if (!response.ok) throw new Error('Failed to fetch practice area report');
    return response.json();
  },

  /**
   * Get client analytics
   */
  async getClientAnalytics(clientId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/reports/client-analytics/${clientId}`);
    if (!response.ok) throw new Error('Failed to fetch client analytics');
    return response.json();
  },
};

export default analyticsService;
