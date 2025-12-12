
import React, { useState } from 'react';
import { DataDictionaryItem } from '../../../../types';
import { DataService } from '../../../../services/dataService';
import { useMutation } from '../../../../services/queryClient';
import { Button } from '../../../common/Button';
import { Card } from '../../../common/Card';
import { Input, TextArea } from '../../../common/Inputs';
import { Badge } from '../../../common/Badge';
import { ArrowLeft, Save, Shield, Tag, Database, User, Clock, Wand2, Activity } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { useNotify } from '../../../../hooks/useNotify';
import { GeminiService } from '../../../../services/geminiService';

interface DictionaryItemDetailProps {
    item: DataDictionaryItem;
    onClose: () => void;
}

export const DictionaryItemDetail: React.FC<DictionaryItemDetailProps> = ({ item, onClose }) => {
    const { theme } = useTheme();
    const notify = useNotify();
    const [formData, setFormData] = useState({ ...item });
    const [isGenerating, setIsGenerating] = useState(false);

    const { mutate: saveChanges, isLoading } = useMutation(
        async (data: Partial<DataDictionaryItem>) => {
            return DataService.catalog.updateItem(item.id, data);
        },
        {
            onSuccess: () => {
                notify.success("Dictionary item updated successfully.");
                onClose();
            },
            onError: () => notify.error("Failed to update item.")
        }
    );

    const handleAISuggestion = async () => {
        setIsGenerating(true);
        try {
            const suggestion = await GeminiService.generateDraft(
                `Generate a concise technical description for a database column named '${formData.column}' in table '${formData.table}'. 
                Context: Legal Tech Enterprise Application. Domain: ${formData.domain}.`,
                'Description'
            );
            // Strip HTML from draft since TextArea expects plain text usually, or keep if rich
            setFormData(prev => ({ ...prev, description: suggestion.replace(/<[^>]*>?/gm, '') }));
        } catch (e) {
            notify.error("AI Suggestion failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={cn("flex flex-col h-full animate-in slide-in-from-right duration-200", theme.surfaceHighlight)}>
            <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.default, theme.border.default)}>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" icon={ArrowLeft} onClick={onClose}>Back</Button>
                    <div>
                        <h2 className={cn("font-bold text-lg font-mono", theme.primary.text)}>{formData.table}.{formData.column}</h2>
                        <p className={cn("text-xs", theme.text.secondary)}>ID: {formData.id}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="primary" icon={Save} onClick={() => saveChanges(formData)} isLoading={isLoading}>Save Changes</Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card title="Definition & Metadata">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="flex justify-between mb-1">
                                            <label className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Description</label>
                                            <button 
                                                onClick={handleAISuggestion}
                                                disabled={isGenerating}
                                                className="text-xs text-purple-600 flex items-center hover:underline"
                                            >
                                                <Wand2 className="h-3 w-3 mr-1"/> {isGenerating ? 'Generating...' : 'AI Suggest'}
                                            </button>
                                        </div>
                                        <TextArea 
                                            value={formData.description} 
                                            onChange={e => setFormData({...formData, description: e.target.value})} 
                                            rows={4}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input 
                                            label="Data Type" 
                                            value={formData.dataType} 
                                            disabled 
                                            className="font-mono text-xs"
                                        />
                                        <div>
                                            <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Domain Owner</label>
                                            <select 
                                                className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                                                value={formData.domain}
                                                onChange={e => setFormData({...formData, domain: e.target.value as any})}
                                            >
                                                <option value="Legal">Legal</option>
                                                <option value="Finance">Finance</option>
                                                <option value="HR">HR</option>
                                                <option value="IT">IT</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Governance & Security">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Data Classification</label>
                                        <div className="space-y-2">
                                            {['Public', 'Internal', 'Confidential', 'Restricted'].map(cls => (
                                                <div 
                                                    key={cls}
                                                    onClick={() => setFormData({...formData, classification: cls as any})}
                                                    className={cn(
                                                        "flex items-center p-2 rounded border cursor-pointer transition-colors",
                                                        formData.classification === cls 
                                                            ? cn(theme.primary.light, theme.primary.border, "border-l-4 border-l-blue-600") 
                                                            : cn(theme.surface.default, theme.border.default)
                                                    )}
                                                >
                                                    <Shield className={cn("h-4 w-4 mr-2", formData.classification === cls ? "text-blue-600" : theme.text.tertiary)}/>
                                                    <span className="text-sm font-medium">{cls}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className={cn("p-4 rounded-lg border", theme.status.error.bg, theme.status.error.border)}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={cn("text-sm font-bold", theme.status.error.text)}>PII Flag</span>
                                                <input 
                                                    type="checkbox" 
                                                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                                    checked={formData.isPII}
                                                    onChange={e => setFormData({...formData, isPII: e.target.checked})}
                                                />
                                            </div>
                                            <p className={cn("text-xs", theme.status.error.text)}>Checking this enforces column-level encryption and strict access logging.</p>
                                        </div>
                                        <Input 
                                            label="Data Steward / Owner" 
                                            value={formData.owner} 
                                            onChange={e => setFormData({...formData, owner: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card title="Tech Specs">
                                <div className="space-y-3 text-sm">
                                    <div className={cn("flex justify-between border-b pb-2", theme.border.light)}>
                                        <span className={theme.text.secondary}>Source System</span>
                                        <span className="font-medium">{formData.sourceSystem}</span>
                                    </div>
                                    <div className={cn("flex justify-between border-b pb-2", theme.border.light)}>
                                        <span className={theme.text.secondary}>Last Updated</span>
                                        <span className="font-mono text-xs">{new Date().toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={theme.text.secondary}>Quality Score</span>
                                        <Badge variant="success">{formData.dataQualityScore}/100</Badge>
                                    </div>
                                    <div className={cn("w-full rounded-full h-1.5 mt-2", theme.surfaceHighlight)}>
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${formData.dataQualityScore}%` }}></div>
                                    </div>
                                </div>
                            </Card>

                            <div className={cn("p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                                <h4 className={cn("font-bold text-sm mb-3 flex items-center gap-2", theme.text.primary)}>
                                    <Activity className="h-4 w-4 text-blue-500"/> Usage Stats
                                </h4>
                                <div className={cn("space-y-2 text-xs", theme.text.secondary)}>
                                    <p>• Used in <strong>12</strong> Reports</p>
                                    <p>• Queried <strong>1.4k</strong> times (Last 30d)</p>
                                    <p>• <strong>3</strong> Downstream Dependencies</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
