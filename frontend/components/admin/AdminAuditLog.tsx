import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../../types';
import { User, Link, AlertOctagon, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ChainService, ChainedLogEntry, IntegrityReport } from '../../services/chainService';
import { LedgerVisualizer } from './ledger/LedgerVisualizer';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { VirtualList } from '../common/VirtualList';
import { useWindow } from '../../context/WindowContext';
import { useQuery } from '../../services/queryClient';
import { DataService } from '../../services/dataService';
import { STORES } from '../../services/db';
import { AuditLogControls } from './audit/AuditLogControls';

interface AdminAuditLogProps {
  // logs prop is removed; component will fetch its own data.
}

export const AdminAuditLog: React.FC<AdminAuditLogProps> = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const { openWindow, closeWindow } = useWindow();

  const { data: logs = [], isLoading } = useQuery<AuditLogEntry[]>([STORES.LOGS, 'all'], DataService.admin.getLogs);
  
  const [localLogs, setLocalLogs] = useState<ChainedLogEntry[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<IntegrityReport | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'visual'>('table');

  useEffect(() => {
      // Assuming logs are already chained for this demo. In a real app, this might involve a transformation.
      setLocalLogs(logs as unknown as ChainedLogEntry[]);
  }, [logs]);

  import { DEBUG_API_SIMULATION_DELAY_MS } from '../../config/master.config';
  const handleVerifyChain = async () => {
      setIsVerifying(true);
      await new Promise(r => setTimeout(r, DEBUG_API_SIMULATION_DELAY_MS));
      const result = await ChainService.verifyChain(localLogs);
      setVerifyResult(result);
      if (!result.isValid) addToast(`Integrity Check Failed at Block #${result.brokenIndex + 1}`, 'error');
      else addToast('Ledger Integrity Verified', 'success');
      setIsVerifying(false);
  };

  const handleExport = () => {
      ChainService.exportLedger(localLogs);
      addToast('Ledger exported to JSON', 'success');
  };

  const handleSimulateTamper = () => {
      if (localLogs.length < 2) return;
      const randomIndex = Math.floor(Math.random() * (localLogs.length - 1));
      const newLogs = [...localLogs];
      const targetLog = { ...newLogs[randomIndex] };
      targetLog.action = "UNAUTHORIZED_ACCESS";
      targetLog.resource = "/restricted/payroll_db";
      newLogs[randomIndex] = targetLog;
      setLocalLogs(newLogs);
      addToast(`Simulated Attack: Modified Block #${randomIndex + 1}.`, 'warning');
      setVerifyResult(null);
  };

  const handleReset = () => {
      setLocalLogs(logs as unknown as ChainedLogEntry[]);
      setVerifyResult(null);
      addToast('Ledger state reset', 'info');
  };

  const openBlockInspector = (block: ChainedLogEntry) => {
      const winId = `block-${block.id}`;
      openWindow(
          winId,
          `Block Inspector: ${block.id.substring(0, 8)}`,
          <div className={cn("p-6 h-full overflow-y-auto font-mono text-sm", theme.surface.default)}>
                <div className="space-y-4">
                    <div className={cn("p-4 rounded border", theme.surface.highlight, theme.border.default)}>
                        <h4 className={cn("font-bold mb-2 uppercase", theme.text.secondary)}>Header</h4>
                        <div className={cn("grid grid-cols-2 gap-4", theme.text.tertiary)}>
                            <div><span className={theme.text.secondary}>Timestamp:</span> {block.timestamp}</div>
                            <div><span className={theme.text.secondary}>Prev Hash:</span> {block.prevHash.substring(0, 16)}...</div>
                            <div className="col-span-2"><span className={theme.text.secondary}>Merkle Root:</span> {block.hash}</div>
                        </div>
                    </div>
                    <div className={cn("p-4 rounded border", theme.surface.highlight, theme.border.default)}>
                        <h4 className={cn("font-bold mb-2 uppercase", theme.text.secondary)}>Payload</h4>
                        <div className={cn("grid grid-cols-2 gap-4", theme.text.tertiary)}>
                            <div><span className={theme.text.secondary}>Actor:</span> {block.user}</div>
                            <div><span className={theme.text.secondary}>Action:</span> {block.action}</div>
                            <div className="col-span-2"><span className={theme.text.secondary}>Resource:</span> {block.resource}</div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <Button onClick={() => closeWindow(winId)}>Close Inspector</Button>
                </div>
          </div>
      );
  };

  const renderRow = (l: ChainedLogEntry, idx: number) => {
    const isBroken = verifyResult && !verifyResult.isValid && idx === verifyResult.brokenIndex;
    return (
        <div 
            key={l.id} 
            onClick={() => openBlockInspector(l)}
            className={cn("flex items-center border-b px-4 h-12 transition-colors cursor-pointer", isBroken ? "bg-red-50 dark:bg-red-900/20" : theme.surface.default, `hover:${theme.surface.highlight}`)}
        >
             <div className="w-[15%] font-mono text-[10px] text-slate-400 truncate pr-2">{l.hash ? l.hash.substring(0, 16) + '...' : 'Pending...'}</div>
             <div className={cn("w-[20%] font-mono text-xs", theme.text.secondary)}>{l.timestamp}</div>
             <div className="w-[15%] flex items-center gap-2">
                 <User className={cn("h-3 w-3", theme.text.tertiary)}/>
                 <span className={cn("font-medium text-sm", theme.text.primary)}>{l.user}</span>
             </div>
             <div className="w-[15%]">
                 <Badge variant={l.action.includes('DELETE') || l.action === 'UNAUTHORIZED_ACCESS' ? 'error' : l.action.includes('EXPORT') ? 'warning' : 'neutral'}>
                     {l.action}
                 </Badge>
             </div>
             <div className="w-[20%]">
                 <span className={cn("text-xs font-mono px-2 py-1 rounded border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                     {l.resource}
                 </span>
             </div>
             <div className="w-[15%] text-right">
                 {isBroken ? (
                     <span className="flex items-center justify-end text-xs text-red-600 font-bold"><AlertOctagon className="h-3 w-3 mr-1"/> INVALID</span>
                 ) : (
                     <span className="flex items-center justify-end text-[10px] text-green-600 font-bold"><Link className="h-3 w-3 mr-1"/> CHAINED</span>
                 )}
             </div>
        </div>
    );
  };

  const renderMobileRow = (l: ChainedLogEntry, idx: number) => {
    const isBroken = verifyResult && !verifyResult.isValid && idx === verifyResult.brokenIndex;
    return (
        <div className="px-2 py-1.5 h-[120px]">
            <div key={l.id} onClick={() => openBlockInspector(l)} className={cn("p-4 rounded-lg shadow-sm border h-full flex flex-col justify-between", theme.surface.default, isBroken ? 'border-red-300 bg-red-50' : theme.border.default)}>
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <User className="h-3 w-3"/>
                        <span className={cn("font-medium text-sm", theme.text.primary)}>{l.user}</span>
                    </div>
                    <Badge variant={l.action.includes('DELETE') || l.action === 'UNAUTHORIZED_ACCESS' ? 'error' : l.action.includes('EXPORT') ? 'warning' : 'neutral'}>
                        {l.action}
                    </Badge>
                </div>
                <p className={cn("text-xs font-mono truncate", theme.text.secondary)} title={l.resource}>{l.resource}</p>
                <div className={cn("flex justify-between items-center text-[10px] text-slate-500 mt-3 border-t pt-2", theme.border.subtle)}>
                    <span>{l.timestamp}</span>
                    {isBroken ? (
                         <span className="flex items-center justify-end text-xs text-red-600 font-bold"><AlertOctagon className="h-3 w-3 mr-1"/> INVALID</span>
                     ) : (
                         <span className="flex items-center justify-end text-[10px] text-green-600 font-bold"><Link className="h-3 w-3 mr-1"/> CHAINED</span>
                     )}
                </div>
            </div>
        </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full rounded-lg border overflow-hidden", theme.surface.default, theme.border.default)}>
      <AuditLogControls 
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleReset={handleReset}
        handleSimulateTamper={handleSimulateTamper}
        handleVerifyChain={handleVerifyChain}
        handleExport={handleExport}
        isVerifying={isVerifying}
        verifyResult={verifyResult}
      />
      
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'visual' ? (
            <LedgerVisualizer chain={localLogs} integrityReport={verifyResult} />
        ) : (
            <div className={cn("flex flex-col h-full", theme.surface.default)}>
                <div className={cn("hidden md:flex items-center px-4 py-2 border-b font-bold text-xs uppercase tracking-wider", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                    <div className="w-[15%]">Hash</div>
                    <div className="w-[20%]">Timestamp</div>
                    <div className="w-[15%]">Actor</div>
                    <div className="w-[15%]">Event</div>
                    <div className="w-[20%]">Resource</div>
                    <div className="w-[15%] text-right">Status</div>
                </div>
                <div className="flex-1 relative">
                    <div className="hidden md:block h-full">
                        <VirtualList 
                            items={localLogs}
                            height="100%"
                            itemHeight={48}
                            renderItem={renderRow}
                        />
                    </div>
                     <div className="md:hidden h-full">
                        <VirtualList
                            items={localLogs}
                            height="100%"
                            itemHeight={120}
                            renderItem={renderMobileRow}
                        />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
