import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, FileSearch, RefreshCw, Scale, Lock, Edit2, Plus, Users, Save, CheckCircle, X, FileText } from 'lucide-react';
import { Card } from '../../../common/Card';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { Modal } from '../../common/Modal';
import { Input, TextArea } from '../../../common/Inputs';
import { Tabs } from '../../../common/Tabs';
import { Button } from '../../../common/Button';

interface GovernanceConsoleProps {
    initialTab?: string;
}

export const GovernanceConsole: React.FC<GovernanceConsoleProps> = ({ initialTab = 'overview' }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [editingRule, setEditingRule] = useState<any>(null);

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const [rules, setRules] = useState([
      { id: 1, name: 'PII Encryption', status: 'Enforced', impact: 'High', passing: '100%', desc: 'All columns tagged PII must be encrypted at rest.' },
      { id: 2, name: 'Duplicate Detection', status: 'Monitoring', impact: 'Medium', passing: '98.2%', desc: 'Flag records with >95% similarity in core fields.' },
      { id: 3, name: 'Retention Policy (7 Years)', status: 'Enforced', impact: 'Critical', passing: '100%', desc: 'Hard delete case data 7 years after closure.' },
  ]);

  const [policies, setPolicies] = useState([
      { id: 'pol1', title: 'Data Retention Standard', version: '2.4', status: 'Active', date: '2024-01-15' },
      { id: 'pol2', title: 'Access Control Policy', version: '1.1', status: 'Review', date: '2023-11-30' },
      { id: 'pol3', title: 'GDPR Compliance Guide', version: '3.0', status: 'Active', date: '2024-02-10' }
  ]);

  const handleScan = () => {
      setIsScanning(true);
      setScanProgress(0);
      const interval = setInterval(() => {
          setScanProgress(p => {
              if (p >= 100) {
                  clearInterval(interval);
                  setIsScanning(false);
                  return 100;
              }
              return p + 10;
          });
      }, 200);
  };

  return (
    <div className="flex flex-col h-full">
        <div className={cn("px-6 pt-6 border-b", theme.border.default)}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className={cn("text-xl font-bold", theme.text.primary)}>Governance & Compliance</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Policy enforcement and risk mitigation.</p>
                </div>
            </div>
            <Tabs 
                tabs={['overview', 'policies', 'access']}
                activeTab={activeTab}
                onChange={(t) => setActiveTab(t as any)}
            />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={cn("border rounded-lg p-6 flex items-center justify-between", theme.border.default, "bg-emerald-500/10 border-emerald-500/20")}>
                            <div>
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Compliance Score</p>
                                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">98.5%</p>
                            </div>
                            <ShieldCheck className="h-10 w-10 text-emerald-500 opacity-50"/>
                        </div>
                        <div className={cn("border rounded-lg p-6 flex items-center justify-between", theme.border.default, "bg-amber-500/10 border-amber-500/20")}>
                            <div>
                                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Risk Items</p>
                                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 mt-1">3</p>
                            </div>
                            <AlertTriangle className="h-10 w-10 text-amber-500 opacity-50"/>
                        </div>
                        <div className={cn("border rounded-lg p-6 flex items-center justify-between", theme.border.default, "bg-blue-500/10 border-blue-500/20")}>
                            <div>
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Enforced Rules</p>
                                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{rules.length}</p>
                            </div>
                            <FileSearch className="h-10 w-10 text-blue-500 opacity-50"/>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Compliance Frameworks">
                            <div className="space-y-4">
                                {['GDPR', 'SOC 2 Type II', 'CCPA', 'HIPAA'].map(fw => (
                                    <div key={fw} className={cn("flex items-center justify-between p-3 rounded border", theme.surfaceHighlight, theme.border.default)}>
                                        <div className="flex items-center gap-2">
                                            <Scale className={cn("h-5 w-5", theme.text.secondary)}/>
                                            <span className={cn("font-bold text-sm", theme.text.primary)}>{fw}</span>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Compliant</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        
                        <Card title="Active Rules" action={<Button size="sm" variant="outline" onClick={handleScan}>{isScanning ? `Scanning ${scanProgress}%` : 'Run Scan'}</Button>}>
                            <div className="space-y-2">
                                {rules.map(r => (
                                    <div key={r.id} className={cn("flex justify-between items-center p-3 border rounded-lg", theme.border.default, `hover:${theme.surfaceHighlight}`)}>
                                        <div>
                                            <p className={cn("text-sm font-bold", theme.text.primary)}>{r.name}</p>
                                            <p className={cn("text-xs", theme.text.secondary)}>{r.status} • {r.impact}</p>
                                        </div>
                                        <button onClick={() => setEditingRule(r)} className="text-blue-500 hover:text-blue-600"><Edit2 className="h-4 w-4"/></button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {activeTab === 'policies' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className={cn("text-lg font-bold", theme.text.primary)}>Internal Policies</h3>
                        <Button icon={Plus}>Draft Policy</Button>
                    </div>
                    <div className="space-y-3">
                        {policies.map(pol => (
                            <div key={pol.id} className={cn("flex items-center justify-between p-4 border rounded-lg shadow-sm transition-all hover:shadow-md", theme.surface, theme.border.default)}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-2 rounded-lg", theme.surfaceHighlight, theme.text.secondary)}><FileText className="h-6 w-6"/></div>
                                    <div>
                                        <h4 className={cn("font-bold text-sm", theme.text.primary)}>{pol.title}</h4>
                                        <p className={cn("text-xs", theme.text.secondary)}>Version {pol.version} • Updated {pol.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={cn("text-xs font-bold px-2 py-1 rounded border", pol.status === 'Active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20")}>{pol.status}</span>
                                    <Button size="sm" variant="ghost">View</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'access' && (
                <div className={cn("text-center py-12 border-2 border-dashed rounded-lg", theme.border.default, theme.text.tertiary)}>
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-20"/>
                    <p>Identity & Access Governance Module</p>
                    <p className="text-sm mt-2">Review permissions, roles, and separation of duties.</p>
                </div>
            )}
        </div>

        {/* Rule Modal */}
        {editingRule && (
            <Modal isOpen={true} onClose={() => setEditingRule(null)} title="Edit Rule">
                <div className="p-6 space-y-4">
                    <Input label="Rule Name" value={editingRule.name} onChange={e => setEditingRule({...editingRule, name: e.target.value})}/>
                    <div className="flex justify-end gap-2 mt-4">
                         <Button variant="secondary" onClick={() => setEditingRule(null)}>Cancel</Button>
                         <Button variant="primary" onClick={() => setEditingRule(null)}>Save</Button>
                    </div>
                </div>
            </Modal>
        )}
    </div>
  );
};
