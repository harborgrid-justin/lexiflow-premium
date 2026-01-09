import { MetricCard } from '@/shared/ui/molecules/MetricCard';
import { Clock, Database, HardDrive } from 'lucide-react';
import React from 'react';

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
            <MetricCard
                label="Latest Recovery Point"
                value={latestCreated ? new Date(latestCreated).toLocaleTimeString() : 'N/A'}
                icon={Clock}
                trend="Healthy"
                trendUp={true}
            />
            <MetricCard
                label="Total Snapshots"
                value={stats?.totalSnapshots.toString() || '0'}
                icon={HardDrive}
                trend={`${(stats?.totalSize || 0)} bytes`}
            />
            <MetricCard
                label="Active Schedules"
                value={stats?.activeSchedules.toString() || '0'}
                icon={Database}
                trend="Automated"
                trendUp={true}
            />
        </div>
    );
};
