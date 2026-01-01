/**
 * CaseContractReview.tsx
 * 
 * AI-powered contract review interface using Gemini API for clause analysis,
 * risk identification, and compliance checking.
 * 
 * @module components/case-detail/CaseContractReview
 * @category Case Management - Contract Analysis
 */

// External Dependencies
import React, { useState } from 'react';
import { ShieldAlert, Upload, FileText, Cpu, AlertTriangle } from 'lucide-react';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Internal Dependencies - Services & Utils
import { GeminiService } from '@/services/features/research/geminiService';
import { cn } from '@/utils/cn';

export const CaseContractReview: React.FC = () => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReview = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const analysis = await GeminiService.reviewContract(text);
    setResult(analysis);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      <div className={cn("flex-1 flex flex-col rounded-lg shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default, theme.surface.highlight)}>
          <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <FileText className={cn("mr-2 h-5 w-5", theme.text.link)} /> Contract Text
          </h3>
          <button className={cn("text-xs flex items-center transition-colors", theme.text.secondary, `hover:${theme.text.link}`)}>
            <Upload className="h-3 w-3 mr-1" /> Import Doc
          </button>
        </div>
        <textarea 
          className={cn("flex-1 p-4 resize-none outline-none font-mono text-sm leading-relaxed", theme.text.primary, theme.surface.default)}
          placeholder="Paste contract text here for analysis..."
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        />
        <div className={cn("p-4 border-t", theme.border.default, theme.surface.highlight)}>
          <button 
            onClick={handleReview}
            disabled={loading || !text}
            className="w-full py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center transition-colors"
          >
            {loading ? <Cpu className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
            Analyze Risks & Suggest Edits
          </button>
        </div>
      </div>

      <div className={cn("flex-1 rounded-lg shadow-sm border flex flex-col overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b", theme.border.default, theme.surface.highlight)}>
          <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <AlertTriangle className={cn("mr-2 h-5 w-5", theme.status.warning.text)} /> AI Risk Analysis
          </h3>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {result ? (
            <div className="prose prose-sm prose-indigo max-w-none">
              <div className={cn("border-l-4 p-4 mb-4", theme.surface.highlight, theme.status.warning.border)}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className={cn("h-5 w-5", theme.status.warning.text)} aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className={cn("text-sm", theme.text.secondary)}>
                      Gemini has identified potential risks in this contract. Please review the redlines below.
                    </p>
                  </div>
                </div>
              </div>
              <div className={cn("whitespace-pre-wrap font-sans", theme.text.secondary)}>{result}</div>
            </div>
          ) : (
            <div className={cn("h-full flex flex-col items-center justify-center", theme.text.tertiary)}>
              <ShieldAlert className="h-12 w-12 mb-3 opacity-20" />
              <p>Enter contract text to generate a risk profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

