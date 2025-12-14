
import React from 'react';
import { Clock, HardDrive, Database } from 'lucide-react';
import { MetricTile } from '../../../common/RefactoredCommon';
import { ArchiveStats } from '../../../../types';

interface BackupMetricsProps {
    latestCreated?: string;
    stats?: ArchiveStats;
}

export const BackupMetrics: React.FC<BackupMetricsProps> = ({ latestCreated, stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricTile 
            label="Latest Recovery Point" 
            value={latestCreated ? new Date(latestCreated).toLocaleTimeString() : 'N/A'} 
            icon={Clock} 
            trend="Healthy"
            trendUp={true}
        />
        <MetricTile 
            label="Cold Storage Usage" 
            value={stats?.totalSize || '...'} 
            icon={HardDrive} 
            trend={`${stats?.objectCount.toLocaleString()} Objects`}
        />
        <MetricTile 
            label="Monthly Cost" 
            value={`$${stats?.monthlyCost.toFixed(2)}`} 
            icon={Database} 
            trend="Optimized"
            trendUp={true}
        />
    </div>
  );
};
