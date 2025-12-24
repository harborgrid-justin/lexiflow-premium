/**
 * RiskDetail.tsx
 * 
 * Detailed risk editor with AI-powered mitigation suggestions,
 * risk matrix visualization, and probability/impact controls.
 * 
 * @module components/case-detail/risk/RiskDetail
 * @category Case Management - Risk Assessment
 */

// External Dependencies
import React, { useState } from 'react';
import { X, Save, Trash2, Wand2 } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '../../../common/Button';
import { Input, TextArea } from '../../../common/Inputs';
import { RiskMatrix } from './RiskMatrix';
import { Modal } from '../../../common/Modal';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../../context/ThemeContext';

// Internal Dependencies - Services & Utils
import { GeminiService } from '../../../../services/features/research/geminiService';
import { cn } from '../../../../utils/cn';

// Types & Interfaces
import { Risk, RiskLevel, RiskCategory, RiskStatus } from '../../../../types';

interface RiskDetailProps {
  risk: Risk;
  onUpdate: (risk: Risk) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const RiskDetail: React.FC<RiskDetailProps> = ({ risk, onUpdate, onDelete, onClose }) => {
  const { theme } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateMitigation = async () => {
      if (!risk.title) return;
      setIsGenerating(true);
      const prompt = `Suggest a legal mitigation strategy for the following risk in a litigation case:
      Risk: ${risk.title}
      Description: ${risk.description}
      Category: ${risk.category}
      Severity: ${risk.probability} Probability, ${risk.impact} Impact.`;
      
      const plan = await GeminiService.generateDraft(prompt, 'Mitigation Plan');
      onUpdate({ ...risk, mitigationPlan: plan });
      setIsGenerating(false);
  };

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-right duration-200">
        <div className={cn("p-6 border-b flex justify-between items-center sticky top-0 z-10", theme.surface.default, theme.border.default)}>
            <div>
                <h3 className={cn("font-bold text-lg", theme.text.primary)}>Risk Assessment</h3>
                <p className={cn("text-xs font-mono", theme.text.tertiary)}>ID: {risk.id}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4"/></Button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-4">
                <Input 
                    label="Risk Title" 
                    value={risk.title} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ ...risk, title: e.target.value })}
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Category</label>
                        <select 
                            title="Select risk category"
                            className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                            value={risk.category}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ ...risk, category: e.target.value as RiskCategory })}
                        >
                            <option value="Legal">Legal</option>
                            <option value="Financial">Financial</option>
                            <option value="Reputational">Reputational</option>
                            <option value="Operational">Operational</option>
                        </select>
                    </div>
                    <div>
                        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Status</label>
                        <select 
                            title="Select risk status"
                            className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                            value={risk.status}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ ...risk, status: e.target.value as RiskStatus })}
                        >
                            <option value="Identified">Identified</option>
                            <option value="Mitigated">Mitigated</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                </div>

                <TextArea 
                    label="Description" 
                    rows={3}
                    value={risk.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({ ...risk, description: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <div>
                        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Probability</label>
                        <div className="flex gap-2">
                            {['Low', 'Medium', 'High'].map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => onUpdate({ ...risk, probability: lvl as RiskLevel })}
                                    className={cn(
                                        "flex-1 py-2 text-xs font-bold rounded border transition-all",
                                        risk.probability === lvl 
                                            ? cn(theme.action.primary.bg, "text-white", theme.action.primary.border, "shadow-md") 
                                            : cn(theme.surface.default, theme.text.secondary, theme.border.default, `hover:${theme.surface.highlight}`)
                                    )}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Impact</label>
                        <div className="flex gap-2">
                            {['Low', 'Medium', 'High'].map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => onUpdate({ ...risk, impact: lvl as RiskLevel })}
                                    className={cn(
                                        "flex-1 py-2 text-xs font-bold rounded border transition-all",
                                        risk.impact === lvl 
                                            ? cn(theme.action.primary.bg, "text-white", theme.action.primary.border, "shadow-md") 
                                            : cn(theme.surface.default, theme.text.secondary, theme.border.default, `hover:${theme.surface.highlight}`)
                                    )}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={cn("flex justify-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                    <RiskMatrix probability={risk.probability} impact={risk.impact} />
                </div>
            </div>

            <div className={cn("space-y-3 pt-4 border-t", theme.border.default)}>
                <div className="flex justify-between items-center">
                    <h4 className={cn("font-bold text-sm", theme.text.primary)}>Mitigation Strategy</h4>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        icon={Wand2} 
                        onClick={handleGenerateMitigation}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'AI Suggest'}
                    </Button>
                </div>
                <textarea 
                    className={cn(
                        "w-full p-4 border rounded-lg text-sm leading-relaxed h-40 focus:ring-2 focus:ring-blue-500 outline-none resize-none",
                        theme.surface.default,
                        theme.border.default,
                        theme.text.primary
                    )}
                    placeholder="Outline steps to reduce probability or impact..."
                    value={risk.mitigationPlan || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({ ...risk, mitigationPlan: e.target.value })}
                />
            </div>
        </div>

        <div className={cn("p-4 border-t flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
            <button onClick={() => onDelete(risk.id)} title="Delete risk" className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors">
                <Trash2 className="h-5 w-5"/>
            </button>
            <Button variant="primary" icon={Save} onClick={() => { onClose(); }}>Save Changes</Button>
        </div>
    </div>
  );
};
