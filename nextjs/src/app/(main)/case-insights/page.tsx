/**
 * Case Insights Page - Server Component with Data Fetching
 * AI-powered case insights and predictions with backend data
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Case Insights | LexiFlow',
  description: 'AI-powered case insights and predictions',
};

export default async function CaseInsightsPage() {
  // Fetch case analytics and predictions
  let insights = null;
  let predictions = [];

  try {
    const [analyticsData, predictionsData] = await Promise.all([
      apiFetch(API_ENDPOINTS.ANALYTICS.CASES).catch(() => null),
      apiFetch(API_ENDPOINTS.ANALYTICS.OUTCOME_PREDICTIONS).catch(() => []),
    ]);
    insights = analyticsData;
    predictions = predictionsData;
  } catch (error) {
    console.error('Failed to load case insights:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Case Insights</h1>
      <Suspense fallback={<div>Loading insights...</div>}>
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
            {insights ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Win Rate</p>
                  <p className="text-2xl font-bold">{insights.winRate || 0}%</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Settlement</p>
                  <p className="text-2xl font-bold">${insights.avgSettlement || 0}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Case Duration</p>
                  <p className="text-2xl font-bold">{insights.avgDuration || 0} days</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">No analytics available</p>
            )}
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Outcome Predictions</h2>
            {predictions && predictions.length > 0 ? (
              <div className="space-y-3">
                {predictions.map((prediction: any) => (
                  <div key={prediction.id} className="p-4 border rounded">
                    <h3 className="font-semibold">{prediction.caseTitle}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Predicted outcome: {prediction.outcome} ({prediction.confidence}% confidence)
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">No predictions available</p>
            )}
          </div>
        </div>
      </Suspense>
    </div>
  );
}
