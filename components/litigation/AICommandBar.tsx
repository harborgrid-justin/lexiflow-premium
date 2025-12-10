
import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { GeminiService } from '../../services/geminiService';
import { useNotify } from '../../hooks/useNotify';

interface AICommandBarProps {
  onGenerate: (graph: { nodes: any[], connections: any[] }) => void;
}

export const AICommandBar: React.FC<AICommandBarProps> = ({ onGenerate }) => {
    const { theme } = useTheme();
    const notify = useNotify();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        try {
            const result = await GeminiService.generateStrategyFromPrompt(prompt);
            if (result && result.nodes && result.connections) {
                onGenerate(result);
                notify.success('AI generated strategy map!');
                setPrompt('');
            } else {
                notify.error('AI failed to generate a valid graph.');
            }
        } catch(e) {
            notify.error('An error occurred during generation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl z-30", theme.text.primary)}>
            <div className={cn("p-2 rounded-xl shadow-2xl border backdrop-blur-md", theme.surface, "bg-opacity-80", theme.border.default)}>
                <div className="relative flex items-center gap-2">
                    <div className="pl-2">
                         <Sparkles className="h-5 w-5 text-purple-500"/>
                    </div>
                    <input 
                        className="flex-1 bg-transparent border-none outline-none text-sm p-2 placeholder:text-slate-400"
                        placeholder="Generate a strategy (e.g., 'Standard breach of contract litigation plan')"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleGenerate}
                        isLoading={isLoading}
                        disabled={isLoading || !prompt}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg"
                        icon={Wand2}
                    >
                        {isLoading ? 'Generating' : 'Generate'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
