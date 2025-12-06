
import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Lock, Plus, Save } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Button } from '../../common/Button';

export const SecurityMatrix: React.FC = () => {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState<'matrix' | 'policies'>('matrix');

  const roles = ['Admin', 'Partner', 'Associate', 'Paralegal', 'Client'];
  const resources = ['Cases', 'Financials', 'Personnel', 'System Config', 'Audit Logs', 'Reports', 'Integrations', 'Security Settings', 'Data Export', 'API Keys'];

  return (
    <div className="flex flex-col h-full">
        <div className={cn("p-4 border-b flex justify-between items-center shrink-0", theme.surface, theme.border.default)}>
            <div className={cn("flex gap-2 p-1 rounded-lg border", theme.surfaceHighlight, theme.border.default)}>
                <button 
                    onClick={() => setActiveView('matrix')}
                    className={cn("px-4 py-1.5 text-xs font-bold rounded transition-all", activeView === 'matrix' ? cn(theme.surface, "shadow", theme.primary.text) : theme.text.secondary)}
                >
                    Access Matrix
                </button>
                <button 
                    onClick={() => setActiveView('policies')}
                    className={cn("px-4 py-1.5 text-xs font-bold rounded transition-all", activeView === 'policies' ? cn(theme.surface, "shadow", theme.primary.text) : theme.text.secondary)}
                >
                    RLS Policies
                </button>
            </div>
            <Button variant="primary" icon={Save}>Save Changes</Button>
        </div>

        <div className={cn("flex-1 overflow-hidden p-6", theme.surfaceHighlight)}>
            {activeView === 'matrix' ? (
                <div className={cn("h-full w-full rounded-lg border shadow-sm overflow-auto bg-white dark:bg-slate-900 relative", theme.border.default)}>
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className={cn("text-xs uppercase font-bold", theme.text.secondary)}>
                            <tr>
                                <th className={cn("px-6 py-4 sticky top-0 left-0 z-20 border-b border-r bg-gray-50 dark:bg-slate-800 min-w-[200px]", theme.border.default)}>Resource Scope</th>
                                {roles.map(r => (
                                    <th key={r} className={cn("px-6 py-4 text-center sticky top-0 z-10 border-b bg-gray-50 dark:bg-slate-800", theme.border.default)}>{r}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={cn("divide-y", theme.border.light)}>
                            {resources.map(res => (
                                <tr key={res} className={cn("transition-colors", `hover:${theme.surfaceHighlight}`)}>
                                    <td className={cn("px-6 py-4 font-medium flex items-center gap-2 sticky left-0 z-10 border-r bg-white dark:bg-slate-900", theme.text.primary, theme.border.default)}>
                                        <Shield className="h-4 w-4 text-blue-500 shrink-0"/> {res}
                                    </td>
                                    {roles.map(role => {
                                        const access = (role === 'Admin' || (role === 'Partner' && res !== 'System Config')) 
                                            ? 'Full' : (role === 'Client' && res === 'Cases') 
                                            ? 'Own' : (role === 'Client') ? 'None' : 'Read';
                                        
                                        return (
                                            <td key={role} className={cn("px-6 py-4 text-center cursor-pointer transition-colors border-r last:border-r-0 border-dashed border-slate-100 dark:border-slate-800")}>
                                                <div className="flex justify-center">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-20 justify-center",
                                                        access === 'Full' ? "bg-green-50 text-green-700 border-green-200" :
                                                        access === 'Own' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                        access === 'Read' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                        cn(theme.surfaceHighlight, theme.text.secondary, theme.border.default, "opacity-50")
                                                    )}>
                                                        {access === 'None' ? <XCircle className="h-3 w-3"/> : <CheckCircle className="h-3 w-3"/>}
                                                        {access}
                                                    </span>
                                                </div>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl mx-auto h-full overflow-y-auto pr-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={cn("font-bold text-lg", theme.text.primary)}>Row Level Security Policies (Postgres)</h3>
                        <Button size="sm" variant="outline" icon={Plus}>Add Policy</Button>
                    </div>
                    {[
                        { name: 'tenant_isolation', table: 'all_tables', cmd: 'ALL', using: 'org_id = current_setting(\'app.current_org_id\')::uuid' },
                        { name: 'client_case_access', table: 'cases', cmd: 'SELECT', using: 'EXISTS (SELECT 1 FROM case_parties WHERE case_id = cases.id AND party_id = current_user_id())' },
                        { name: 'ethical_wall_barrier', table: 'documents', cmd: 'ALL', using: 'NOT EXISTS (SELECT 1 FROM ethical_walls WHERE case_id = documents.case_id AND current_user_id() = ANY(restricted_users))' },
                    ].map((pol, i) => (
                        <div key={i} className={cn("p-4 rounded-lg border shadow-sm border-l-4 border-l-purple-500", theme.surface, theme.border.default)}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className={cn("font-bold text-sm", theme.text.primary)}>{pol.name}</h4>
                                    <p className={cn("text-xs", theme.text.secondary)}>Table: <span className="font-mono text-purple-600">{pol.table}</span> • {pol.cmd}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-slate-400"/>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Active</span>
                                </div>
                            </div>
                            <div className={cn("p-3 rounded border font-mono text-xs break-all", theme.surfaceHighlight, theme.border.light, theme.text.secondary)}>
                                <span className="text-blue-600 font-bold">USING</span> ({pol.using})
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
