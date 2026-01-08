import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
  FileText,
} from 'lucide-react';

interface CaseStatus {
  id: string;
  caseNumber: string;
  caseTitle: string;
  caseType: string;
  status: string;
  attorney?: string;
  openedDate: Date;
  lastUpdate: Date;
  nextDeadline?: Date;
  milestones: Array<{
    title: string;
    completed: boolean;
    date?: Date;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    date: Date;
  }>;
}

interface CaseStatusTrackerProps {
  portalUserId: string;
}

export default function CaseStatusTracker({ portalUserId }: CaseStatusTrackerProps) {
  const [cases, setCases] = useState<CaseStatus[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, [portalUserId]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      // This would integrate with the cases module
      const response = await fetch(`/api/client-portal/cases?portalUserId=${portalUserId}`);
      const data = await response.json();
      setCases(data.cases || []);
      if (data.cases?.length > 0) {
        setSelectedCase(data.cases[0]);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      // Mock data for demonstration
      const mockCases: CaseStatus[] = [
        {
          id: '1',
          caseNumber: 'CASE-2024-001',
          caseTitle: 'Contract Dispute Resolution',
          caseType: 'Civil',
          status: 'active',
          attorney: 'John Smith',
          openedDate: new Date('2024-01-15'),
          lastUpdate: new Date('2024-02-20'),
          nextDeadline: new Date('2024-03-15'),
          milestones: [
            { title: 'Initial Consultation', completed: true, date: new Date('2024-01-15') },
            { title: 'Discovery Phase', completed: true, date: new Date('2024-01-30') },
            { title: 'Mediation', completed: false },
            { title: 'Trial Preparation', completed: false },
          ],
          recentActivity: [
            {
              type: 'document',
              description: 'New discovery document uploaded',
              date: new Date('2024-02-20'),
            },
            {
              type: 'meeting',
              description: 'Case review meeting completed',
              date: new Date('2024-02-15'),
            },
          ],
        },
      ];
      setCases(mockCases);
      setSelectedCase(mockCases[0]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Case Status Tracker</h1>
        <p className="mt-2 text-gray-600">Track the progress of your legal matters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List */}
        <div className="lg:col-span-1 space-y-4">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              onClick={() => setSelectedCase(caseItem)}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                selectedCase?.id === caseItem.id ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {caseItem.caseNumber}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    caseItem.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {caseItem.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{caseItem.caseTitle}</h3>
              <p className="text-xs text-gray-600">{caseItem.caseType}</p>
            </div>
          ))}
        </div>

        {/* Case Details */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedCase.caseTitle}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Case Number</p>
                    <p className="font-medium text-gray-900">{selectedCase.caseNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Case Type</p>
                    <p className="font-medium text-gray-900">{selectedCase.caseType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Attorney</p>
                    <p className="font-medium text-gray-900">{selectedCase.attorney || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Opened</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedCase.openedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {selectedCase.nextDeadline && (
                <div className="p-6 bg-yellow-50 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Next Deadline</p>
                      <p className="text-sm text-yellow-700">
                        {new Date(selectedCase.nextDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Progress</h3>
                <div className="space-y-4">
                  {selectedCase.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {milestone.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            milestone.completed ? 'text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          {milestone.title}
                        </p>
                        {milestone.date && (
                          <p className="text-xs text-gray-500">
                            {new Date(milestone.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {selectedCase.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'document' && (
                          <FileText className="w-5 h-5 text-blue-600" />
                        )}
                        {activity.type === 'meeting' && (
                          <Calendar className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Select a case to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
