/**
 * @module components/matters/CaseDataImport
 * @category Case Management - Data Import
 * @description AI-powered case data import with intelligent field mapping for XML, docket sheets, and structured data
 */

import { Button } from '@/shared/ui/atoms/Button/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { useNotify } from '@/hooks/useNotify';
import { useTheme } from '@/features/theme';
import { XmlDocketParser } from '@/services/features/documents/xmlDocketParser';
import { GeminiService } from '@/services/features/research/geminiService';
import type { Case, DocketEntry, Party } from '@/types';
import { cn } from '@/shared/lib/cn';
import { ArrowRight, CheckCircle, FileCode, FileText, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ParsedCaseData {
  caseInfo?: Partial<Case>;
  parties?: Party[];
  docketEntries?: DocketEntry[];
  confidence?: 'high' | 'medium' | 'low';
  warnings?: string[];
}

export const CaseDataImport: React.FC<{
  onImport?: (data: ParsedCaseData) => void;
  onCancel?: () => void;
}> = ({ onImport, onCancel }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [activeTab, setActiveTab] = useState<'import' | 'manual'>('import');
  const [step, setStep] = useState<'input' | 'parse' | 'review'>('input');
  const [mode, setMode] = useState<'text' | 'xml' | 'ai'>('text');
  const [rawInput, setRawInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCaseData | null>(null);

  const handleParse = async () => {
    if (!rawInput.trim()) {
      notify.error('Please enter some data to parse');
      return;
    }

    setIsParsing(true);
    setStep('parse');

    try {
      let result: ParsedCaseData;

      if (mode === 'xml') {
        const xmlResult = await XmlDocketParser.parse(rawInput);
        result = {
          caseInfo: xmlResult.caseInfo,
          parties: xmlResult.parties,
          docketEntries: xmlResult.docketEntries,
          confidence: 'high',
          warnings: []
        };
        notify.success('XML parsed successfully');
      } else {
        const aiResult = await GeminiService.parseDocket(rawInput);
        result = {
          caseInfo: aiResult.caseInfo as Partial<Case>,
          parties: aiResult.parties as Party[],
          docketEntries: aiResult.docketEntries as DocketEntry[],
          confidence: mode === 'ai' ? 'high' : 'medium',
          warnings: mode === 'ai' ? [] : ['Text parsing may need review']
        };
        notify.success('Parsing completed');
      }

      setParsedData(result);
      setStep('review');
    } catch (error) {
      console.error('Parse error:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to parse data');
      setStep('input');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className={cn("text-2xl font-bold", theme.text.primary)}>
          Import Case Data
        </h2>
        <p className={cn("text-sm mt-2", theme.text.secondary)}>
          Paste XML, docket sheet, or structured case data - AI will intelligently map fields
        </p>
      </div>

      <div className={cn("border-b", theme.border.default)}>
        <div className="flex gap-6 px-4">
          <button
            onClick={() => setActiveTab('import')}
            className={cn(
              "pb-3 text-sm font-medium transition-colors relative",
              activeTab === 'import'
                ? cn(theme.text.link, "border-b-2", theme.action.primary.border)
                : theme.text.secondary
            )}
          >
            <Sparkles className="h-4 w-4 inline-block mr-2" />
            AI Import
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={cn(
              "pb-3 text-sm font-medium transition-colors relative",
              activeTab === 'manual'
                ? cn(theme.text.link, "border-b-2", theme.action.primary.border)
                : theme.text.secondary
            )}
          >
            <FileText className="h-4 w-4 inline-block mr-2" />
            Manual Entry
          </button>
        </div>
      </div>

      {activeTab === 'import' && (
        <>
          {step === 'input' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={cn(
                    "cursor-pointer transition-all border-2 rounded-lg p-6",
                    mode === 'xml' ? "border-blue-500" : theme.border.default
                  )}
                  onClick={() => setMode('xml')}
                >
                  <div className="flex flex-col items-center text-center">
                    <FileCode className={cn("h-10 w-10 mb-3", mode === 'xml' ? "text-blue-500" : theme.text.secondary)} />
                    <h3 className={cn("font-bold", theme.text.primary)}>CM/ECF XML</h3>
                    <p className={cn("text-xs mt-2", theme.text.secondary)}>
                      100% accurate from court systems
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "cursor-pointer transition-all border-2 rounded-lg p-6",
                    mode === 'text' ? "border-purple-500" : theme.border.default
                  )}
                  onClick={() => setMode('text')}
                >
                  <div className="flex flex-col items-center text-center">
                    <FileText className={cn("h-10 w-10 mb-3", mode === 'text' ? "text-purple-500" : theme.text.secondary)} />
                    <h3 className={cn("font-bold", theme.text.primary)}>Docket Sheet</h3>
                    <p className={cn("text-xs mt-2", theme.text.secondary)}>
                      Paste text from PDF/web
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "cursor-pointer transition-all border-2 rounded-lg p-6",
                    mode === 'ai' ? "border-emerald-500" : theme.border.default
                  )}
                  onClick={() => setMode('ai')}
                >
                  <div className="flex flex-col items-center text-center">
                    <Sparkles className={cn("h-10 w-10 mb-3", mode === 'ai' ? "text-emerald-500" : theme.text.secondary)} />
                    <h3 className={cn("font-bold", theme.text.primary)}>AI Smart Parse</h3>
                    <p className={cn("text-xs mt-2", theme.text.secondary)}>
                      Any format - AI figures it out
                    </p>
                  </div>
                </div>
              </div>

              <Card>
                <div className="space-y-4">
                  <h3 className={cn("font-bold", theme.text.primary)}>
                    {mode === 'xml' ? 'Paste XML Data' : mode === 'ai' ? 'Paste Any Format' : 'Paste Docket Text'}
                  </h3>

                  <textarea
                    className={cn(
                      "w-full h-96 p-4 border rounded-lg font-mono text-xs resize-none",
                      "focus:ring-2 focus:ring-blue-500 outline-none",
                      theme.border.default,
                      theme.surface.default,
                      theme.text.primary
                    )}
                    placeholder="Paste case data here..."
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                  />

                  <div className="flex justify-between items-center">
                    <p className={cn("text-xs", theme.text.secondary)}>
                      {rawInput.length} characters
                    </p>
                    <div className="flex gap-2">
                      {onCancel && (
                        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                      )}
                      <Button onClick={handleParse} disabled={!rawInput.trim() || isParsing} icon={ArrowRight}>
                        {isParsing ? 'Parsing...' : 'Parse & Map Fields'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {step === 'parse' && (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <h3 className={cn("text-lg font-bold", theme.text.primary)}>
                  Analyzing your data...
                </h3>
              </div>
            </Card>
          )}

          {step === 'review' && parsedData && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg border bg-green-50 border-green-200 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-bold text-sm text-green-900">Extraction Complete</h4>
                  <p className="text-xs mt-1 text-green-700">Review extracted data below</p>
                </div>
              </div>

              {parsedData.caseInfo && (
                <Card title="Case Information">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(parsedData.caseInfo).map(([key, value]) =>
                      value && (
                        <div key={key} className={cn("p-3 rounded", theme.surface.highlight)}>
                          <div className={cn("text-xs font-bold mb-1", theme.text.secondary)}>
                            {key.toUpperCase()}
                          </div>
                          <div className={cn("text-sm", theme.text.primary)}>
                            {String(value)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep('input')}>← Back</Button>
                <Button onClick={() => onImport?.(parsedData)} icon={CheckCircle}>
                  Import Case
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'manual' && (
        <Card>
          <div className="space-y-6 p-6 max-w-2xl mx-auto">
            <div className="text-center py-8">
              <FileText className={cn("h-16 w-16 mx-auto mb-4", theme.text.secondary)} />
              <h3 className={cn("text-lg font-bold mb-2", theme.text.primary)}>Manual Case Entry</h3>
              <p className={cn("text-sm mb-6", theme.text.secondary)}>
                Fill out case details using a traditional form
              </p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className={cn("block text-xs font-medium mb-1", theme.text.secondary)}>
                  Case Number *
                </label>
                <input
                  type="text"
                  placeholder="1:24-cv-12345"
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm",
                    theme.border.default,
                    theme.surface.default
                  )}
                />
              </div>

              <div>
                <label className={cn("block text-xs font-medium mb-1", theme.text.secondary)}>
                  Case Title *
                </label>
                <input
                  type="text"
                  placeholder="Smith v. Jones"
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm",
                    theme.border.default,
                    theme.surface.default
                  )}
                />
              </div>

              <div className="flex justify-between pt-4 border-t">
                {onCancel && (
                  <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                )}
                <Button icon={CheckCircle}>Create Case</Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
