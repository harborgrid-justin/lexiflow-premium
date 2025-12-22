
import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Trash2, Play, Save, Code, CheckCircle, Database } from 'lucide-react';
import { Button } from '../../../common/Button';
import { Input, TextArea } from '../../../common/Inputs';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { Modal } from '../../../common/Modal';

export interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface QualityRule {
  id: string;
  name: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  action: 'Block' | 'Warn' | 'Log';
  conditions: RuleCondition[];
  enabled: boolean;
}

interface RuleBuilderProps {
  initialRule?: QualityRule;
  onSave: (rule: QualityRule) => void;
  onCancel: () => void;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({ initialRule, onSave, onCancel }) => {
  const { theme } = useTheme();
  
  // Deterministic initialization
  const [rule, setRule] = useState<QualityRule>(() => initialRule || {
    id: '', // Empty ID for new rules, generated on save if needed
    name: '',
    description: '',
    severity: 'Medium',
    action: 'Warn',
    conditions: [{ id: 'c1', field: '', operator: '=', value: '' }],
    enabled: true
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [testStats, setTestStats] = useState({ passed: 0, failed: 0 });

  const addCondition = () => {
    setRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, { id: `c-${crypto.randomUUID()}`, field: '', operator: '=', value: '' }]
    }));
  };

  const removeCondition = (id: string) => {
    setRule(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id)
    }));
  };

  const updateCondition = (id: string, field: keyof RuleCondition, value: string) => {
    setRule(prev => ({
      ...prev,
      conditions: prev.conditions.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const generatedSQL = useMemo(() => {
    if (rule.conditions.length === 0) return '-- No conditions defined';
    const clauses = rule.conditions.map(c => 
      `${c.field || 'field'} ${c.operator} ${c.value ? `'${c.value}'` : 'value'}`
    );
    return `SELECT * FROM dataset\nWHERE ${clauses.join('\n  AND ')};`;
  }, [rule.conditions]);

  const handleTest = () => {
    setTestStatus('running');
    setTimeout(() => {
      setTestStatus('success');
      setTestStats({
        passed: Math.floor(Math.random() * 5000) + 1000,
        failed: Math.floor(Math.random() * 50)
      });
    }, 800);
  };
  
  const handleSave = () => {
      // Ensure ID exists before saving
      const ruleToSave = {
          ...rule,
          id: rule.id || `rule-${Date.now()}` // Generate ID only on commit
      };
      onSave(ruleToSave);
  };

  return (
    <div className={cn("flex flex-col h-full", theme.surface.default)}>
        {/* Header */}
        <div className={cn("p-6 border-b flex justify-between items-center", theme.border.default)}>
            <div>
                <h2 className={cn("text-xl font-bold", theme.text.primary)}>
                    {initialRule ? 'Edit Validation Rule' : 'Create Validation Rule'}
                </h2>
                <p className={cn("text-sm mt-1", theme.text.secondary)}>Define logic to identify data anomalies.</p>
            </div>
            <div className="flex gap-3">
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button variant="primary" icon={Save} onClick={handleSave}>Save Rule</Button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Left: Configuration */}
            <div className={cn("flex-1 p-6 overflow-y-auto border-r", theme.border.default)}>
                <div className="space-y-6 max-w-2xl">
                    <div className="grid grid-cols-1 gap-6">
                        <Input label="Rule Name" value={rule.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRule({...rule, name: e.target.value})} placeholder="e.g. Email Format Validation" />
                        <TextArea label="Description" value={rule.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRule({...rule, description: e.target.value})} rows={2} placeholder="Describe the business logic..." />
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Severity</label>
                                <div className="flex gap-2">
                                    {['Critical', 'High', 'Medium', 'Low'].map(s => (
                                        <button 
                                            key={s}
                                            onClick={() => setRule({...rule, severity: s as any})}
                                            className={cn(
                                                "flex-1 py-2 text-xs font-bold rounded border transition-all",
                                                rule.severity === s 
                                                    ? cn(theme.primary.light, theme.primary.text, theme.primary.border) 
                                                    : theme.border.default
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Enforcement Action</label>
                                <select 
                                    className={cn("w-full p-2 border rounded-md text-sm outline-none", theme.border.default, theme.surface.default, theme.text.primary)}
                                    value={rule.action}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRule({...rule, action: e.target.value as any})}
                                >
                                    <option value="Block">Block Operation</option>
                                    <option value="Warn">Warning Only</option>
                                    <option value="Log">Log Quietly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={cn("pt-6 border-t border-dashed", theme.border.default)}>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className={cn("font-bold text-sm", theme.text.primary)}>Logic Conditions</h4>
                            <Button size="sm" variant="ghost" icon={Plus} onClick={addCondition}>Add Condition</Button>
                        </div>
                        
                        <div className="space-y-3">
                            {rule.conditions.map((cond, idx) => (
                                <div key={cond.id} className="flex gap-3 items-center">
                                    <span className={cn("text-xs font-mono w-6 text-center", theme.text.tertiary)}>{idx === 0 ? 'WHERE' : 'AND'}</span>
                                    <input 
                                        className={cn("flex-1 p-2 text-sm border rounded", theme.border.default, theme.surface.highlight, theme.text.primary)} 
                                        placeholder="Field (e.g. email)"
                                        value={cond.field}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCondition(cond.id, 'field', e.target.value)}
                                    />
                                    <select 
                                        className={cn("w-32 p-2 text-sm border rounded", theme.border.default, theme.surface.default, theme.text.primary)}
                                        value={cond.operator}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCondition(cond.id, 'operator', e.target.value)}
                                    >
                                        <option value="=">=</option>
                                        <option value="!=">!=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                        <option value="LIKE">LIKE</option>
                                        <option value="IS NULL">IS NULL</option>
                                    </select>
                                    <input 
                                        className={cn("flex-1 p-2 text-sm border rounded", theme.border.default, theme.surface.default, theme.text.primary)} 
                                        placeholder="Value"
                                        value={cond.value}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCondition(cond.id, 'value', e.target.value)}
                                    />
                                    <button onClick={() => removeCondition(cond.id)} className="text-slate-400 hover:text-red-500 p-1">
                                        <Trash2 className="h-4 w-4"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Preview & Test */}
            <div className={cn("w-96 p-6 flex flex-col", theme.surface.highlight)}>
                 <div className="mb-6">
                    <h4 className={cn("font-bold text-xs uppercase mb-3 flex items-center", theme.text.secondary)}>
                        <Code className="h-4 w-4 mr-2"/> Generated Query
                    </h4>
                    <div className={cn("rounded-lg p-4 border overflow-x-auto", theme.surface.default, theme.border.default)}>
                        <pre className={cn("text-xs font-mono leading-relaxed whitespace-pre-wrap", theme.text.primary)}>
                            {generatedSQL}
                        </pre>
                    </div>
                 </div>

                 <div className={cn("rounded-lg border shadow-sm flex-1 flex flex-col p-4", theme.surface.default, theme.border.default)}>
                    <h4 className={cn("font-bold text-xs uppercase mb-4 flex items-center", theme.text.secondary)}>
                        <Database className="h-4 w-4 mr-2"/> Impact Simulation
                    </h4>
                    
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        {testStatus === 'idle' && (
                            <>
                                <div className={cn("p-3 rounded-full mb-3", theme.surface.highlight)}><Play className={cn("h-6 w-6", theme.text.tertiary)}/></div>
                                <p className={cn("text-sm mb-4", theme.text.secondary)}>Test this rule against a sample dataset to verify logic.</p>
                                <Button variant="outline" onClick={handleTest}>Run Test</Button>
                            </>
                        )}
                        {testStatus === 'running' && (
                            <div className="text-blue-600 text-sm font-medium animate-pulse">Running query on sample...</div>
                        )}
                        {testStatus === 'success' && (
                            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center justify-center text-green-600 mb-2">
                                    <CheckCircle className="h-8 w-8"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <div className={cn("p-3 border rounded-lg", theme.status.success.bg, theme.status.success.border)}>
                                        <span className={cn("block text-lg font-bold", theme.status.success.text)}>{testStats.passed}</span>
                                        <span className={cn("text-xs uppercase", theme.status.success.text)}>Passed</span>
                                    </div>
                                    <div className={cn("p-3 border rounded-lg", theme.status.error.bg, theme.status.error.border)}>
                                        <span className={cn("block text-lg font-bold", theme.status.error.text)}>{testStats.failed}</span>
                                        <span className={cn("text-xs uppercase", theme.status.error.text)}>Failed</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleTest}>Run Again</Button>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};
