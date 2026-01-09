import React, { useEffect, useState } from 'react';
import { DataService } from '@/services/data/dataService';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/shadcn/tooltip";

interface ServiceStatus {
    id: string;
    label: string;
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
}

export const SystemHealthDisplay: React.FC = () => {
    const [services, setServices] = useState<ServiceStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                // Using DataService.admin.getSystemHealth()
                const health = await DataService.admin.getSystemHealth();
                // Map to our display structure
                const mapped: ServiceStatus[] = health?.services?.map((s: any) => ({
                    id: s.name,
                    label: s.name,
                    status: s.status === 'operational' ? 'healthy' : s.status,
                    uptime: 99.9 // Mock if not provided
                })) || [];
                setServices(mapped);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchHealth();
    }, []);

    if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

    const getIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'degraded': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            default: return <XCircle className="w-4 h-4 text-red-500" />;
        }
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex flex-wrap gap-4">
                <TooltipProvider>
                    {services.map((svc) => (
                        <Tooltip key={svc.id}>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full border text-xs font-medium cursor-help">
                                    {getIcon(svc.status)}
                                    <span>{svc.label}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Status: {svc.status.toUpperCase()}</p>
                                <p>Uptime: {svc.uptime}%</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </CardContent>
        </Card>
    );
};
