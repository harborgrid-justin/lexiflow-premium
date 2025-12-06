
import React, { useState } from 'react';
import { Key, Radio, Activity, Plus, Trash2, Copy, Loader2 } from 'lucide-react';
import { Card } from '../../common/Card';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Button } from '../../common/Button';
import { DataService } from '../../../services/dataService';
import { useQuery } from '../../../services/queryClient';

interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    created: string;
    status: 'Active' | 'Revoked';
}

export const ApiGateway: React.FC = () => {
  const { theme } = useTheme();
  
  // Integrated Data Query
  const { data: fetchedKeys = [], isLoading } = useQuery<ApiKey[]>(
      ['admin', 'apikeys'],
      DataService.admin.getApiKeys as any
  );
  
  // Local state to handle optimistic updates for this demo view
  const [localKeys, setLocalKeys] = useState<ApiKey[]>([]);
  
  // Sync prop to local state
  React.useEffect(() => {
      if (fetchedKeys.length > 0) setLocalKeys(fetchedKeys);
  }, [fetchedKeys]);

  const handleCreateKey = () => {
      const newKey: ApiKey = {
          id: `k-${Date.now()}`,
          name: `New Key ${localKeys.length + 1}`,
          prefix: 'pk_live_...',
          created: new Date().toLocaleDateString(),
          status: 'Active'
      };
      setLocalKeys([...localKeys, newKey]);
  };

  const handleRevoke = (id: string) => {
      setLocalKeys(localKeys.map(k => k.id === id ? { ...k, status: 'Revoked' } : k));
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-full", theme.status.info.bg, theme.status.info.text)}><Activity className="h-6 w-6"/></div>
                    <div>
                        <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Requests (24h)</p>
                        <p className={cn("text-2xl font-bold", theme.text.primary)}>1.2M</p>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-full", theme.status.success.bg, theme.status.success.text)}><Radio className="h-6 w-6"/></div>
                    <div>
                        <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Avg Latency</p>
                        <p className={cn("text-2xl font-bold", theme.text.primary)}>45ms</p>
                    </div>
                </div>
            </Card>
            <Card>
                <div className={cn("flex items-center gap-4")}>
                    <div className={cn("p-3 rounded-full", theme.status.warning.bg, theme.status.warning.text)}><Key className="h-6 w-6"/></div>
                    <div>
                        <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Active Keys</p>
                        <p className={cn("text-2xl font-bold", theme.text.primary)}>{localKeys.filter(k => k.status === 'Active').length}</p>
                    </div>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={cn("rounded-lg border shadow-sm p-6", theme.surface, theme.border.default)}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={cn("font-bold text-lg", theme.text.primary)}>API Access Keys</h3>
                    <Button size="sm" variant="primary" icon={Plus} onClick={handleCreateKey}>Create Key</Button>
                </div>
                <div className="space-y-3">
                    {localKeys.map(key => (
                        <div key={key.id} className={cn("p-3 border rounded-lg flex items-center justify-between transition-colors", key.status === 'Revoked' ? cn("opacity-60", theme.surfaceHighlight) : theme.surface, theme.border.default)}>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={cn("font-bold text-sm", theme.text.primary)}>{key.name}</span>
                                    {key.status === 'Revoked' && <span className={cn("text-[10px] px-1.5 rounded font-bold border", theme.status.error.bg, theme.status.error.text, theme.status.error.border)}>REVOKED</span>}
                                </div>
                                <div className={cn("font-mono text-xs mt-1", theme.text.secondary)}>{key.prefix}••••••••</div>
                            </div>
                            <div className="flex gap-2">
                                <button className={cn("p-1.5", theme.text.tertiary, `hover:${theme.primary.text}`)} title="Copy"><Copy className="h-4 w-4"/></button>
                                {key.status === 'Active' && (
                                    <button className={cn("p-1.5", theme.text.tertiary, `hover:${theme.status.error.text}`)} onClick={() => handleRevoke(key.id)} title="Revoke"><Trash2 className="h-4 w-4"/></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={cn("rounded-lg border shadow-sm p-6", theme.surface, theme.border.default)}>
                <h3 className={cn("font-bold text-lg mb-4", theme.text.primary)}>Live Traffic</h3>
                <div className="space-y-2 font-mono text-sm">
                    {[
                        { method: 'GET', path: '/api/v1/cases', status: 200, time: '23ms' },
                        { method: 'POST', path: '/api/v1/documents', status: 201, time: '145ms' },
                        { method: 'GET', path: '/api/v1/users', status: 200, time: '18ms' },
                        { method: 'GET', path: '/api/v1/analytics', status: 200, time: '320ms' },
                        { method: 'PUT', path: '/api/v1/billing/invoice', status: 202, time: '85ms' },
                    ].map((ep, i) => (
                        <div key={i} className={cn("flex items-center justify-between p-3 rounded border", theme.surfaceHighlight, theme.border.light)}>
                            <div className="flex items-center gap-4">
                                <span className={cn("font-bold w-12",
                                    ep.method === 'GET' ? theme.status.info.text : 
                                    ep.method === 'POST' ? theme.status.success.text : theme.status.warning.text
                                )}>{ep.method}</span>
                                <span className={theme.text.primary}>{ep.path}</span>
                            </div>
                            <div className={cn("flex items-center gap-4", theme.text.secondary)}>
                                <span className={cn("px-2 py-0.5 rounded text-xs font-bold border", theme.status.success.bg, theme.status.success.text, theme.status.success.border)}>{ep.status}</span>
                                <span>{ep.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
