
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, AlertTriangle, FileSearch, Scale, Edit2, Plus, FileText } from 'lucide-react';
import { Card } from '../../common/Card';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Modal } from '../../common/Modal';
import { Input } from '../../common/Inputs';
import { Tabs } from '../../common/Tabs';
import { Button } from '../../common/Button';
import { AccessGovernance } from './governance/AccessGovernance';
import { CentredLoader, ModalFooter } from '../../common/RefactoredCommon';

interface GovernanceConsoleProps {
    initialTab?: string;
}

export const GovernanceConsole: React.FC<GovernanceConsoleProps> = ({ initialTab = 'overview' }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [editingRule, setEditingRule] = useState<any>(null);
  
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
      return () => {
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      }
  }, []);

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
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      setIsScanning(true);
      setScanProgress(0);
      scanIntervalRef.current = setInterval(() => {
          setScanProgress(p => {
              if (p >= 100) {
                  if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
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
                        <div className={cn("border rounded-lg p-6 flex items-center justify-between", theme.border.default, theme.status.success.bg, theme.status.success.border)}>
                            <div>
                                <p className={cn("text-xs font-bold uppercase tracking-wider", theme.status.success.text)}>Compliance Score</p>
                                <p className={cn("text-3xl font-bold mt-1", theme.status.success.text)}>98.5%</p>
                            </div>
                            <ShieldCheck className={cn("h-10 w-10 opacity-50", theme.status.success.text)}/>
                        </div>
                        <div className={cn("border rounded-lg p-6 flex items-center justify-between", theme.border.default, theme.status.warning.bg, theme.status.warning.border)}>
                            <div>
                                <p className={cn("text-xs font-bold uppercase tracking-wider", theme.status.warning.text)}>Risk Items</p>
                                <p className={cn("text-3xl font-bold mt-1", theme.status.warning.text)}>3</p>
                            </div>
                            <AlertTriangle className={cn("h-10 w-10 opacity-50", theme.status.warning.text)}/>
                        </div>
                        <div className={cn("border rounded-lg p-6 flex items-center justify-between", theme.border.default, theme.status.info.bg, theme.status.info.border)}>
                            <div>
                                <p className={cn("text-xs font-bold uppercase tracking-wider", theme.status.info.text)}>Enforced Rules</p>
                                <p className={cn("text-3xl font-bold mt-1", theme.status.info.text)}>{rules.length}</p>
                            </div>
                            <FileSearch className={cn("h-10 w-10 opacity-50", theme.status.info.text)}/>
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
                                        <span className={cn("text-xs font-bold px-2 py-1 rounded border", theme.status.success.text, theme.status.success.bg, theme.status.success.border)}>Compliant</span>
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
                                    <span className={cn("text-xs font-bold px-2 py-1 rounded border", pol.status === 'Active' ? cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border) : cn(theme.status.warning.bg, theme.status.warning.text, theme.status.warning.border))}>{pol.status}</span>
                                    <Button size="sm" variant="ghost">View</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'access' && (
                <AccessGovernance />
            )}
        </div>

        {/* Rule Modal */}
        {editingRule && (
            <Modal isOpen={true} onClose={() => setEditingRule(null)} title="Edit Rule">
                <div className="p-6 space-y-4">
                    <Input label="Rule Name" value={editingRule.name} onChange={e => setEditingRule({...editingRule, name: e.target.value})}/>
                    <ModalFooter>
                         <Button variant="secondary" onClick={() => setEditingRule(null)}>Cancel</Button>
                         <Button variant="primary" onClick={() => setEditingRule(null)}>Save</Button>
                    </ModalFooter>
                </div>
            </Modal>
        )}
    </div>
  );
};
