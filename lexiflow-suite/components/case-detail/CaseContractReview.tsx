
import React, { useState, useTransition } from 'react';
import { ShieldAlert, CheckCircle, Upload, FileText, Cpu, AlertTriangle, ArrowRight } from 'lucide-react';
import { GeminiService } from '../../services/geminiService.ts';
import { Button } from '../common/Button.tsx';

export const CaseContractReview: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleReview = async () => {
    if (!text.trim()) return;
    setLoading(true);
    // Use transition for potentially heavy rendering of AI result
    const analysis = await GeminiService.reviewContract(text);
    startTransition(() => {
        setResult(analysis);
        setLoading(false);
    });
  };

  return (
    <div className={`h-full flex flex-col md:flex-row gap-6 animate-fade-in transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      {/* Input Panel */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center text-sm">
            <FileText className="mr-2 h-5 w-5 text-blue-600" /> Contract Source
          </h3>
          <button className="text-xs flex items-center font-medium text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm hover:shadow transition-all">
            <Upload className="h-3 w-3 mr-1.5" /> Import
          </button>
        </div>
        <textarea 
          className="flex-1 p-6 resize-none outline-none font-mono text-sm leading-relaxed text-slate-700 bg-white"
          placeholder="Paste contract text here for AI analysis..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <Button 
            onClick={handleReview}
            disabled={loading || !text}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            icon={loading ? Cpu : ShieldAlert}
            isLoading={loading}
          >
            {loading ? 'Analyzing Risks...' : 'Analyze Risks & Suggest Edits'}
          </Button>
        </div>
      </div>

      {/* Analysis Panel */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center text-sm">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" /> AI Risk Report
          </h3>
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
          {result ? (
            <div className="prose prose-sm prose-indigo max-w-none">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-amber-800">Potential Risks Detected</h3>
                    <div className="mt-1 text-xs text-amber-700">
                      Gemini has analyzed the text and identified clauses that may require attention.
                    </div>
                  </div>
                </div>
              </div>
              <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">{result}</div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="p-4 bg-slate-50 rounded-full mb-3">
                  <ShieldAlert className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Waiting for input...</p>
              <p className="text-xs mt-1">Enter contract text to generate a risk profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
