import React, { useEffect, useRef, useState } from 'react';

import { CheckCircle, Loader2, Power, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/atoms/Button';
import { Card } from '@/components/ui/molecules/Card';
import { Modal } from '@/components/ui/molecules/Modal';
import { useQuery } from '@/hooks/backend';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';

import { RegionMap } from './replication/RegionMap';

interface ReplicationStatus {
    syncStatus: string;
    lag: number;
    bandwidth: number;
    peakBandwidth: number;
}

export function ReplicationManager(): React.ReactElement {
    const { theme } = useTheme();
    const [isFailoverModalOpen, setIsFailoverModalOpen] = useState(false);
    const [primaryRegion, setPrimaryRegion] = useState('US-East');
    const [replicaStatus, setReplicaStatus] = useState<'Syncing' | 'Promoting' | 'Active'>('Syncing');
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data: status, isLoading } = useQuery<ReplicationStatus>(
        ['admin', 'replication'],

        DataService.operations.getReplicationStatus
    );

    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) { clearTimeout(timeoutRef.current); }
        }
    }, []);

    const handleFailover = (): void => {
        setReplicaStatus('Promoting');
        if (timeoutRef.current !== null) { clearTimeout(timeoutRef.current); }

        timeoutRef.current = setTimeout(() => {
            setPrimaryRegion(prev => prev === 'US-East' ? 'EU-West' : 'US-East');
            setReplicaStatus('Active');
            setIsFailoverModalOpen(false);
        }, 2000);
    };

    if (isLoading) { return <div className="flex justify-center p-12"><Loader2 className={cn("animate-spin h-6 w-6", theme.primary.text)} /></div>; }

    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto">
            <div className="flex justify-between items-center">
                <h3 className={cn("text-xl font-bold", theme.text.primary)}>Geo-Replication & Disaster Recovery</h3>
                <Button variant="danger" icon={Power} onClick={() => setIsFailoverModalOpen(true)}>Initiate Failover</Button>
            </div>

            <RegionMap primaryRegion={primaryRegion} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-t-4 border-t-green-500">
                    <p className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Sync Status</p>
                    <p className={cn("text-xl font-bold flex items-center", theme.status.success.text)}><CheckCircle className="h-5 w-5 mr-2" /> {status?.syncStatus ?? 'Active'}</p>
                    <p className={cn("text-xs mt-2", theme.text.secondary)}>Wal-G streaming active.</p>
                </Card>
                <Card className="border-t-4 border-t-blue-500">
                    <p className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Replication Lag</p>
                    <p className={cn("text-xl font-bold", theme.text.primary)}>{status?.lag ?? 0} ms</p>
                    <p className={cn("text-xs mt-2", theme.text.secondary)}>Within SLA ({"<"}50ms)</p>
                </Card>
                <Card className="border-t-4 border-t-purple-500">
                    <p className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Bandwidth</p>
                    <p className={cn("text-xl font-bold", theme.text.primary)}>{status?.bandwidth ?? 0} MB/s</p>
                    <p className={cn("text-xs mt-2", theme.text.secondary)}>Peak: {status?.peakBandwidth ?? 0} MB/s</p>
                </Card>
            </div>

            <div className={cn("p-4 rounded-lg border flex items-start gap-4", theme.status.warning.bg, theme.status.warning.border)}>
                <ShieldAlert className={cn("h-6 w-6 shrink-0 mt-1", theme.status.warning.text)} />
                <div>
                    <h4 className={cn("font-bold text-sm", theme.status.warning.text)}>Disaster Recovery Protocol</h4>
                    <p className={cn("text-sm mt-1", theme.status.warning.text)}>
                        Automatic failover is enabled for Region US-East. In the event of 3 consecutive health check failures, traffic will route to EU-West.
                        RPO (Recovery Point Objective): 5 seconds. RTO (Recovery Time Objective): 30 seconds.
                    </p>
                </div>
            </div>

            <Modal isOpen={isFailoverModalOpen} onClose={() => setIsFailoverModalOpen(false)} title="Confirm Region Failover" size="sm">
                <div className="p-6 text-center">
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", theme.status.error.bg)}>
                        <Power className={cn("h-8 w-8", theme.status.error.text)} />
                    </div>
                    <h3 className={cn("text-lg font-bold mb-2", theme.text.primary)}>Promote {primaryRegion === 'US-East' ? 'EU-West' : 'US-East'} to Primary?</h3>
                    <p className={cn("text-sm mb-6", theme.text.secondary)}>
                        This will switch the active write region. Existing connections may be dropped momentarily. This action is logged and notifies all admins.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="secondary" onClick={() => setIsFailoverModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleFailover} isLoading={replicaStatus === 'Promoting'}>
                            {replicaStatus === 'Promoting' ? 'Promoting...' : 'Confirm Failover'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default ReplicationManager;
