
import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ArrowRight, Database, FileText } from 'lucide-react';
import { DataService } from '../../services/dataService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { DiscoveryMetrics } from './dashboard/DiscoveryMetrics';
import { DiscoveryCharts } from './dashboard/DiscoveryCharts';

interface DiscoveryDashboardProps {
    onNavigate: (view: any, id?: string) => void;
}

export const DiscoveryDashboard: React.FC<DiscoveryDashboardProps> = ({ onNavigate }) => {
  const { theme } = useTheme();

  // Parallel Queries for Dashboard Stats
  const { data: requests = [] } = useQuery([STORES.DISCOVERY_EXT_DEPO, 'requests'], DataService.discovery.getRequests);
  const { data: holds = [] } = useQuery([STORES.LEGAL_HOLDS, 'all'], DataService.discovery.getLegalHolds);
  const { data: privilegeLog = [] } = useQuery([STORES.PRIVILEGE_LOG, 'all'], DataService.discovery.getPrivilegeLog);

  const stats = {
      pendingRequests: requests.filter(r => r.status === 'Served').length,
      legalHolds: holds.filter((h: any) => h.status === 'Pending').length,
      privilegedItems: privilegeLog.length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <DiscoveryMetrics stats={stats} onNavigate={onNavigate} />
      <DiscoveryCharts />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Review Progress">
           <div className="space-y-4">
              <div>
                <div className={cn("flex justify-between text-sm mb-1", theme.text.primary)}>
                   <span>Responsive Documents Review</span>
                   <span className="font-bold">78%</span>
                </div>
                <div className={cn("w-full rounded-full h-2", theme.surfaceHighlight)}>
                   <div className="bg-blue-600 h-2 rounded-full w-[78%]"></div>
                </div>
              </div>
              <div>
                <div className={cn("flex justify-between text-sm mb-1", theme.text.primary)}>
                   <span>Privilege Redactions</span>
                   <span className="font-bold">45%</span>
                </div>
                <div className={cn("w-full rounded-full h-2", theme.surfaceHighlight)}>
                   <div className="bg-amber-500 h-2 rounded-full w-[45%]"></div>
                </div>
              </div>
              <div className={cn("pt-4 border-t flex justify-between items-center", theme.border.light)}>
                 <span className={cn("text-xs", theme.text.secondary)}>Next Production Volume Due: March 31</span>
                 <Button size="sm" variant="outline" icon={ArrowRight} onClick={() => onNavigate('production')}>Create Production Set</Button>
              </div>
           </div>
        </Card>

        <Card title="Active Integrations">
            <div className="space-y-4">
                <div className={cn("flex items-center justify-between p-3 border rounded-lg", theme.surfaceHighlight, theme.border.default)}>
                    <div className="flex items-center gap-3">
                        <Database className={cn("h-5 w-5", theme.text.secondary)}/>
                        <div>
                            <p className={cn("text-sm font-bold", theme.text.primary)}>Relativity Server</p>
                            <p className={cn("text-xs", theme.text.secondary)}>Sync: 15 mins ago</p>
                        </div>
                    </div>
                    <Badge variant="success">Connected</Badge>
                </div>
                <div className={cn("flex items-center justify-between p-3 border rounded-lg", theme.surfaceHighlight, theme.border.default)}>
                    <div className="flex items-center gap-3">
                        <FileText className={cn("h-5 w-5", theme.text.secondary)}/>
                        <div>
                            <p className={cn("text-sm font-bold", theme.text.primary)}>Office 365 Purview</p>
                            <p className={cn("text-xs", theme.text.secondary)}>Collection Active</p>
                        </div>
                    </div>
                    <Badge variant="warning">Ingesting</Badge>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
};
