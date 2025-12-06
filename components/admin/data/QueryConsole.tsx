import React, { useState, useMemo, useCallback } from 'react';
import { Play, Eraser, Save, Database, Table, Clock, Star, MoreVertical, Download, Terminal, Search, Folder, Share2, AlignLeft, Bot, Eye, Loader2 } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { Tabs } from '../../../common/Tabs';
import { Modal } from '../../common/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CopyButton } from '../../../common/CopyButton';
import { useNotify } from '../../../../hooks/useNotify';
import { Button } from '../../../common/Button';

const MOCK_SCHEMA = {
  cases: { desc: 'Core table for all legal matters.', columns: [{ name: 'id', type: 'UUID', pk: true, notNull: true, unique: true }, { name: 'title', type: 'VARCHAR(255)', pk: false }, { name: 'status', type: 'case_status', pk: false }, { name: 'client_id', type: 'UUID', fk: 'clients.id' }] },
  users: { desc: 'Firm staff and client user accounts.', columns: [{ name: 'id', type: 'UUID' }, { name: 'name', type: 'VARCHAR' }, { name: 'role', type: 'user_role' }] },
  documents: { desc: 'Metadata for all documents.', columns: [{ name: 'id', type: 'UUID' }, { name: 'case_id', type: 'UUID', pk: false, fk: 'cases.id' }, { name: 'content', type: 'TEXT', pk: false } ] },
  audit_logs: { desc: 'Immutable record of all system events.', columns: [{ name: 'id', type: 'UUID' }, { name: 'timestamp', type: 'TIMESTAMPTZ' }, { name: 'action', type: 'VARCHAR' }] },
};
const SQL_KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AND', 'OR', 'NOT', 'IN', 'IS NULL', 'IS NOT NULL'];

interface SavedQuery {
    id: string;
    name: string;
}

