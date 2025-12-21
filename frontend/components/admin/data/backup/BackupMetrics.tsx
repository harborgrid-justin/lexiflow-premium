
import React from 'react';
import { Clock, HardDrive, Database } from 'lucide-react';
import { MetricTile } from '../../../common/RefactoredCommon';

interface BackupMetricsProps {
    latestCreated?: string;
    stats?: {
        totalSnapshots: number;
        totalSize: number;
        activeSchedules: number;
    };
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
            label="Total Snapshots" 
            value={stats?.totalSnapshots.toString() || '0'} 
            icon={HardDrive} 
            trend={`${(stats?.totalSize || 0)} bytes`}
        />
        <MetricTile 
            label="Active Schedules" 
            value={stats?.activeSchedules.toString() || '0'} 
            icon={Database} 
            trend="Automated"
            trendUp={true}
        />
    </div>
  );
};
