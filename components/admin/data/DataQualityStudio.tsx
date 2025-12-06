
import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Trash2, AlertOctagon, RefreshCw, CheckCircle2, BarChart2, FileSearch, Plus, Settings, Edit2, Loader2 } from 'lucide-react';
import { Card } from '../../common/Card';
import { Tabs } from '../../common/Tabs';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { VirtualList } from '../../common/VirtualList';
import { Modal } from '../../common/Modal';
import { RuleBuilder, QualityRule } from './quality/RuleBuilder';
import { DataProfiler } from './quality/DataProfiler';
import { Button } from '../../common/Button';
import { DataService } from '../../../services/dataService';
import { useQuery } from '../../../services/queryClient';

interface DataQualityStudioProps {
    initialTab?: string;
}

interface Anomaly {
    id: number;
    table: string;
    field: string;
    issue: string;
    count: number;
    sample: string;
    status: 'Detected' | 'Fixing' | 'Fixed';
}

export const DataQualityStudio: React.FC<DataQualityStudioProps> = ({ initialTab = 'dashboard' }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Builder State
  const [isRuleBuilderOpen, setIsRuleBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<QualityRule | undefined>(undefined);

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Integrated Data Query
  const { data: fetchedAnomalies = [], isLoading } = useQuery<Anomaly[]>(
      ['admin', 'anomalies'],
      DataService.admin.getAnomalies as any
  );
  
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
      if (fetchedAnomalies.length > 0) setAnomalies(fetchedAnomalies);
  }, [fetchedAnomalies]);

  const [rules, setRules] = useState<QualityRule[]>([
      { 
          id: 'r1', 
          name: 'Email Completeness', 
          description: 'Ensure user emails follow standard format',
          severity: 'Critical', 
          action: 'Block',
          enabled: true,
          conditions: [{ id: 'c1', field: 'users.email', operator: 'LIKE', value: '%_@__%.__%' }]
      },
      { 
          id: 'r2', 
          name: 'Case Value Range', 
          description: 'Case value cannot be negative',
          severity: 'High', 
          action: 'Warn',
          enabled: true,
          conditions: [{ id: 'c1', field: 'cases.value', operator: '>', value: '0' }]
      },
      { 
          id: 'r3', 
          name: 'Party Role Enum', 
          description: 'Validate party roles against allowed list',
          severity: 'Critical', 
          action: 'Log',
          enabled: true,
          conditions: [{ id: 'c1', field: 'parties.role', operator: 'IN', value: '(Plaintiff, Defendant)' }]
      }
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
              return p + 5;
          });
      }, 100);
  };

  const handleFix = (id: number) => {
      setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: 'Fixing' } : a));
      setTimeout(() => {
          setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: 'Fixed' } : a));
      }, 1500);
  };

  const handleSaveRule = (rule: QualityRule) => {
      if (editingRule) {
          setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      } else {
          setRules(prev => [...prev, rule]);
      }
      setIsRuleBuilderOpen(false);
      setEditingRule(undefined);
  };

  const handleEditRule = (rule: QualityRule) => {
      setEditingRule(rule);
      setIsRuleBuilderOpen(true);
  };

  const handleAddRule = () => {
      setEditingRule(undefined);
      setIsRuleBuilderOpen(true);
  };

  const renderAnomalyRow = (a: Anomaly) => (
      <div key={a.id} className={cn("flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b last:border-0 transition-colors gap-3", theme.border.light, `hover:${theme.surfaceHighlight}`)} style={{ height: 'auto', minHeight: '73px' }}>
         <div className="flex items-start sm:items-center gap-4 flex-1">
             <div className={cn("p-2 rounded-full shrink-0", a.status === 'Fixed' ? cn(theme.status.success.bg, theme.status.success.text) : cn(theme.status.warning.bg, theme.status.warning.text))}>
                 {a.status === 'Fixed' ? <CheckCircle2 className="h-5 w-5"/> : <AlertOctagon className="h-5 w-5"/>}
             </div>
             <div className="min-w-0">
                 <h4 className={cn("font-bold text-sm flex items-center gap-2 truncate", theme.text.primary)}>
                     {a.table}.{a.field}
                     {a.status === 'Fixing' && <RefreshCw className={cn("h-3 w-3 animate-spin", theme.primary.text)}/>}
                 </h4>
                 <p className={cn("text-xs truncate", theme.text.secondary)}>{a.issue} • <span className={cn("font-mono px-1 rounded", theme.surfaceHighlight)}>{a.count} rows</span></p>
             </div>
         </div>
         <div className="flex items-center gap-4 self-end sm:self-auto">
             <span className={cn("text-xs font-mono px-2 py-1 rounded border hidden md:block truncate max-w-[150px]", theme.surfaceHighlight, theme.border.default, theme.text.tertiary)}>Sample: {a.sample}</span>
             {a.status === 'Detected' && (
                 <Button size="sm" variant="outline" icon={Check} onClick={() => handleFix(a.id)}>Fix</Button>
             )}
             {a.status === 'Fixed' && <span className={cn("text-xs font-bold uppercase", theme.status.success.text)}>Resolved</span>}
         </div>
      </div>
  );

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="flex flex-col h-full min-h-0">
        <div className={cn("px-6 pt-6 pb-0 border-b shrink-0", theme.border.default)}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className={cn("text-xl font-bold", theme.text.primary)}>Data Quality Studio</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Automated cleansing and standardization.</p>
                </div>
                <div className="flex gap-2">
                    {isScanning && (
                         <div className={cn("flex items-center text-xs font-bold mr-4", theme.primary.text)}>
                             <RefreshCw className="h-3 w-3 animate-spin mr-2"/> Scanning: {scanProgress}%
                         </div>
                    )}
                    <Button variant="primary" icon={Sparkles} onClick={handleScan} disabled={isScanning}>Run Profiler</Button>
                </div>
            </div>
            <Tabs 
                tabs={['dashboard', 'profiler', 'rules']}
                activeTab={activeTab}
                onChange={(t) => setActiveTab(t as any)}
            />
        </div>

        <div className={cn("flex-1 overflow-y-auto p-6", theme.surfaceHighlight)}>
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={cn("p-4 rounded-lg border shadow-sm", theme.surface, theme.border.default)}>
                            <p className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Overall Health</p>
                            <div className="flex items-center mt-2">
                                <div className={cn("text-3xl font-bold mr-3", theme.status.success.text)}>94%</div>
                                <span className={cn("text-xs font-bold px-2 py-0.5 rounded border", theme.status.success.bg, theme.status.success.text, theme.status.success.border)}>Good</span>
                            </div>
                        </div>
                        <div className={cn("p-4 rounded-lg border shadow-sm", theme.surface, theme.border.default)}>
                             <p className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Critical Errors</p>
                             <div className="flex items-center mt-2">
                                <div className={cn("text-3xl font-bold mr-3", theme.status.error.text)}>{anomalies.filter(a => a.status === 'Detected').length}</div>
                                <span className={cn("text-xs font-bold px-2 py-0.5 rounded border", theme.status.error.bg, theme.status.error.text, theme.status.error.border)}>Action Required</span>
                             </div>
                        </div>
                        <div className={cn("p-4 rounded-lg border shadow-sm", theme.surface, theme.border.default)}>
                             <p className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Rows Scanned</p>
                             <div className="flex items-center mt-2">
                                <div className={cn("text-3xl font-bold mr-3", theme.primary.text)}>1.2M</div>
                                <span className={cn("text-xs", theme.text.secondary)}>Last: Just now</span>
                             </div>
                        </div>
                    </div>

                    <Card title="Anomaly Detection Log" noPadding>
                        <div className="h-[400px]">
                            <VirtualList 
                                items={anomalies}
                                height="100%"
                                itemHeight={73}
                                renderItem={renderAnomalyRow}
                            />
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'rules' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className={cn("font-bold text-lg", theme.text.primary)}>Validation Logic</h4>
                        <Button size="sm" icon={Plus} onClick={handleAddRule}>Add Rule</Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {rules.map(rule => (
                            <div key={rule.id} className={cn("p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between group transition-colors gap-4", theme.surface, theme.border.default, `hover:${theme.primary.border}`)}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className={cn("font-bold text-sm", theme.text.primary)}>{rule.name}</h5>
                                        <span className={cn("text-[10px] px-1.5 rounded uppercase font-bold", 
                                            rule.severity === 'Critical' ? cn(theme.status.error.bg, theme.status.error.text) :
                                            rule.severity === 'High' ? cn(theme.status.warning.bg, theme.status.warning.text) :
                                            cn(theme.status.info.bg, theme.status.info.text)
                                        )}>{rule.severity}</span>
                                    </div>
                                    <div className="flex gap-2 items-center flex-wrap">
                                        <code className={cn("text-xs px-2 py-1 rounded font-mono", theme.surfaceHighlight, theme.text.secondary)}>
                                            {rule.conditions.length > 0 ? `${rule.conditions[0].field} ${rule.conditions[0].operator} ...` : 'No conditions'}
                                        </code>
                                        <span className={cn("text-xs", theme.text.tertiary)}>{rule.description}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <div className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", rule.enabled ? theme.status.success.text.replace('text-', 'bg-') : cn(theme.status.neutral.bg, "dark:bg-slate-700"))}>
                                        <div className={cn("w-3 h-3 rounded-full shadow-sm transition-transform", theme.surface, rule.enabled ? "translate-x-5" : "")}></div>
                                    </div>
                                    <Button size="sm" variant="ghost" icon={Edit2} onClick={() => handleEditRule(rule)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'profiler' && (
                <DataProfiler />
            )}
        </div>

        {/* Rule Builder Modal */}
        <Modal isOpen={isRuleBuilderOpen} onClose={() => setIsRuleBuilderOpen(false)} title="" size="xl" className="p-0 overflow-hidden h-[80vh] flex flex-col">
            <div className="flex-1 flex flex-col min-h-0">
                <RuleBuilder 
                    initialRule={editingRule} 
                    onSave={handleSaveRule} 
                    onCancel={() => setIsRuleBuilderOpen(false)} 
                />
            </div>
        </Modal>
    </div>
  );
};
