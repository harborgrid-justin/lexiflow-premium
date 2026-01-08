import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileText,
  Lock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

interface ComplianceScore {
  framework: string;
  overallScore: number;
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  inProgressControls: number;
  criticalIssues: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface ComplianceDashboardData {
  overallStatus: {
    totalFrameworks: number;
    averageComplianceScore: number;
    criticalFindings: number;
    openIncidents: number;
    pendingGDPRRequests: number;
  };
  frameworkScores: ComplianceScore[];
  gdprActivity: {
    total: number;
    pending: number;
    overdue: number;
    completedThisMonth: number;
  };
  retentionActivity: {
    activeRules: number;
    recordsPendingAction: number;
    nextExecutionDate: string;
  };
  auditActivity: {
    totalLogsToday: number;
    failedActionsToday: number;
    suspiciousActivities: number;
  };
}

export default function ComplianceDashboard() {
  const [data, setData] = useState<ComplianceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState<string>('all');

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance/dashboard');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No compliance data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600 mt-1">Enterprise compliance monitoring and reporting</p>
        </div>
        <button
          onClick={fetchComplianceData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh Data
        </button>
      </div>

      {/* Overall Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliance Score</p>
              <p className={`text-3xl font-bold mt-2 ${getScoreColor(data.overallStatus.averageComplianceScore)}`}>
                {data.overallStatus.averageComplianceScore}%
              </p>
            </div>
            <Shield className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Findings</p>
              <p className={`text-3xl font-bold mt-2 ${data.overallStatus.criticalFindings > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {data.overallStatus.criticalFindings}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Incidents</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{data.overallStatus.openIncidents}</p>
            </div>
            <Activity className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">GDPR Requests</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{data.overallStatus.pendingGDPRRequests}</p>
            </div>
            <FileText className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Frameworks</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{data.overallStatus.totalFrameworks}</p>
            </div>
            <Lock className="w-12 h-12 text-indigo-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Framework Compliance Scores */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Framework Compliance</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.frameworkScores.map((framework) => (
              <div
                key={framework.framework}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedFramework(framework.framework)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{framework.framework}</h3>
                  {getTrendIcon(framework.trend)}
                </div>

                <div className="mb-4">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-sm text-gray-600">Compliance Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(framework.overallScore)}`}>
                      {framework.overallScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${framework.overallScore >= 90 ? 'bg-green-600' : framework.overallScore >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      style={{ width: `${framework.overallScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Controls</span>
                    <span className="font-medium">{framework.totalControls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compliant</span>
                    <span className="font-medium text-green-600">{framework.compliantControls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Non-Compliant</span>
                    <span className="font-medium text-red-600">{framework.nonCompliantControls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-medium text-yellow-600">{framework.inProgressControls}</span>
                  </div>
                  {framework.criticalIssues > 0 && (
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-red-600 font-medium">Critical Issues</span>
                      <span className="font-bold text-red-600">{framework.criticalIssues}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GDPR Activity */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">GDPR Activity</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Requests</span>
              <span className="text-xl font-bold">{data.gdprActivity.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="text-xl font-bold text-yellow-600">{data.gdprActivity.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overdue</span>
              <span className="text-xl font-bold text-red-600">{data.gdprActivity.overdue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed This Month</span>
              <span className="text-xl font-bold text-green-600">{data.gdprActivity.completedThisMonth}</span>
            </div>
          </div>
        </div>

        {/* Data Retention Activity */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Data Retention</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Rules</span>
              <span className="text-xl font-bold">{data.retentionActivity.activeRules}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Actions</span>
              <span className="text-xl font-bold text-yellow-600">{data.retentionActivity.recordsPendingAction}</span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Next Execution</p>
              <p className="text-sm font-medium">
                {new Date(data.retentionActivity.nextExecutionDate).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Audit Activity */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Audit Activity (Today)</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Logs</span>
              <span className="text-xl font-bold">{data.auditActivity.totalLogsToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Failed Actions</span>
              <span className="text-xl font-bold text-red-600">{data.auditActivity.failedActionsToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Suspicious Activities</span>
              <span className={`text-xl font-bold ${data.auditActivity.suspiciousActivities > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {data.auditActivity.suspiciousActivities}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          View Audit Logs
        </button>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
          GDPR Requests
        </button>
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Security Incidents
        </button>
        <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
          Generate Report
        </button>
      </div>
    </div>
  );
}
