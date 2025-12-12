import React from 'react';
import CaseMetrics from './CaseMetrics';
import BillingCharts from './BillingCharts';
import PredictionCard from './PredictionCard';
import JudgeStats from './JudgeStats';
import ReportBuilder from './ReportBuilder';

interface AnalyticsDashboardContentProps {
  activeTab: 'overview' | 'cases' | 'billing' | 'predictions' | 'judges' | 'reports' | string;
}

export const AnalyticsDashboardContent: React.FC<AnalyticsDashboardContentProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'overview':
      return <OverviewTab />;
    case 'cases':
      return <CaseMetrics />;
    case 'billing':
      return <BillingCharts />;
    case 'predictions':
      return <PredictionsTab />;
    case 'judges':
    case 'judge':
      return <JudgeStats />;
    case 'reports':
      return <ReportBuilder />;
    default:
      return <OverviewTab />;
  }
};

const OverviewTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Overview</h3>
          <CaseMetrics />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Overview</h3>
          <BillingCharts />
        </div>
      </div>
    </div>
  );
};

const PredictionsTab: React.FC = () => {
  // You would get the current case ID from context or props
  const currentCaseId = 'demo-case-1';

  return (
    <div className="max-w-4xl mx-auto">
      <PredictionCard caseId={currentCaseId} />
    </div>
  );
};

export default AnalyticsDashboardContent;
