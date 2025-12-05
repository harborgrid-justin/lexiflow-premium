
import React, { useEffect, useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { DateText } from '../common/Primitives';
import { AlertCircle, TrendingUp, ArrowRight, FileText } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';

interface DashboardSidebarProps {
  onSelectCase: (caseId: string) => void;
  alerts: any[];
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onSelectCase, alerts }) => {
  const { theme, mode } = useTheme();
  const [billingStats, setBillingStats] = useState<{realization: number, totalBilled: number, month: string}>({
      realization: 0, totalBilled: 0, month: ''
  });

  useEffect(() => {
      const loadStats = async () => {
          const stats = await DataService.billing.getOverviewStats();
          setBillingStats(stats);
      };
      loadStats();
  }, []);

  return (
    <div className="space-y-6">
        <Card title="Firm Alerts" subtitle="Notifications & critical updates" className="h-full">
            <div className="space-y-3">
                {alerts.length === 0 && <div className={cn("text-xs text-center py-4", theme.text.tertiary)}>No recent alerts.</div>}
                {alerts.map((alert) => (
                <div 
                    key={alert.id} 
                    className={cn(
                        "relative flex items-start p-3 rounded-lg border transition-all cursor-pointer group",
                        alert.caseId ? cn(theme.surface, theme.border.default, "hover:border-blue-400 hover:shadow-sm") : cn(theme.surfaceHighlight, theme.border.light)
                    )}
                    onClick={() => alert.caseId && onSelectCase(alert.caseId)}
                >
                    <div className={cn("mt-0.5 mr-3 shrink-0", alert.caseId ? "text-blue-500" : "text-slate-400")}>
                        {alert.caseId ? <AlertCircle className="h-5 w-5"/> : <TrendingUp className="h-5 w-5"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold leading-tight mb-1", theme.text.primary)}>{alert.message}</p>
                        <p className={cn("text-xs line-clamp-2", theme.text.secondary)}>{alert.detail}</p>
                        <div className="mt-2 flex items-center justify-between">
                            <DateText date={alert.time} className="text-[10px] font-medium opacity-70" />
                            {alert.caseId && (
                                <span className="text-[10px] text-blue-600 font-bold flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Matter <ArrowRight className="h-2 w-2 ml-1"/>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wide text-slate-500">View Notification Center</Button>
            </div>
        </Card>

        <div className={cn("rounded-xl p-6 text-white shadow-xl border", mode === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-900 border-slate-700")}>
            <div className="flex items-center mb-6">
                <div className="p-2.5 bg-white/10 rounded-lg mr-4 border border-white/10"><FileText className="h-5 w-5 text-blue-300"/></div>
                <div>
                    <h4 className="font-bold text-lg leading-none">Billing Cycle</h4>
                    <p className="text-xs text-slate-400 mt-1">Current Period: {billingStats.month}</p>
                </div>
            </div>
            <div className="flex justify-between items-end mb-2">
                <div>
                    <p className="text-xs font-bold opacity-50 uppercase mb-1">Realization</p>
                    <p className="text-2xl font-mono font-bold text-green-400">{billingStats.realization}%</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold opacity-50 uppercase mb-1">Total Billed</p>
                    <p className="text-xl font-mono font-bold text-blue-400">${(billingStats.totalBilled/1000).toFixed(0)}k</p>
                </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                 <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${billingStats.realization}%` }}></div>
            </div>
        </div>
    </div>
  );
};
