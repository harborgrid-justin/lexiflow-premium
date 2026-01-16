
import { MetricCard } from '@/components/molecules/MetricCard/MetricCard';
import { DiscoveryView } from '../../../hooks/useDiscoveryPlatform';

interface DiscoveryMetricsProps {
    stats: {
        pendingRequests: number;
        legalHolds: number;
        privilegedItems: number;
    };
    onNavigate: (view: DiscoveryView) => void;
}

function DiscoveryMetrics({ stats, onNavigate }: DiscoveryMetricsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="cursor-pointer" onClick={() => onNavigate('requests')}>
                <MetricCard
                    label="Pending Requests"
                    value={stats.pendingRequests}
                    className="border-l-4 border-l-blue-600 hover:shadow-md transition-all"
                />
            </div>
            <div className="cursor-pointer" onClick={() => onNavigate('timeline')}>
                <MetricCard
                    label="Upcoming Deadlines (7d)"
                    value="3"
                    className="border-l-4 border-l-amber-500 hover:shadow-md transition-all"
                />
            </div>
            <div className="cursor-pointer" onClick={() => onNavigate('holds')}>
                <MetricCard
                    label="Legal Hold Pending"
                    value={stats.legalHolds}
                    className="border-l-4 border-l-red-600 hover:shadow-md transition-all"
                />
            </div>
            <div className="cursor-pointer" onClick={() => onNavigate('privilege')}>
                <MetricCard
                    label="Privileged Items"
                    value={stats.privilegedItems}
                    className="border-l-4 border-l-purple-600 hover:shadow-md transition-all"
                />
            </div>
        </div>
    );
};

export default DiscoveryMetrics;
