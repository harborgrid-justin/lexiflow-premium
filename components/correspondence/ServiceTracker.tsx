
import React from 'react';
import { ServiceJob } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { MapPin, User, FileText, CheckCircle, AlertCircle, Clock, Truck, Package } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface ServiceTrackerProps {
  jobs: ServiceJob[];
  onSelect: (job: ServiceJob) => void;
  selectedId?: string;
}

export const ServiceTracker: React.FC<ServiceTrackerProps> = ({ jobs, onSelect, selectedId }) => {
  const { theme } = useTheme();

  const getMethodIcon = (method: string, mailType?: string) => {
      if (method === 'Mail') return <Truck className="h-4 w-4 text-purple-600"/>;
      return <User className="h-4 w-4 text-blue-600"/>;
  };

  return (
    <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
                <div 
                    key={job.id} 
                    onClick={() => onSelect(job)}
                    className={cn(
                        "p-5 rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-md group flex flex-col",
                        theme.surface.default,
                        theme.border.default,
                        selectedId === job.id ? "ring-2 ring-blue-500 border-blue-500" : `hover:${theme.primary.border}`
                    )}
                >
                    <div className="flex justify-between items-start mb-3">
                        <Badge variant={
                            job.status === 'Served' || job.status === 'Filed' ? 'success' : 
                            job.status === 'Out for Service' ? 'warning' : 'neutral'
                        }>
                            {job.status}
                        </Badge>
                        <span className={cn("text-xs font-mono", theme.text.tertiary)}>{job.id}</span>
                    </div>
                    
                    <h4 className={cn("font-bold text-sm mb-1", theme.text.primary)}>{job.targetPerson}</h4>
                    <div className={cn("text-xs flex items-center mb-4", theme.text.secondary)}>
                        <MapPin className="h-3 w-3 mr-1"/> {job.targetAddress}
                    </div>

                    <div className={cn("mt-auto pt-4 border-t space-y-2", theme.border.light)}>
                        <div className="flex justify-between text-xs">
                            <span className={theme.text.secondary}>Document</span>
                            <span className={cn("font-medium truncate max-w-[120px]", theme.text.primary)}>{job.documentTitle}</span>
                        </div>
                        <div className="flex justify-between text-xs items-center">
                            <span className={theme.text.secondary}>Method</span>
                            <div className="flex items-center gap-1 font-medium">
                                {getMethodIcon(job.method, job.mailType)}
                                <span>{job.method === 'Mail' ? 'Mail' : 'Server'}</span>
                            </div>
                        </div>
                        {job.trackingNumber && (
                            <div className="flex justify-between text-xs">
                                <span className={theme.text.secondary}>Tracking</span>
                                <span className="font-mono text-[10px]">{job.trackingNumber}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xs">
                            <span className={theme.text.secondary}>Carrier/Agent</span>
                            <span className={theme.text.primary}>{job.serverName}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
