import { Button } from '@/components/ui/atoms/Button/Button';
import { TextArea } from '@/components/ui/atoms/TextArea/TextArea';
import { useTheme } from '@/providers';
import { GeminiService } from '@/services/features/research/geminiService';
import { cn } from '@/utils/cn';
import { RetryError, retryWithBackoff } from '@/utils/retryWithBackoff';
import { AlertCircle, FileText, RefreshCw, Sparkles, Wand2, WifiOff } from 'lucide-react';
import React, { useState } from 'react';

interface AIDraftingAssistantProps {
    onInsert: (text: string) => void;
    caseContext: {
        title: string;
        summary?: string;
    };
}

export const AIDraftingAssistant: React.FC<AIDraftingAssistantProps> = ({ onInsert, caseContext }) => {
    const { theme } = useTheme();
    const [prompt, setPrompt] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);
    const [tone, setTone] = useState<'Persuasive' | 'Neutral' | 'Aggressive'>('Persuasive');
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleDraft = async () => {
        if (!prompt) return;

        setIsDrafting(true);
        setError(null);
        setRetryAttempt(0);
        setGeneratedText('');

        try {
            // Enhanced prompt with better context
            const fullPrompt = `
            Draft a section for a legal pleading with the following context:

            CASE INFORMATION:
            - Title: ${caseContext.title}
            - Summary: ${caseContext.summary || 'No summary provided'}

            DRAFTING PARAMETERS:
            - Tone: ${tone}
            - Style: Professional legal writing
            - Format: Proper paragraph structure with legal citations where appropriate

            USER REQUEST:
            ${prompt}

            INSTRUCTIONS:
            - Use clear, concise legal language
            - Include relevant legal standards if applicable
            - Format as proper legal paragraphs
            - Do NOT include markdown code blocks
            - Return ONLY the legal text
        `;

            // Use retry logic with exponential backoff
            const result = await retryWithBackoff(
                () => GeminiService.generateDraft(fullPrompt, 'Pleading Section'),
                {
                    maxRetries: 3,
                    initialDelay: 1000,
                    maxDelay: 8000,
                    backoffFactor: 2,
                    onRetry: (attempt, retryError) => {
                        setRetryAttempt(attempt);
                        console.warn(`Retry attempt ${attempt}:`, retryError.message);
                    }
                }
            );

            setGeneratedText(result);
            setError(null);
        } catch (e) {
            console.error('AI drafting error:', e);

            if (e instanceof RetryError) {
                setError(`Failed after ${e.attempts} attempts: ${e.lastError.message}`);
                setGeneratedText('');
            } else {
                setError('An unexpected error occurred. Please check your connection and try again.');
                setGeneratedText('');
            }
        } finally {
            setIsDrafting(false);
            setRetryAttempt(0);
        }
    };

    return (
        <div className={cn("flex flex-col h-full border-l", theme.surface.highlight, theme.border.default)}>
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
                        {['Persuasive', 'Neutral', 'Aggressive'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTone(t as 'Persuasive' | 'Neutral' | 'Aggressive')}
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

                {error && (
                    <div className={cn("p-3 rounded-lg border flex items-start gap-2", "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300")}>
                        <WifiOff className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                            <div className="font-semibold mb-1">Connection Error</div>
                            <div>{error}</div>
                        </div>
                    </div>
                )}

                <Button
                    onClick={handleDraft}
                    isLoading={isDrafting}
                    variant="primary"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none text-white"
                    icon={Wand2}
                    disabled={!prompt.trim()}
                >
                    {isDrafting ? (
                        retryAttempt > 0 ? `Retrying (${retryAttempt}/3)...` : 'Drafting...'
                    ) : 'Generate Text'}
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
                        <div className={cn("p-3 rounded border text-sm font-serif leading-relaxed mb-3", theme.surface.default, theme.border.default, theme.text.primary)}>
                            {generatedText}
                        </div>
                        <Button onClick={() => onInsert(generatedText)} variant="secondary" className="w-full" icon={FileText}>
                            Insert into Document
                        </Button>
                    </div>
                )}

                <div className={cn("p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex gap-2 items-start mt-6")}>
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                        <strong>Tip:</strong> You can reference specific exhibit IDs (e.g., &quot;Exhibit A&quot;) in your prompt and the AI will contextually link them.
                    </p>
                </div>
            </div>
        </div>
    );
};
