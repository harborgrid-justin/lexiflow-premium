
import React from 'react';
import { FileText, Gavel, AlertCircle, RefreshCw } from 'lucide-react';
import { MetricCard } from '../common/Primitives';

export const DocketStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard 
        label="Recent Filings (24h)" 
        value="12" 
        icon={FileText} 
        className="border-l-4 border-l-blue-600"
      />
      <MetricCard 
        label="New Orders" 
        value="3" 
        icon={Gavel} 
        className="border-l-4 border-l-rose-600"
      />
      <MetricCard 
        label="Pending Deadlines" 
        value="8" 
        icon={AlertCircle} 
        className="border-l-4 border-l-amber-600"
      />
      <MetricCard 
        label="Court Sync Status" 
        value="Connected" 
        icon={RefreshCw} 
        className="border-l-4 border-l-emerald-600"
      />
    </div>
  );
};
