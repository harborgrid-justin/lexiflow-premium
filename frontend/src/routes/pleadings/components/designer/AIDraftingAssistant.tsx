import { Button } from '@/components/atoms/Button/Button';
import { TextArea } from '@/components/atoms/TextArea/TextArea';
import { useTheme } from "@/hooks/useTheme";
import { GeminiService } from '@/services/features/research/geminiService';
import { cn } from '@/lib/cn';
import { AlertCircle, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import React, { useState } from 'react';

interface AIDraftingAssistantProps {
    onInsert: (text: string) => void;
    caseContext: {
        title: string;
        summary?: string;
    };
}

const AIDraftingAssistant: React.FC<AIDraftingAssistantProps> = ({ onInsert, caseContext }) => {
    const { theme } = useTheme();
    const [prompt, setPrompt] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);
    const [tone, setTone] = useState<'Persuasive' | 'Neutral' | 'Aggressive'>('Persuasive');

    const handleDraft = async () => {
        if (!prompt) return;
        setIsDrafting(true);
        try {
            const fullPrompt = `
            Draft a section for a legal pleading.
            Case Context: ${caseContext.title}. ${caseContext.summary || ''}
            Tone: ${tone}.
            User Instruction: ${prompt}

            Return only the legal text, formatted in paragraphs. No markdown code blocks.
        `;

            const result = await GeminiService.generateDraft(fullPrompt, 'Pleading Section');
            setGeneratedText(result);
        } catch (e) {
            console.error(e);
            setGeneratedText("Error contacting AI service. Please try again.");
        } finally {
            setIsDrafting(false);
        }
    };

    return (
        <div className={cn("flex flex-col h-full", theme.surface.highlight)}>
            <div className={cn("p-4 border-b", theme.surface.default, theme.border.default)}>
                <h3 className={cn("text-sm font-bold flex items-center gap-2", theme.text.primary)}>
                    <Sparkles className="h-4 w-4 text-purple-600" /> AI Co-Counsel
                </h3>
                <p className={cn("text-xs mt-1", theme.text.secondary)}>Draft arguments based on case facts.</p>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
                <div>
                    <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Drafting Goal</label>
                    <TextArea
                        value={prompt}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                        placeholder="e.g., Draft an introduction arguing that the court lacks personal jurisdiction..."
                        rows={4}
                        className={theme.surface.default}
                    />
                </div>

                <div>
                    <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Tone Strategy</label>
                    <div className="flex gap-2">
                        {(['Persuasive', 'Neutral', 'Aggressive'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTone(t)}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-medium rounded border transition-colors",
                                    tone === t
                                        ? "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300"
                                        : cn(theme.surface.default, theme.border.default, theme.text.secondary)
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleDraft}
                    isLoading={isDrafting}
                    variant="primary"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none text-white"
                    icon={Wand2}
                >
                    {isDrafting ? 'Drafting...' : 'Generate Text'}
                </Button>

                {generatedText && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Result</span>
                            <div className="flex gap-2">
                                <button onClick={handleDraft} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title="Regenerate">
                                    <RefreshCw className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                        <div className={cn("p-3 rounded border text-sm font-serif leading-relaxed mb-3 max-h-60 overflow-y-auto", theme.surface.default, theme.border.default, theme.text.primary)}>
                            {generatedText}
                        </div>
                        <Button onClick={() => onInsert(generatedText)} variant="secondary" className="w-full">
                            Insert into Document
                        </Button>
                    </div>
                )}

                <div className={cn("p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex gap-2 items-start mt-6")}>
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                        <strong>Tip:</strong> You can reference specific exhibit IDs (e.g., "Exhibit A") in your prompt and the AI will contextually link them.
                    </p>
                </div>
            </div>
        </div>
    );
};
export default AIDraftingAssistant;
