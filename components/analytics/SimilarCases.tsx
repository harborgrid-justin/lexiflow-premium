import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Scale, TrendingUp } from 'lucide-react';

interface SimilarCase {
  id: string;
  caseNumber: string;
  title: string;
  similarity: number;
  outcome: string;
  matchingFactors: string[];
  insights: string[];
}

export const SimilarCases: React.FC<{ caseId: string }> = ({ caseId }) => {
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarCases();
  }, [caseId]);

  const fetchSimilarCases = async () => {
    // Mock data - replace with API call to case-similarity service
    const mockCases: SimilarCase[] = [
      {
        id: '1',
        caseNumber: '2023-CV-1234',
        title: 'Smith v. Johnson Corp',
        similarity: 0.87,
        outcome: 'Settlement - $250,000',
        matchingFactors: ['Same jurisdiction', 'Similar case type', 'Comparable damages'],
        insights: ['Case duration: 285 days', 'Settlement rate: 65%'],
      },
      {
        id: '2',
        caseNumber: '2022-CV-5678',
        title: 'Doe v. Acme Industries',
        similarity: 0.82,
        outcome: 'Win - $400,000',
        matchingFactors: ['Same judge', 'Similar legal issues', 'Strong evidence'],
        insights: ['Case duration: 320 days', 'Motion success: 75%'],
      },
      {
        id: '3',
        caseNumber: '2023-CV-9012',
        title: 'Brown v. Tech Solutions',
        similarity: 0.79,
        outcome: 'Settlement - $180,000',
        matchingFactors: ['Practice area match', 'Similar timeline'],
        insights: ['Early settlement', 'Cost-effective resolution'],
      },
    ];

    setSimilarCases(mockCases);
    setLoading(false);
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-green-600 bg-green-50';
    if (similarity >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Similar Historical Cases
            </h3>
            <p className="text-sm text-gray-500">Cases with similar characteristics and outcomes</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {similarCases.map((case_) => (
            <div
              key={case_.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{case_.caseNumber}</h4>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">{case_.title}</p>
                </div>
                <Badge className={getSimilarityColor(case_.similarity)}>
                  {(case_.similarity * 100).toFixed(0)}% match
                </Badge>
              </div>

              <div className="mb-3 p-2 bg-blue-50 rounded">
                <p className="text-sm font-medium text-blue-900">
                  Outcome: {case_.outcome}
                </p>
              </div>

              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Matching Factors:</p>
                <div className="flex flex-wrap gap-1">
                  {case_.matchingFactors.map((factor, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Key Insights:</p>
                <ul className="space-y-1">
                  {case_.insights.map((insight, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Similar Cases →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
