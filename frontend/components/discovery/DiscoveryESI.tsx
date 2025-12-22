/**
 * @module components/discovery/DiscoveryESI
 * @category Discovery
 * @description ESI management with data sources and custodial chain tracking.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Database, HardDrive, Mail, Server, Shield, Play, CheckCircle, Plus, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { EvidenceCustodyLog } from '../evidence/EvidenceCustodyLog';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useQuery, useMutation, queryClient } from '../../hooks/useQueryHooks';
import { useNotify } from '../../hooks/useNotify';
import { useWindow } from '../../context/WindowContext';

// Config
import { DEBUG_API_SIMULATION_DELAY_MS } from '../../config/master.config';

// Services & Utils
import { DataService } from '../../services/data/dataService';
import { cn } from '../../utils/cn';
// ✅ Migrated to backend API (2025-12-21)

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { ESISource } from '../../types';
import { discoveryQueryKeys } from '../../services/infrastructure/queryKeys';
import { ESICollectionStatusEnum } from '../../types/enums';

/**
 * ESI Collection Queue
 * Manages concurrent collection jobs with max 3 concurrent operations
 */
class CollectionQueue {
  private queue: Array<{ id: string; source: ESISource }> = [];
  private running = 0;
  private maxConcurrent = 3;
  private onProgress?: (id: string, status: string) => void;

  constructor(maxConcurrent = 3, onProgress?: (id: string, status: string) => void) {
    this.maxConcurrent = maxConcurrent;
    this.onProgress = onProgress;
  }

  async add(id: string, source: ESISource): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ id, source });
      this.processQueue();
      
      // Memory Management: Wait for completion with timeout to prevent indefinite intervals
      let checkCount = 0;
      const MAX_CHECKS = 120; // 60 seconds max (120 * 500ms)
      const checkInterval = setInterval(() => {
        checkCount++;
        if (!this.queue.find(item => item.id === id) && this.running < this.maxConcurrent) {
          clearInterval(checkInterval);
          resolve();
        } else if (checkCount >= MAX_CHECKS) {
          clearInterval(checkInterval);
          reject(new Error(`Collection timeout for source: ${id}`));
        }
      }, 500);
    });
  }

  private async processQueue(): Promise<void> {
    while (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const item = this.queue.shift();
      if (item) {
        this.running++;
        this.collectSource(item.id, item.source)
          .finally(() => {
            this.running--;
            this.processQueue();
          });
      }
    }
  }

  private async collectSource(id: string, source: ESISource): Promise<void> {
    try {
      this.onProgress?.(id, ESICollectionStatusEnum.COLLECTING);
      
      // Simulate collection process
      await new Promise(resolve => setTimeout(resolve, DEBUG_API_SIMULATION_DELAY_MS * 2));
      
      this.onProgress?.(id, ESICollectionStatusEnum.COLLECTED);
    } catch (err: unknown) {
      this.onProgress?.(id, ESICollectionStatusEnum.ERROR);
      throw err;
    }
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getRunningCount(): number {
    return this.running;
  }
}

