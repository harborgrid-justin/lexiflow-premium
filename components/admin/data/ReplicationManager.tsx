
import React, { useState, useEffect, useRef } from 'react';
import { Power, ShieldAlert, CheckCircle } from 'lucide-react';
import { Card } from '../../common/Card';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { RegionMap } from './replication/RegionMap';

export const ReplicationManager: React.FC = () => {
  const { theme } = useTheme();
  const [isFailoverModalOpen, setIsFailoverModalOpen] = useState(false);
  const [primaryRegion, setPrimaryRegion] = useState('US-East');
  const [replicaStatus, setReplicaStatus] = useState<'Syncing' | 'Promoting' | 'Active'>('Syncing');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
      return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
  }, []);

  const handleFailover = () => {
      setReplicaStatus('Promoting');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
          setPrimaryRegion(prev => prev === 'US-East' ? 'EU-West' : 'US-East');
          setReplicaStatus('Active');
          setIsFailoverModalOpen(false);
      }, 2000);
  };

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
                <p className={cn("text-xl font-bold flex items-center", theme.status.success.text)}><CheckCircle className="h-5 w-5 mr-2"/> Active</p>
                <p className={cn("text-xs mt-2", theme.text.secondary)}>Wal-G streaming active.</p>
            </Card>
            <Card className="border-t-4 border-t-blue-500">
                <p className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Replication Lag</p>
                <p className={cn("text-xl font-bold", theme.text.primary)}>12 ms</p>
                <p className={cn("text-xs mt-2", theme.text.secondary)}>Within SLA ({"<"}50ms)</p>
            </Card>
             <Card className="border-t-4 border-t-purple-500">
                <p className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Bandwidth</p>
                <p className={cn("text-xl font-bold", theme.text.primary)}>45 MB/s</p>
                <p className={cn("text-xs mt-2", theme.text.secondary)}>Peak: 120 MB/s</p>
            </Card>
        </div>

        <div className={cn("p-4 rounded-lg border flex items-start gap-4", theme.status.warning.bg, theme.status.warning.border)}>
            <ShieldAlert className={cn("h-6 w-6 shrink-0 mt-1", theme.status.warning.text)}/>
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
                    <Power className={cn("h-8 w-8", theme.status.error.text)}/>
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
};
