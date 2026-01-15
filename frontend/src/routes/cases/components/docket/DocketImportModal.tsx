/**
 * DocketImportModal.tsx
 *
 * Multi-step modal for importing docket data from text or XML with AI parsing
 * and preview capabilities.
 *
 * @module components/docket/DocketImportModal
 * @category Case Management - Docket
 */

// External Dependencies
import { ArrowRight, FileCode, Sparkles } from 'lucide-react';
import { useState } from 'react';

// Internal Dependencies - Components
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { Stepper } from '@/components/molecules/Stepper';
import { ParsedDocketPreview } from './ParsedDocketPreview';

// Internal Dependencies - Hooks & Context
import { useNotify } from '@/hooks/useNotify';
import { useTheme } from '@/contexts/ThemeContext';

// Internal Dependencies - Services & Utils
import { FallbackDocketParser } from '@/services/features/discovery/fallbackDocketParser';
import { XmlDocketParser } from '@/services/features/documents/xmlDocketParser';
import { GeminiService } from '@/services/features/research/geminiService';
import { cn } from '@/lib/cn';

interface DocketImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: unknown) => void;
}

export const DocketImportModal: React.FC<DocketImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'text' | 'xml'>('text');
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [parseConfidence, setParseConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const notify = useNotify();
  const { theme } = useTheme();

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setParseConfidence(null);
    setParseWarnings([]);

    try {
      if (mode === 'xml') {
        const result = await XmlDocketParser.parse(rawText);
        setParsedData(result);
        setParseConfidence('high');
        notify.success('Parsed XML docket successfully');
      } else {
        // Try AI parsing first
        try {
          const result = await GeminiService.parseDocket(rawText);
          setParsedData(result);
          setParseConfidence('high');
          notify.success('AI parsed docket successfully');
        } catch (aiError) {
          // Fallback to regex parser if AI fails
          console.warn('AI parsing failed, falling back to regex parser:', aiError);
          const fallbackResult = FallbackDocketParser.parse(rawText);

          if (!fallbackResult || !fallbackResult.docketEntries || fallbackResult.docketEntries.length === 0) {
            throw new Error('No docket entries found in text');
          }

          setParsedData(fallbackResult);
          // Map numeric confidence (0-100) to string levels
          const confidenceLevel: 'high' | 'medium' | 'low' =
            fallbackResult.confidence >= 80 ? 'high' :
              fallbackResult.confidence >= 50 ? 'medium' : 'low';
          setParseConfidence(confidenceLevel);
          setParseWarnings(fallbackResult.warnings);

          const confidenceMessage = confidenceLevel === 'high'
            ? 'Parsed docket with high confidence'
            : confidenceLevel === 'medium'
              ? 'Parsed docket with medium confidence - please review carefully'
              : 'Parsed docket with low confidence - manual review required';

          notify.success(confidenceMessage);
        }
      }
      setStep(2);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to parse input';
      notify.error(`Parse failed: ${errorMessage}. Please check the format.`);
      console.error('Parse error:', e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFinish = () => {
    onImport(parsedData);
    onClose();
    setTimeout(() => {
      setStep(1);
      setRawText('');
      setParsedData(null);
      setParseConfidence(null);
      setParseWarnings([]);
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Docket" size="lg">
      <div className="p-6">
        <Stepper steps={['Select Source', 'Review Data', 'Import']} currentStep={step} />

        <div className="mt-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className={cn("flex gap-4 border-b pb-1 mb-4", theme.border.default)}>
                <button
                  onClick={() => setMode('text')}
                  className={cn("pb-2 text-sm font-medium flex items-center gap-2 transition-colors", mode === 'text' ? cn(theme.text.link, "border-b-2", theme.action.primary.border) : theme.text.secondary)}
                >
                  <Sparkles className="h-4 w-4" /> AI Text Parse (PDF/Web)
                </button>
                <button
                  onClick={() => setMode('xml')}
                  className={cn("pb-2 text-sm font-medium flex items-center gap-2 transition-colors", mode === 'xml' ? cn(theme.text.link, "border-b-2", theme.action.primary.border) : theme.text.secondary)}
                >
                  <FileCode className="h-4 w-4" /> CM/ECF XML Export
                </button>
              </div>

              <p className={cn("text-sm", theme.text.secondary)}>
                {mode === 'xml'
                  ? "Paste the raw XML output from the court's CM/ECF system. This provides 100% accuracy."
                  : "Paste text from a PDF or website. Gemini AI will attempt to structure the data."}
              </p>
              <textarea
                className={cn(
                  "w-full h-64 p-4 border rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none",
                  theme.border.default,
                  theme.surface.highlight,
                  theme.text.primary
                )}
                placeholder={mode === 'xml' ? "<caseSummary>...</caseSummary>" : "Paste docket text here..."}
                value={rawText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRawText(e.target.value)}
              />
              <div className="flex justify-end pt-2">
                <Button onClick={handleParse} disabled={isParsing || !rawText.trim()} icon={isParsing ? undefined : ArrowRight} isLoading={isParsing}>
                  {isParsing ? 'Processing...' : `Parse ${mode === 'xml' ? 'XML' : 'Text'}`}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && parsedData !== null && (
            <div className="animate-fade-in space-y-4">
              {/* Parse Quality Indicator */}
              {parseConfidence && (
                <div className={cn(
                  "p-3 rounded-lg border",
                  parseConfidence === 'high' ? "bg-green-50 border-green-200" :
                    parseConfidence === 'medium' ? "bg-yellow-50 border-yellow-200" :
                      "bg-red-50 border-red-200"
                )}>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-sm font-medium",
                      parseConfidence === 'high' ? "text-green-800" :
                        parseConfidence === 'medium' ? "text-yellow-800" :
                          "text-red-800"
                    )}>
                      Parse Confidence: {parseConfidence.toUpperCase()}
                    </span>
                    <span className={cn(
                      "text-xs",
                      parseConfidence === 'high' ? "text-green-600" :
                        parseConfidence === 'medium' ? "text-yellow-600" :
                          "text-red-600"
                    )}>
                      {parseConfidence === 'high' ? 'Proceed with confidence' :
                        parseConfidence === 'medium' ? 'Review recommended' :
                          'Manual review required'}
                    </span>
                  </div>
                  {parseWarnings.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {parseWarnings.map((warning, idx) => (
                        <li key={idx} className={cn(
                          "text-xs",
                          parseConfidence === 'high' ? "text-green-700" :
                            parseConfidence === 'medium' ? "text-yellow-700" :
                              "text-red-700"
                        )}>
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <ParsedDocketPreview
                parsedData={parsedData}
                setStep={setStep}
                handleFinish={handleFinish}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
