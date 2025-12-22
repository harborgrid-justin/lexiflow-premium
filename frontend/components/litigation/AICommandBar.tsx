
/**
 * AICommandBar.tsx
 * 
 * Floating command bar for AI-assisted strategy generation.
 * 
 * @module components/litigation/AICommandBar
 */

import React, { useState } from 'react';
import { Sparkles, Wand2, AlertCircle } from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { GeminiService } from '../../services/features/research/geminiService';
import { useNotify } from '../../hooks/useNotify';
import { AIValidationService } from '../../services/infrastructure/aiValidationService';
import { AICommandBarProps } from './types';

export const AICommandBar: React.FC<AICommandBarProps> = ({ onGenerate }) => {
    const { theme } = useTheme();
    const notify = useNotify();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [remainingRequests, setRemainingRequests] = useState(3);

    const handleGenerate = async () => {
        if (!prompt) return;

        // Validate prompt
        const promptValidation = AIValidationService.validatePrompt(prompt);
        if (!promptValidation.isValid) {
            notify.error(promptValidation.errors[0]);
            setRemainingRequests(AIValidationService.getRemainingRequests());
            return;
        }

        setIsLoading(true);
        try {
            const result = await GeminiService.generateStrategyFromPrompt(promptValidation.sanitizedPrompt!);
            
            // Validate AI response
            const responseValidation = AIValidationService.validateAIResponse(result);
            if (!responseValidation.isValid) {
                notify.error(`AI validation failed: ${responseValidation.errors[0]}`);
                return;
            }

            if (responseValidation.sanitizedResponse) {
                onGenerate(responseValidation.sanitizedResponse);
                notify.success('AI generated strategy map!');
                setPrompt('');
                setRemainingRequests(AIValidationService.getRemainingRequests());
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
            <div className={cn("p-2 rounded-xl shadow-2xl border backdrop-blur-md", theme.surface.default, "bg-opacity-80", theme.border.default)}>
                <div className="relative flex items-center gap-2">
                    <div className="pl-2">
                         <Sparkles className="h-5 w-5 text-purple-500"/>
                    </div>
                    <input 
                        className="flex-1 bg-transparent border-none outline-none text-sm p-2 placeholder:text-slate-400"
                        placeholder="Generate a strategy (e.g., 'Standard breach of contract litigation plan')"
                        value={prompt}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleGenerate}
                        isLoading={isLoading}
                        disabled={isLoading || !prompt || remainingRequests === 0}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg"
                        icon={Wand2}
                    >
                        {isLoading ? 'Generating' : 'Generate'}
                    </Button>
                </div>
                {remainingRequests < 3 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-2 px-2">
                        <AlertCircle className="h-3 w-3" />
                        <span>{remainingRequests} request{remainingRequests !== 1 ? 's' : ''} remaining this minute</span>
                    </div>
                )}
            </div>
        </div>
    );
};

