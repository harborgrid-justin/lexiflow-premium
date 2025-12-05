
import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../../types';
import { Clock, User, Activity, Download, Filter, Shield, ShieldCheck, Link, AlertOctagon, Loader2, LayoutList, GitCommit, RefreshCw, Skull, Terminal, ArrowRight } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ChainService, ChainedLogEntry, IntegrityReport } from '../../services/chainService';
import { LedgerVisualizer } from './ledger/LedgerVisualizer';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { VirtualList } from '../common/VirtualList';
import { useWindow } from '../../context/WindowContext';

interface AdminAuditLogProps {
  logs: AuditLogEntry[];
}

export const AdminAuditLog: React.FC<AdminAuditLogProps> = ({ logs }) => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const { openWindow, closeWindow } = useWindow();
  
  const [localLogs, setLocalLogs] = useState<ChainedLogEntry[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<IntegrityReport | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'visual'>('table');

  useEffect(() => {
      setLocalLogs(logs as unknown as ChainedLogEntry[]);
  }, [logs]);

  const handleVerifyChain = async () => {
      setIsVerifying(true);
      await new Promise(r => setTimeout(r, 1000));
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
          <div className={cn("p-6 h-full overflow-y-auto font-mono text-sm", theme.surface)}>
                <div className="space-y-4">
                    <div className={cn("p-4 rounded border", theme.surfaceHighlight, theme.border.default)}>
                        <h4 className={cn("font-bold mb-2 uppercase", theme.text.secondary)}>Header</h4>
                        <div className={cn("grid grid-cols-2 gap-4", theme.text.tertiary)}>
                            <div><span className={theme.text.secondary}>Timestamp:</span> {block.timestamp}</div>
                            <div><span className={theme.text.secondary}>Prev Hash:</span> {block.prevHash.substring(0, 16)}...</div>
                            <div className="col-span-2"><span className={theme.text.secondary}>Merkle Root:</span> {block.hash}</div>
                        </div>
                    </div>
                    <div className={cn("p-4 rounded border", theme.surfaceHighlight, theme.border.default)}>
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
            className={cn("flex items-center border-b px-4 h-12 transition-colors cursor-pointer", isBroken ? "bg-red-50 dark:bg-red-900/20" : theme.surface, `hover:${theme.surfaceHighlight}`)}
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
                 <span className={cn("text-xs font-mono px-2 py-1 rounded border", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>
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

  return (
    <div className={cn("flex flex-col h-full rounded-lg border overflow-hidden", theme.surface, theme.border.default)}>
      <div className={cn("p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 shrink-0", theme.surfaceHighlight, theme.border.default)}>
        <div>
            <h3 className={cn("font-bold flex items-center gap-2", theme.text.primary)}>
                <Shield className="h-5 w-5 text-blue-600"/> Immutable Audit Ledger
            </h3>
            <p className={cn("text-xs mt-1", theme.text.secondary)}>Cryptographically chained events.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end items-center">
            <div className={cn("flex p-0.5 rounded-lg border mr-2", theme.surface, theme.border.default)}>
                <button onClick={() => setViewMode('table')} className={cn("p-1.5 rounded", viewMode === 'table' ? cn(theme.surfaceHighlight, "text-blue-600") : theme.text.tertiary)}><LayoutList className="h-4 w-4"/></button>
                <button onClick={() => setViewMode('visual')} className={cn("p-1.5 rounded", viewMode === 'visual' ? cn(theme.surfaceHighlight, "text-blue-600") : theme.text.tertiary)}><GitCommit className="h-4 w-4"/></button>
            </div>
            <div className="flex gap-1 mr-2">
                <Button size="sm" variant="ghost" onClick={handleReset} className={theme.text.secondary}><RefreshCw className="h-4 w-4"/></Button>
                <Button size="sm" variant="outline" onClick={handleSimulateTamper} className="text-red-600 border-red-200 hover:bg-red-50" icon={Skull}>Tamper</Button>
            </div>
            <div className={cn("h-6 w-px mx-1 self-center", theme.border.default)}></div>
            <Button size="sm" variant={verifyResult?.isValid ? "primary" : verifyResult?.isValid === false ? "danger" : "outline"} icon={isVerifying ? Loader2 : ShieldCheck} onClick={handleVerifyChain} isLoading={isVerifying}>
                {isVerifying ? 'Verifying...' : verifyResult?.isValid ? 'Verified' : verifyResult?.isValid === false ? 'Broken!' : 'Verify'}
            </Button>
            <Button size="sm" variant="secondary" icon={Download} onClick={handleExport}>Export</Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'visual' ? (
            <LedgerVisualizer chain={localLogs} integrityReport={verifyResult} />
        ) : (
            <div className={cn("flex flex-col h-full", theme.surface)}>
                <div className={cn("flex items-center px-4 py-2 border-b font-bold text-xs uppercase tracking-wider", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>
                    <div className="w-[15%]">Hash</div>
                    <div className="w-[20%]">Timestamp</div>
                    <div className="w-[15%]">Actor</div>
                    <div className="w-[15%]">Event</div>
                    <div className="w-[20%]">Resource</div>
                    <div className="w-[15%] text-right">Status</div>
                </div>
                <div className="flex-1 relative">
                    <VirtualList 
                        items={localLogs}
                        height="100%"
                        itemHeight={48}
                        renderItem={renderRow}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
