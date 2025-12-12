import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface Prediction {
  type: string;
  probability: number;
  confidence: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface PredictiveInsightsProps {
  caseId: string;
}

export const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ caseId }) => {
  const [insights, setInsights] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch predictions from ML service
    fetchPredictions();
  }, [caseId]);

  const fetchPredictions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockInsights: Prediction[] = [
        {
          type: 'Win Probability',
          probability: 0.73,
          confidence: 0.85,
          impact: 'positive',
          description: 'High likelihood of favorable outcome based on similar cases and current metrics',
        },
        {
          type: 'Settlement Opportunity',
          probability: 0.45,
          confidence: 0.78,
          impact: 'neutral',
          description: 'Settlement window optimal in 30-60 days based on discovery progress',
        },
        {
          type: 'Budget Risk',
          probability: 0.28,
          confidence: 0.82,
          impact: 'negative',
          description: 'Low risk of budget overrun given current burn rate and timeline',
        },
      ];

      setInsights(mockInsights);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setLoading(false);
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'negative':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">AI-Powered Predictive Insights</h3>
        <p className="text-sm text-gray-500">Machine learning predictions for case outcomes</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getImpactIcon(insight.impact)}
                  <h4 className="font-semibold">{insight.type}</h4>
                </div>
                <Badge variant="outline">
                  {(insight.probability * 100).toFixed(0)}% likely
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Confidence</span>
                    <span>{(insight.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getConfidenceColor(insight.confidence)}`}
                      style={{ width: `${insight.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>How it works:</strong> Our ML models analyze historical case data, judge
            patterns, and case metrics to generate predictions with confidence scores.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
