
import React, { useState } from 'react';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { GeminiService } from '../services/geminiService';
import { XmlDocketParser } from '../services/xmlDocketParser';
import { ArrowRight, FileCode, Sparkles } from 'lucide-react';
import { ParsedDocketPreview } from './docket/ParsedDocketPreview';
import { Stepper } from './common/Stepper';
import { useNotify } from '../hooks/useNotify';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

interface DocketImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export const DocketImportModal: React.FC<DocketImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'text' | 'xml'>('text');
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const notify = useNotify();
  const { theme } = useTheme();

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    
    try {
        if (mode === 'xml') {
            const result = XmlDocketParser.parse(rawText);
            setParsedData(result);
        } else {
            const result = await GeminiService.parseDocket(rawText);
            setParsedData(result);
        }
        notify.success('Parsed docket data successfully');
        setStep(2);
    } catch (e) {
        notify.error("Failed to parse input. Please check the format.");
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
                      className={cn("pb-2 text-sm font-medium flex items-center gap-2 transition-colors", mode === 'text' ? "text-blue-600 border-b-2 border-blue-600" : theme.text.secondary)}
                  >
                      <Sparkles className="h-4 w-4"/> AI Text Parse (PDF/Web)
                  </button>
                  <button 
                      onClick={() => setMode('xml')} 
                      className={cn("pb-2 text-sm font-medium flex items-center gap-2 transition-colors", mode === 'xml' ? "text-blue-600 border-b-2 border-blue-600" : theme.text.secondary)}
                  >
                      <FileCode className="h-4 w-4"/> CM/ECF XML Export
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
                    theme.surfaceHighlight, 
                    theme.text.primary
                )}
                placeholder={mode === 'xml' ? "<caseSummary>...</caseSummary>" : "Paste docket text here..."}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              <div className="flex justify-end pt-2">
                <Button onClick={handleParse} disabled={isParsing || !rawText.trim()} icon={isParsing ? undefined : ArrowRight} isLoading={isParsing}>
                  {isParsing ? 'Processing...' : `Parse ${mode === 'xml' ? 'XML' : 'Text'}`}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && parsedData && (
            <div className="animate-fade-in">
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