export const QueryConsole: React.FC = () => {
  const { theme, mode } = useTheme();
  const notify = useNotify();
  const [activeSidebarTab, setActiveSidebarTab] = useState<'schema' | 'history' | 'saved'>('schema');
  const [activeResultsTab, setActiveResultsTab] = useState<'results' | 'explain' | 'visualize'>('results');
  const [query, setQuery] = useState('SELECT id, title, status FROM cases\nWHERE status = \'Active\'\nLIMIT 10;');
  const [results, setResults] = useState<Record<string, any>[] | null>(null);
  const [executionTime, setExecutionTime] = useState<string | null>(null);
  
  const [history, setHistory] = useState([
    { id: 1, q: "SELECT * FROM cases WHERE status = 'Active'", t: "1 min ago", pinned: true },
    { id: 2, q: "SELECT name, role FROM users WHERE org_id = 'org-1'", t: "15 mins ago", pinned: false },
  ]);
  const [savedQueries, setSavedQueries] = useState<Record<string, SavedQuery[]>>({
    'Billing Reports': [{ id: 'sq1', name: 'Monthly Billed Hours' }],
    'User Audits': [{ id: 'sq2', name: 'Admin Logins (24h)' }],
  });
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const [explainPlan, setExplainPlan] = useState<any>(null);
  const [isFormatting, setIsFormatting] = useState(false);

  const handleRun = () => {
      const start = performance.now();
      setTimeout(() => {
          let data = [];
          if (query.toLowerCase().includes('cases')) data = [{ id: 'C-001', title: 'Martinez v. Tech', status: 'Active' }];
          else if (query.toLowerCase().includes('users')) data = [{ id: 'U-101', name: 'Admin User', role: 'Administrator' }];
          else data = [{ result: 'Query executed', rows_affected: 0 }];
          setResults(data);
          setExecutionTime(`${(performance.now() - start).toFixed(2)}ms`);
          setActiveResultsTab('results');
      }, 300);
  };

  const handleFormat = () => {
      setIsFormatting(true);
      let formatted = query;
      SQL_KEYWORDS.forEach(kw => {
          const regex = new RegExp(`\\b${kw}\\b`, 'gi');
          formatted = formatted.replace(regex, kw.toUpperCase());
      });
      formatted = formatted.replace(/SELECT/g, '\nSELECT')
                           .replace(/FROM/g, '\nFROM')
                           .replace(/WHERE/g, '\nWHERE')
                           .replace(/GROUP BY/g, '\nGROUP BY')
                           .replace(/ORDER BY/g, '\nORDER BY')
                           .trim();
      setQuery(formatted);
      setTimeout(() => setIsFormatting(false), 200);
  };
  
  const handleExplain = () => {
      setExplainPlan({ name: 'Sequential Scan', cost: '0.00..25.88', rows: 10, children: [{ name: 'Filter: status = Active' }] });
      setActiveResultsTab('explain');
  };

  const handleShare = () => {
      setShareModalOpen(true);
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
  
  // Very basic check for visualization suitability
  const visualizableData = useMemo(() => {
    if (!results || results.length < 1) return null;
    const keys = Object.keys(results[0]);
    const strKey = keys.find(k => typeof results[0][k] === 'string');
    const numKey = keys.find(k => typeof results[0][k] === 'number');
    if (strKey && numKey) return { data: results, strKey, numKey };
    return null;
  }, [results]);

  return (
    <div className={cn("flex flex-col h-full", theme.background)}>
        {shareModalOpen && (
            <Modal isOpen={true} onClose={() => setShareModalOpen(false)} title="Share Query">
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500">Share a secure link to this saved query with your team.</p>
                    <div className="flex gap-2 p-2 bg-slate-100 rounded border">
                        <span className="text-sm font-mono truncate">https://lexiflow.ai/query/sh_...</span>
                        <CopyButton text="https://lexiflow.ai/query/sh_..." />
                    </div>
                </div>
            </Modal>
        )}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
             {/* Sidebar */}
             <div className={cn("w-full md:w-72 border-b md:border-b-0 md:border-r p-0 flex flex-col shrink-0", theme.surface, theme.border.default)}>
                 <div className={cn("flex border-b", theme.border.default)}>
                     <button onClick={() => setActiveSidebarTab('schema')} className={cn("flex-1 py-3 text-xs font-bold uppercase", activeSidebarTab === 'schema' ? cn("border-b-2", theme.primary.text, theme.primary.border) : cn(theme.text.tertiary, `hover:${theme.text.primary}`))}><Database className="h-4 w-4 mx-auto"/></button>
                     <button onClick={() => setActiveSidebarTab('history')} className={cn("flex-1 py-3 text-xs font-bold uppercase", activeSidebarTab === 'history' ? cn("border-b-2", theme.primary.text, theme.primary.border) : cn(theme.text.tertiary, `hover:${theme.text.primary}`))}><Clock className="h-4 w-4 mx-auto"/></button>
                     <button onClick={() => setActiveSidebarTab('saved')} className={cn("flex-1 py-3 text-xs font-bold uppercase", activeSidebarTab === 'saved' ? cn("border-b-2", theme.primary.text, theme.primary.border) : cn(theme.text.tertiary, `hover:${theme.text.primary}`))}><Star className="h-4 w-4 mx-auto"/></button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4">
                     {activeSidebarTab === 'schema' && Object.entries(MOCK_SCHEMA).map(([table, details]) => (
                         <details key={table} className="group mb-2">
                             <summary className="flex items-center text-sm cursor-pointer p-1.5 rounded list-none group-hover:bg-slate-100">
                                 <Table className="h-4 w-4 mr-2 text-slate-400"/> {table}
                             </summary>
                             <div className="pl-6 pt-1 space-y-1">
                                 {details.columns.map(col => (
                                     <div key={col.name} className="text-xs text-slate-500 flex items-center">
                                        <div className="w-2 h-2 bg-slate-300 rounded-full mr-2"></div>
                                        <span className="font-mono">{col.name}</span>
                                        <span className="ml-2 text-slate-400 font-sans">({col.type})</span>
                                     </div>
                                 ))}
                             </div>
                         </details>
                     ))}
                     {activeSidebarTab === 'history' && (
                        <>
                            <input className="w-full text-xs p-2 border rounded mb-2" placeholder="Search history..."/>
                            {history.filter(h => h.pinned).map(h => (
                                <div key={h.id} className="text-xs p-2 rounded cursor-pointer bg-amber-50 border border-amber-100 mb-1" onClick={() => setQuery(h.q)}>
                                    <div className="font-mono truncate mb-1 text-amber-800">{h.q}</div>
                                </div>
                            ))}
                            {history.filter(h => !h.pinned).map(h => (
                                <div key={h.id} className="text-xs p-2 rounded cursor-pointer hover:bg-slate-100" onClick={() => setQuery(h.q)}>
                                    <div className="font-mono truncate mb-1">{h.q}</div>
                                </div>
                            ))}
                        </>
                     )}
                      {activeSidebarTab === 'saved' && Object.entries(savedQueries).map(([folder, queries]) => (
                         <details key={folder} className="mb-2" open>
                             <summary className="flex items-center text-sm cursor-pointer p-1.5 list-none"><Folder className="h-4 w-4 mr-2 text-amber-500"/> {folder}</summary>
                             {(queries as SavedQuery[]).map(q => (
                                <div key={q.id} className="text-xs p-1.5 pl-7 rounded flex justify-between items-center group">
                                    <span>{q.name}</span>
                                    <button onClick={handleShare} className="opacity-0 group-hover:opacity-100"><Share2 className="h-3 w-3"/></button>
                                </div>
                             ))}
                         </details>
                     ))}
                 </div>
             </div>

             <div className="flex-1 flex flex-col min-w-0">
                <div className={cn("h-[40%] flex flex-col", mode === 'dark' ? "bg-[#1e1e1e]" : "bg-white")}>
                    <div className={cn("flex justify-between items-center p-2 border-b", mode === 'dark' ? "bg-[#252526] border-slate-700" : "bg-slate-50 border-slate-200")}>
                        <div className="flex gap-1">
                            <Button size="xs" variant="secondary" icon={AlignLeft} onClick={handleFormat} isLoading={isFormatting}>Format</Button>
                            <Button size="xs" variant="secondary" icon={Bot} onClick={handleExplain}>Explain</Button>
                        </div>
                        <div className="flex gap-2">
                            <Button size="xs" variant="primary" icon={Play} onClick={handleRun}>Run</Button>
                        </div>
                    </div>
                    <textarea 
                        className={cn("flex-1 bg-transparent font-mono text-sm outline-none resize-none border-none p-4", mode === 'dark' ? "text-[#d4d4d4]" : "text-slate-800")}
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
                            <span className="text-xs font-mono text-slate-500">{executionTime}</span>
                            <div className="relative group">
                                <Button size="xs" variant="secondary" icon={Download} onClick={exportCsv}>Export</Button>
                            </div>
                        </div>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-auto">
                        {activeResultsTab === 'results' && results && results.length > 0 && (
                            <table className="min-w-full divide-y text-sm">
                                <thead><tr>{Object.keys(results[0]).map(k => <th key={k} className="px-4 py-2 text-left font-bold">{k}</th>)}</tr></thead>
                                <tbody className="divide-y">
                                    {results.map((r, i) => (
                                        <tr key={i}>
                                            {(Object.values(r) as any[]).map((v, j) => (
                                                <td key={j} className="px-4 py-2 font-mono whitespace-nowrap">{String(v)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                         {activeResultsTab === 'results' && (!results || results.length === 0) && <div className={cn("p-4 text-sm text-center", theme.text.tertiary)}>No results or query not executed.</div>}
                         {activeResultsTab === 'explain' && explainPlan && <div className="p-4 text-xs font-mono">{JSON.stringify(explainPlan, null, 2)}</div>}
                         {activeResultsTab === 'visualize' && visualizableData && (
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={visualizableData.data}><XAxis dataKey={visualizableData.strKey}/><YAxis/><Tooltip/><Bar dataKey={visualizableData.numKey} fill="#8884d8"/></BarChart>
                             </ResponsiveContainer>
                         )}
                         {activeResultsTab === 'visualize' && !visualizableData && <div className="p-4 text-sm text-slate-400">Data not suitable for visualization.</div>}
                    </div>
                </div>
             </div>
        </div>
    </div>
  );
};