export const DiscoveryESI: React.FC = () => {
  const { theme, mode } = useTheme();
  const notify = useNotify();
  const { openWindow, closeWindow } = useWindow();
  const collectionQueueRef = React.useRef<CollectionQueue | null>(null);

  // Initialize collection queue
  if (!collectionQueueRef.current) {
    collectionQueueRef.current = new CollectionQueue(3, (id, status) => {
      updateStatus({ id, status });
    });
  }

  // Enterprise Data Access
  const { data: sources = [] } = useQuery<ESISource[]>(
      discoveryQueryKeys.discovery.esi.all,
      () => DataService.discovery.getESISources()
  );

  const { mutate: updateStatus } = useMutation(
      async (payload: { id: string, status: string }) => {
          return DataService.discovery.updateESISourceStatus(payload.id, payload.status);
      },
      { invalidateKeys: [discoveryQueryKeys.discovery.esi.all] }
  );

  const { mutate: startCollection, isLoading: isCollecting } = useMutation(
      async (sourceId: string) => {
          const source = sources.find(s => s.id === sourceId);
          if (!source) throw new Error('Source not found');
          
          // Add to collection queue
          await collectionQueueRef.current?.add(sourceId, source);
          return DataService.discovery.startCollection(sourceId);
      },
      {
          onSuccess: (_, id) => {
              notify.success("ESI Collection Job completed successfully.");
          },
          onError: () => {
              notify.error("Collection failed. Please try again.");
          },
          invalidateKeys: [discoveryQueryKeys.discovery.esi.all]
      }
  );

  const getIcon = (type: string) => {
      switch(type) {
          case 'Email': return <Mail className={cn("h-5 w-5", theme.primary.text)}/>;
          case 'Slack': return <Database className="h-5 w-5 text-purple-500"/>;
          case 'Device': return <HardDrive className={cn("h-5 w-5", theme.text.tertiary)}/>;
          default: return <Server className="h-5 w-5 text-indigo-500"/>;
      }
  };

  const handleViewChain = (source: ESISource) => {
      const winId = `custody-${source.id}`;
      openWindow(
          winId,
          `Custody Chain: ${source.name}`,
          <EvidenceCustodyLog /> // In a real app, filter by source ID
      );
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("p-6 rounded-lg shadow-sm flex justify-between items-center border", theme.surface.overlay, theme.border.default, theme.text.inverse)}>
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><Database className="h-6 w-6 text-blue-400"/> ESI Data Map</h3>
                <p className="text-sm mt-1 opacity-80">Track electronic sources, custodians, and preservation status.</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold font-mono text-green-400">{sources.filter(s => s.status === 'Collected' || s.status === 'Processed').length} / {sources.length}</p>
                <p className="text-xs uppercase font-bold opacity-60">Sources Collected</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sources.map(source => (
                <Card key={source.id} noPadding className="flex flex-col h-full hover:border-blue-300 transition-colors">
                    <div className={cn("p-4 border-b flex justify-between items-start", theme.border.default, theme.surface.highlight)}>
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded border shadow-sm", theme.surface.default, theme.border.default)}>
                                {getIcon(source.type)}
                            </div>
                            <div>
                                <h4 className={cn("font-bold text-sm", theme.text.primary)}>{source.name}</h4>
                                <p className={cn("text-xs", theme.text.secondary)}>{source.custodian}</p>
                            </div>
                        </div>
                        <Badge variant={source.status === 'Collected' ? 'success' : source.status === 'Preserved' ? 'warning' : 'neutral'}>
                            {source.status}
                        </Badge>
                    </div>
                    
                    <div className="p-4 flex-1 space-y-4">
                        <div className={cn("flex justify-between text-xs", theme.text.secondary)}>
                            <span>Size Estimate</span>
                            <span className={cn("font-mono font-bold", theme.text.primary)}>{source.size || 'TBD'}</span>
                        </div>
                        
                        {source.status === 'Identified' && (
                            <div className={cn("p-3 rounded border text-xs flex items-start gap-2", theme.status.warning.bg, theme.status.warning.border, theme.status.warning.text)}>
                                <Shield className="h-4 w-4 shrink-0"/>
                                Legal Hold pending. Ensure custodian notification.
                            </div>
                        )}

                        {source.status === 'Preserved' && (
                            <div className="space-y-1">
                                <p className={cn("text-xs font-bold", theme.text.secondary)}>Collection Progress</p>
                                <ProgressBar label="" value={0} showValue={false} colorClass="bg-blue-500"/>
                                <div className="flex justify-end">
                                    <Button 
                                        size="sm" 
                                        variant="primary" 
                                        icon={isCollecting ? Loader2 : Play} 
                                        onClick={() => startCollection(source.id)}
                                        disabled={isCollecting}
                                    >
                                        {isCollecting ? 'Collecting...' : 'Start Collection'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {source.status === 'Collected' && (
                            <div className="space-y-2">
                                <div className="flex items-center text-green-600 text-xs font-bold">
                                    <CheckCircle className="h-4 w-4 mr-1"/> Collection Verified
                                </div>
                                <Button size="sm" variant="outline" className="w-full" onClick={() => updateStatus({ id: source.id, status: 'Processed' })}>Process to Review</Button>
                            </div>
                        )}
                         {source.status === 'Processed' && (
                            <div className={cn("p-3 rounded text-xs text-center font-medium", theme.status.info.bg, theme.status.info.text, theme.status.info.border, "border")}>
                                Ready for Review
                            </div>
                        )}
                    </div>
                    
                    <div className={cn("p-3 border-t flex justify-between items-center text-xs", theme.border.default, theme.surface.highlight, theme.text.tertiary)}>
                        <span>ID: {source.id}</span>
                        <button className="text-blue-600 hover:underline" onClick={() => handleViewChain(source)}>View Chain of Custody</button>
                    </div>
                </Card>
            ))}
            
            {/* Add Source Card */}
            <button className={cn("border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 transition-all", theme.border.default, theme.text.tertiary, `hover:${theme.primary.border}`, `hover:${theme.primary.text}`, `hover:${theme.surface.highlight}`)}>
                <Plus className="h-10 w-10 mb-2"/>
                <span className="font-bold">Add Data Source</span>
            </button>
        </div>
    </div>
  );
};

export default DiscoveryESI;


