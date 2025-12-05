
import React, { useState } from 'react';
import { Play, Eraser, Save, Database, Table, Clock, Star, MoreVertical, Download, Terminal } from 'lucide-react';
import { Button } from '../../common/Button';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

export const QueryConsole: React.FC = () => {
  const { theme, mode } = useTheme();
  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'saved'>('editor');
  const [query, setQuery] = useState('SELECT * FROM cases WHERE status = \'Active\' LIMIT 10;');
  const [results, setResults] = useState<any[] | null>(null);
  const [executionTime, setExecutionTime] = useState<string | null>(null);

  // Mock Query Parser
  const handleRun = () => {
      const start = performance.now();
      setTimeout(() => {
          // Simulate data based on table name in query
          let data = [];
          if (query.toLowerCase().includes('cases')) {
              data = [
                { id: 'C-001', title: 'Martinez v. Tech', status: 'Active', value: 45000, jurisdiction: 'Federal' },
                { id: 'C-002', title: 'Estate of J. Smith', status: 'Active', value: 120000, jurisdiction: 'State' },
                { id: 'C-003', title: 'In Re: Merger', status: 'Active', value: 8500000, jurisdiction: 'Federal' }
              ];
          } else if (query.toLowerCase().includes('users')) {
              data = [
                  { id: 'U-101', name: 'Admin User', role: 'Administrator', email: 'admin@firm.com' },
                  { id: 'U-102', name: 'Partner One', role: 'Partner', email: 'p1@firm.com' },
              ];
          } else {
              data = [{ result: 'Query executed successfully', rows_affected: 0 }];
          }
          setResults(data);
          setExecutionTime(`${(performance.now() - start).toFixed(2)}ms`);
      }, 300); // Network delay
  };

  return (
    <div className={cn("flex flex-col h-full", theme.background)}>
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
             {/* Sidebar */}
             <div className={cn("w-64 border-r p-0 flex flex-col shrink-0", theme.surface, theme.border.default)}>
                 <div className={cn("flex border-b", theme.border.default)}>
                     <button onClick={() => setActiveTab('editor')} className={cn("flex-1 py-3 text-xs font-bold uppercase", activeTab === 'editor' ? cn("border-b-2", theme.primary.text, theme.primary.border) : cn(theme.text.tertiary, `hover:${theme.text.primary}`))}>Browser</button>
                     <button onClick={() => setActiveTab('history')} className={cn("flex-1 py-3 text-xs font-bold uppercase", activeTab === 'history' ? cn("border-b-2", theme.primary.text, theme.primary.border) : cn(theme.text.tertiary, `hover:${theme.text.primary}`))}>History</button>
                     <button onClick={() => setActiveTab('saved')} className={cn("flex-1 py-3 text-xs font-bold uppercase", activeTab === 'saved' ? cn("border-b-2", theme.primary.text, theme.primary.border) : cn(theme.text.tertiary, `hover:${theme.text.primary}`))}>Saved</button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4">
                     {activeTab === 'editor' && (
                        <div className="space-y-4">
                            <div>
                                <h4 className={cn("text-xs font-bold uppercase mb-2", theme.text.secondary)}>Public Schema</h4>
                                <div className="space-y-1">
                                    {['cases', 'documents', 'users', 'audit_logs', 'parties'].map(table => (
                                        <div key={table} className={cn("flex items-center text-sm cursor-pointer p-1.5 rounded transition-colors group", theme.text.primary, `hover:${theme.surfaceHighlight}`)}>
                                            <Table className={cn("h-4 w-4 mr-2", theme.text.tertiary, `group-hover:${theme.primary.text}`)}/> {table}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                     )}
                     {activeTab === 'history' && (
                         <div className="space-y-3">
                             {[
                                 { q: "SELECT * FROM cases", t: "1 min ago" },
                                 { q: "UPDATE users SET role...", t: "15 mins ago" },
                                 { q: "DELETE FROM audit_logs...", t: "1 hour ago" }
                             ].map((h, i) => (
                                 <div key={i} className={cn("text-xs p-2 rounded cursor-pointer border border-transparent", theme.text.secondary, `hover:${theme.surfaceHighlight}`, `hover:${theme.border.default}`)} onClick={() => setQuery(h.q)}>
                                     <div className={cn("font-mono truncate mb-1", theme.text.primary)}>{h.q}</div>
                                     <div className={cn("flex items-center", theme.text.tertiary)}><Clock className="h-3 w-3 mr-1"/> {h.t}</div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             </div>

             {/* Main Area */}
             <div className="flex-1 flex flex-col min-w-0">
                <div className={cn("h-[40%] flex flex-col", mode === 'dark' ? "bg-[#1e1e1e]" : "bg-white")}>
                    <div className={cn("flex justify-between items-center p-2 border-b", mode === 'dark' ? "bg-[#252526] border-slate-700" : "bg-slate-50 border-slate-200")}>
                        <span className={cn("text-xs font-bold uppercase flex items-center px-2", mode === 'dark' ? "text-slate-400" : "text-slate-600")}>
                            <Database className="h-3 w-3 mr-2 text-blue-400"/> Primary Cluster
                        </span>
                        <div className="flex gap-2">
                            <Button size="xs" variant="secondary" className={cn("border-transparent", mode === 'dark' ? "bg-[#333] text-white hover:bg-[#444]" : "bg-white text-slate-700 hover:bg-slate-100")} icon={Save}>Save</Button>
                            <Button size="xs" variant="primary" icon={Play} onClick={handleRun} className="bg-green-600 hover:bg-green-700 border-transparent">Run</Button>
                        </div>
                    </div>
                    <textarea 
                        className={cn(
                            "flex-1 bg-transparent font-mono text-sm outline-none resize-none border-none p-4 leading-relaxed selection:bg-blue-500/30", 
                            mode === 'dark' ? "text-[#d4d4d4]" : "text-slate-800"
                        )}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        spellCheck={false}
                    />
                </div>
                
                <div className={cn("flex-1 overflow-hidden flex flex-col", theme.surface, "border-t", theme.border.default)}>
                    <div className={cn("p-2 border-b flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
                        <div className="flex items-center gap-4">
                            <span className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Results</span>
                            {executionTime && <span className={cn("text-xs font-mono px-2 py-0.5 rounded border", theme.status.success.text, theme.status.success.bg, theme.status.success.border)}>{executionTime}</span>}
                            {results && <span className={cn("text-xs", theme.text.secondary)}>{results.length} rows</span>}
                        </div>
                        <div className="flex gap-1">
                             <button className={cn("p-1 rounded", theme.text.tertiary, `hover:${theme.surface}`)}><Download className="h-4 w-4"/></button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto">
                        {results ? (
                            <table className={cn("min-w-full divide-y text-sm border-separate border-spacing-0", theme.border.default)}>
                                <thead className={cn("sticky top-0 z-10", theme.surfaceHighlight)}>
                                    <tr>
                                        {Object.keys(results[0]).map(k => (
                                            <th key={k} className={cn("px-6 py-3 text-left font-bold uppercase text-xs border-b", theme.text.secondary, theme.border.default, theme.surfaceHighlight)}>{k}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={cn("divide-y", theme.border.light, theme.surface)}>
                                    {results.map((r, i) => (
                                        <tr key={i} className={cn("transition-colors", `hover:${theme.surfaceHighlight}`)}>
                                            {Object.values(r).map((v: any, j) => (
                                                <td key={j} className={cn("px-6 py-2 font-mono whitespace-nowrap", theme.text.primary)}>{v}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className={cn("h-full flex flex-col items-center justify-center text-sm", theme.text.tertiary)}>
                                <Terminal className="h-12 w-12 mb-3 opacity-20"/>
                                <p>Execute a query to see results.</p>
                                <p className="text-xs mt-2 opacity-70">Cmd + Enter to run</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
    </div>
  );
};
