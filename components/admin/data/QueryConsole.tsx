
import React, { useState, useMemo, useEffect } from 'react';
import { Play, Download, AlignLeft, Bot } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Tabs } from '../../common/Tabs';
import { Modal } from '../../common/Modal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CopyButton } from '../../common/CopyButton';
import { Button } from '../../common/Button';
import { VirtualList } from '../../common/VirtualList';
import { SqlHelpers } from '../../../utils/sqlHelpers';
import { QuerySidebar } from './query/QuerySidebar';

const MOCK_SCHEMA = {
  cases: { desc: 'Core table for all legal matters.', columns: [{ name: 'id', type: 'UUID', pk: true, notNull: true, unique: true }, { name: 'title', type: 'VARCHAR(255)', pk: false }, { name: 'status', type: 'case_status', pk: false }, { name: 'client_id', type: 'UUID', fk: 'clients.id' }] },
  users: { desc: 'Firm staff and client user accounts.', columns: [{ name: 'id', type: 'UUID' }, { name: 'name', type: 'VARCHAR' }, { name: 'role', type: 'user_role' }] },
  documents: { desc: 'Metadata for all documents.', columns: [{ name: 'id', type: 'UUID' }, { name: 'case_id', type: 'UUID', pk: false, fk: 'cases.id' }, { name: 'content', type: 'TEXT', pk: false } ] },
  audit_logs: { desc: 'Immutable record of all system events.', columns: [{ name: 'id', type: 'UUID' }, { name: 'timestamp', type: 'TIMESTAMPTZ' }, { name: 'action', type: 'VARCHAR' }] },
};

interface QueryConsoleProps {
    initialTab?: string;
}

