import { Badge } from '@/shared/ui/atoms/Badge/Badge';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/features/theme';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { Link as LinkIcon, Loader2, RefreshCw, Settings } from 'lucide-react';
import React from 'react';

interface Integration {
    id: string;
    name: string;
    type: string;
    icon: React.ReactNode;
    color: string;
    status: string;
}

export const AdminIntegrations: React.FC = () => {
    const { theme } = useTheme();

    // Enterprise Data Access
    const { data: integrations = [], isLoading } = useQuery<Integration[]>(
        ['admin', 'integrations'],
        DataService.admin.getIntegrations
    );

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    return (
        <div className="p-6 overflow-auto space-y-6 animate-fade-in h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className={cn("font-bold text-lg", theme.text.primary)}>Connected Platforms</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Manage API connections and data sync.</p>
                </div>
                <Button variant="outline" icon={PlusIcon}>Add Integration</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((app: Integration) => (
                    <Card key={app.id} noPadding className={cn("flex flex-col h-full hover:shadow-md transition-shadow", app.status === 'Disconnected' ? "opacity-75" : "")}>
                        <div className={cn("p-5 border-b flex justify-between items-start", theme.border.subtle)}>
                            <div className="flex items-center gap-3">
                                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm", app.color)}>
                                    {app.icon}
                                </div>
                                <div>
                                    <h4 className={cn("font-bold text-sm", theme.text.primary)}>{app.name}</h4>
                                    <p className={cn("text-xs", theme.text.secondary)}>{app.type}</p>
                                </div>
                            </div>
                            <Badge variant={app.status === 'Connected' ? 'success' : app.status === 'Error' ? 'error' : 'neutral'}>
                                {app.status}
                            </Badge>
                        </div>

                        <div className="p-5 flex-1 space-y-4">
                            <div className={cn("flex justify-between text-xs", theme.text.secondary)}>
                                <span>Last Sync</span>
                                <span className={cn("font-mono", theme.text.primary)}>{app.status === 'Connected' ? '5 mins ago' : '-'}</span>
                            </div>
                            <div className={cn("flex justify-between text-xs", theme.text.secondary)}>
                                <span>Data Scope</span>
                                <span className={theme.text.primary}>Read / Write</span>
                            </div>
                        </div>

                        <div className={cn("p-3 border-t bg-opacity-50 flex gap-2", theme.surface.highlight, theme.border.subtle)}>
                            {app.status === 'Connected' ? (
                                <>
                                    <Button size="sm" variant="ghost" className="flex-1" icon={RefreshCw}>Sync</Button>
                                    <Button size="sm" variant="outline" className="flex-1" icon={Settings}>Config</Button>
                                </>
                            ) : (
                                <Button size="sm" variant="primary" className="w-full" icon={LinkIcon}>Connect</Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