export const QueryConsole: React.FC<QueryConsoleProps> = ({ initialTab = 'editor' }) => {
  const { theme } = useTheme();
  const [activeSidebarTab, setActiveSidebarTab] = useState<'schema' | 'history' | 'saved'>('schema');
  const [activeResultsTab, setActiveResultsTab] = useState<'results' | 'explain' | 'visualize'>('results');
  const [query, setQuery] = useState('SELECT id, title, status FROM cases\nWHERE status = \'Active\'\nLIMIT 10;');
  const [results, setResults] = useState<Record<string, any>[] | null>(null);
  const [executionTime, setExecutionTime] = useState<string | null>(null);
  
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [explainPlan, setExplainPlan] = useState<any>(null);
  const [isFormatting, setIsFormatting] = useState(false);

  useEffect(() => {
      if (initialTab === 'history') setActiveSidebarTab('history');
      else if (initialTab === 'saved') setActiveSidebarTab('saved');
      else setActiveSidebarTab('schema');
  }, [initialTab]);

  const handleRun = () => {
      const start = performance.now();
      setTimeout(() => {
          let data: any[] = [];
          if (query.toLowerCase().includes('cases')) {
               data = Array.from({length: 1000}, (_, i) => ({ id: `C-${i}`, title: `Martinez v. Tech ${i}`, status: i % 2 === 0 ? 'Active' : 'Closed' }));
          }
          else if (query.toLowerCase().includes('users')) data = [{ id: 'U-101', name: 'Admin User', role: 'Administrator' }];
          else data = [{ result: 'Query executed', rows_affected: 0 }];
          setResults(data);
          setExecutionTime(`${(performance.now() - start).toFixed(2)}ms`);
          setActiveResultsTab('results');
      }, 300);
  };

  const handleFormat = () => {
      setIsFormatting(true);
      const formatted = SqlHelpers.formatQuery(query);
      setQuery(formatted);
      setTimeout(() => setIsFormatting(false), 200);
  };
  
  const handleExplain = () => {
      setExplainPlan({ name: 'Sequential Scan', cost: '0.00..25.88', rows: 10, children: [{ name: 'Filter: status = Active' }] });
      setActiveResultsTab('explain');
  };
  
  const exportCsv = () => {
      if (!results || results.length === 0) return;
      const headers = Object.keys(results[0]);
      let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
      csvContent += results.map(row => headers.map(h => JSON.stringify(row[h])).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "query_results.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  const visualizableData = useMemo(() => {
    if (!results || results.length < 1) return null;
    const keys = Object.keys(results[0]);
    const strKey = keys.find(k => typeof results[0][k] === 'string');
    const numKey = keys.find(k => typeof results[0][k] === 'number');
    if (strKey && numKey) return { data: results.slice(0, 50), strKey, numKey };
    return null;
  }, [results]);

  const renderResultRow = (row: any, index: number) => (
      <div key={index} className={cn("flex border-b transition-colors h-8", theme.border.light, `hover:${theme.surfaceHighlight}`)}>
          {Object.values(row).map((v: any, j) => (
              <div key={j} className={cn("flex-1 px-4 py-1.5 font-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis border-r last:border-r-0", theme.border.light)}>
                  {String(v)}
              </div>
          ))}
      </div>
  );

  return (
    <div className={cn("flex flex-col h-full", theme.background)}>
        {shareModalOpen && (
            <Modal isOpen={true} onClose={() => setShareModalOpen(false)} title="Share Query">
                <div className="p-6 space-y-4">
                    <p className={cn("text-sm", theme.text.secondary)}>Share a secure link to this saved query with your team.</p>
                    <div className={cn("flex gap-2 p-2 rounded border", theme.surfaceHighlight, theme.border.default)}>
                        <span className="text-sm font-mono truncate">https://lexiflow.ai/query/sh_...</span>
                        <CopyButton text="https://lexiflow.ai/query/sh_..." />
                    </div>
                </div>
            </Modal>
        )}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
             <QuerySidebar activeTab={activeSidebarTab} setActiveTab={setActiveSidebarTab} schema={MOCK_SCHEMA} />

             <div className="flex-1 flex flex-col min-w-0">
                <div className={cn("h-[40%] flex flex-col", theme.surface)}>
                    <div className={cn("flex justify-between items-center p-2 border-b", theme.border.default, theme.surfaceHighlight)}>
                        <div className="flex gap-1">
                            <Button size="xs" variant="secondary" icon={AlignLeft} onClick={handleFormat} isLoading={isFormatting}>Format</Button>
                            <Button size="xs" variant="secondary" icon={Bot} onClick={handleExplain}>Explain</Button>
                        </div>
                        <div className="flex gap-2">
                            <Button size="xs" variant="primary" icon={Play} onClick={handleRun}>Run</Button>
                        </div>
                    </div>
                    <textarea 
                        className={cn("flex-1 bg-transparent font-mono text-sm outline-none resize-none border-none p-4", theme.text.primary)}
                        value={query} onChange={(e) => setQuery(e.target.value)} spellCheck={false}
                    />
                </div>
                
                <div className={cn("flex-1 overflow-hidden flex flex-col", theme.surface, "border-t", theme.border.default)}>
                    <div className={cn("p-2 border-b flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
                        <Tabs 
                            tabs={['results', 'explain', 'visualize']}
                            activeTab={activeResultsTab}
                            onChange={(t) => setActiveResultsTab(t as any)}
                        />
                        {results && (
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-mono", theme.text.secondary)}>{results.length} rows • {executionTime}</span>
                            <div className="relative group">
                                <Button size="xs" variant="secondary" icon={Download} onClick={exportCsv}>Export</Button>
                            </div>
                        </div>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-hidden relative">
                        {activeResultsTab === 'results' && results && results.length > 0 && (
                            <div className="flex flex-col h-full">
                                <div className={cn("flex border-b font-bold text-xs", theme.surfaceHighlight, theme.border.default)}>
                                    {Object.keys(results[0]).map(k => (
                                        <div key={k} className={cn("flex-1 px-4 py-2 border-r last:border-r-0 truncate", theme.border.light, theme.text.secondary)}>{k}</div>
                                    ))}
                                </div>
                                <div className="flex-1 relative">
                                    <VirtualList 
                                        items={results}
                                        height="100%"
                                        itemHeight={32}
                                        renderItem={renderResultRow}
                                    />
                                </div>
                            </div>
                        )}
                         {activeResultsTab === 'results' && (!results || results.length === 0) && <div className={cn("p-4 text-sm text-center", theme.text.tertiary)}>No results or query not executed.</div>}
                         {activeResultsTab === 'explain' && explainPlan && <div className={cn("p-4 text-xs font-mono whitespace-pre-wrap", theme.text.primary)}>{JSON.stringify(explainPlan, null, 2)}</div>}
                         {activeResultsTab === 'visualize' && visualizableData && (
                             <div className="p-4 h-full">
                                 <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={visualizableData.data}><XAxis dataKey={visualizableData.strKey}/><YAxis/><Tooltip/><Bar dataKey={visualizableData.numKey} fill="#8884d8"/></BarChart>
                                 </ResponsiveContainer>
                             </div>
                         )}
                    </div>
                </div>
             </div>
        </div>
    </div>
  );
};
