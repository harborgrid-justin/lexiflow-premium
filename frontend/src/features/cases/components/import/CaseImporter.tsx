/**
 * @module components/cases/CaseImporter
 * @category Case Management - Data Import
 * @description Import and parse case data from XML or plain text documents using AI-powered extraction
 * 
 * FEATURES:
 * - AI-powered structured data extraction using Google Gemini
 * - Parse XML (PACER, CourtListener, custom formats)
 * - Parse structured text documents
 * - Auto-extract metadata and map to backend fields
 * - Preview extracted data before creating case
 * - Validation against CreateCaseDto requirements
 */

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Plus, X, Edit2, Sparkles, Settings } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Button } from '@/components/atoms';
import { api } from '@/api';
import { queryClient } from '@/hooks/useQueryHooks';
import { getAIProvider, setAIProvider, type AIProvider } from '@/services/features/research/aiProviderSelector';
import { CaseStatus, MatterType } from '@/types/enums';
import { UserId, MetadataRecord } from '@/types/primitives';

interface ParsedCaseData {
  title?: string;
  caseNumber?: string;
  description?: string;
  type?: string;
  status?: string;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  referredJudge?: string;
  magistrateJudge?: string;
  filingDate?: string;
  trialDate?: string;
  closeDate?: string;
  dateTerminated?: string;
  juryDemand?: string;
  causeOfAction?: string;
  natureOfSuit?: string;
  natureOfSuitCode?: string;
  relatedCases?: { court: string; caseNumber: string; relationship?: string }[];
  assignedTeamId?: string;
  leadAttorneyId?: string;
  clientId?: string;
  metadata?: Record<string, unknown>;
}

export const CaseImporter: React.FC = () => {
  const { theme } = useTheme();
  
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedCaseData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [useAI, setUseAI] = useState(true); // Toggle for AI vs rule-based parsing
  const [aiProvider, setAiProviderState] = useState<AIProvider>(getAIProvider());

  // Handle AI provider change
  const handleProviderChange = (provider: AIProvider) => {
    setAIProvider(provider);
    setAiProviderState(provider);
    setError(null);
    setSuccessMessage(`Switched to ${provider.toUpperCase()} API`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle parse button click
  const handleParse = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);
    setParsedData(null);

    try {
      const trimmedInput = inputText.trim();
      
      if (!trimmedInput) {
        setError('Please paste some content to parse');
        setIsProcessing(false);
        return;
      }

      // Get API key from storage if available
      const apiKey = aiProvider === 'gemini' 
        ? (localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY)
        : (localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY);

      // Call backend API for parsing
      const parsed = await api.cases.parse(trimmedInput, {
        useAI,
        provider: aiProvider,
        apiKey: apiKey || undefined
      });

      if (parsed && Object.keys(parsed).length > 0) {
        setParsedData(parsed);
        // Check if we got a full extraction or partial fallback
        const isFullExtraction = (parsed as { title?: string; caseNumber?: string; description?: string }).title && (parsed as { title?: string; caseNumber?: string; description?: string }).caseNumber && (parsed as { title?: string; caseNumber?: string; description?: string }).description;
        if (isFullExtraction) {
          setSuccessMessage('Successfully extracted case data using AI!');
        } else {
          setSuccessMessage('Extracted partial data. Please review and fill in missing fields.');
          if (useAI) {
            setError('AI extraction may have been limited. Switched to fallback parsing.');
            // Clear error after 5 seconds so it doesn't persist
            setTimeout(() => setError(null), 5000);
          }
        }
      } else {
        setError('Could not extract any case data. Please check the format and try again.');
      }
    } catch (err) {
      setError(`Parsing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle creating case from parsed data
  const handleCreateCase = async () => {
    if (!parsedData) return;

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate required fields
      if (!parsedData.title || !parsedData.caseNumber) {
        setError('Title and Case Number are required fields');
        setIsProcessing(false);
        return;
      }

      // Create the case via API
      const newCase = await api.cases.add({
        title: parsedData.title,
        caseNumber: parsedData.caseNumber,
        description: parsedData.description,
        type: parsedData.type as unknown as MatterType,
        matterType: parsedData.type as unknown as MatterType,
        status: parsedData.status as unknown as CaseStatus,
        isArchived: false,
        practiceArea: parsedData.practiceArea,
        jurisdiction: parsedData.jurisdiction,
        court: parsedData.court,
        judge: parsedData.judge,
        referredJudge: parsedData.referredJudge,
        magistrateJudge: parsedData.magistrateJudge,
        filingDate: (parsedData.filingDate ? new Date(parsedData.filingDate).toISOString() : new Date().toISOString()) as string,
        trialDate: (parsedData.trialDate ? new Date(parsedData.trialDate).toISOString() : undefined) as string | undefined,
        closeDate: (parsedData.closeDate ? new Date(parsedData.closeDate).toISOString() : undefined) as string | undefined,
        dateTerminated: (parsedData.dateTerminated ? new Date(parsedData.dateTerminated).toISOString() : undefined) as string | undefined,
        juryDemand: parsedData.juryDemand,
        causeOfAction: parsedData.causeOfAction,
        natureOfSuit: parsedData.natureOfSuit,
        natureOfSuitCode: parsedData.natureOfSuitCode,
        relatedCases: parsedData.relatedCases,
        assignedTeamId: parsedData.assignedTeamId,
        leadAttorneyId: parsedData.leadAttorneyId,
        clientId: parsedData.clientId as unknown as UserId,
        client: 'Unknown Client',
        parties: [],
        citations: [],
        arguments: [],
        defenses: [],
        metadata: parsedData.metadata as unknown as MetadataRecord,
      });

      setSuccessMessage(`Case "${newCase.title}" created successfully!`);
      
      // Invalidate queries to refresh case lists
      queryClient.invalidate(['cases']);
      
      // Clear form after success
      setTimeout(() => {
        setInputText('');
        setParsedData(null);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(`Failed to create case: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle field updates
  const updateField = (field: keyof ParsedCaseData, value: string) => {
    if (!parsedData) return;
    setParsedData({ ...parsedData, [field]: value });
  };

  // Check if we have minimum required data
  const canCreateCase = parsedData?.title && parsedData?.caseNumber;

  return (
    <div className={cn('space-y-6', theme.background)}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className={cn('text-2xl font-bold', theme.text.primary)}>Import Case Data</h2>
          
          {/* AI Toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Sparkles className={cn('h-4 w-4', useAI ? 'text-purple-600' : 'text-gray-400')} />
              <span className={cn('text-sm font-medium', useAI ? theme.text.primary : theme.text.secondary)}>
                AI-Powered Extraction
              </span>
            </label>

            {/* AI Provider Selector */}
            {useAI && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-300">
                <Settings className="h-4 w-4 text-slate-500" />
                <span className="text-xs text-slate-500">Provider:</span>
                <select
                  value={aiProvider}
                  onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                  className={cn(
                    'text-xs px-2 py-1 rounded border font-medium cursor-pointer',
                    theme.background,
                    theme.border.default,
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI GPT-4</option>
                </select>
              </div>
            )}
          </div>
        </div>
        <p className={cn('text-sm', theme.text.secondary)}>
          {useAI 
            ? `Using ${aiProvider === 'gemini' ? 'Google Gemini' : 'OpenAI GPT-4'} AI for intelligent data extraction from any format.`
            : 'Using rule-based extraction for XML (PACER, CourtListener) and structured text.'}
        </p>
      </div>

      {/* Input Area */}
      <div className={cn('rounded-lg border p-6 space-y-4', theme.surface.default, theme.border.default)}>
        <div className="flex items-center justify-between mb-2">
          <label className={cn('text-sm font-semibold', theme.text.primary)}>
            <FileText className="inline h-4 w-4 mr-2" />
            Paste Document Content
          </label>
          <div className="text-xs text-slate-500">
            Supports: XML, PACER, CourtListener, structured text
          </div>
        </div>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your XML or text document here...&#10;&#10;Example (text):&#10;Title: Smith v. Jones Corp&#10;Case Number: 1:23-cv-12345&#10;Court: U.S. District Court, Northern District of California&#10;Filing Date: 2023-01-15&#10;Judge: Hon. Jane Smith&#10;&#10;Or paste XML directly from PACER/CourtListener..."
          className={cn(
            'w-full h-64 px-4 py-3 rounded-md border font-mono text-sm resize-y',
            theme.background,
            theme.border.default,
            theme.text.primary,
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
        />

        <div className="flex gap-2">
          <Button
            onClick={handleParse}
            disabled={isProcessing || !inputText.trim()}
            icon={isProcessing ? Loader : Upload}
            variant="primary"
          >
            {isProcessing ? 'Processing...' : 'Parse Document'}
          </Button>
          
          {inputText && (
            <Button
              onClick={() => {
                setInputText('');
                setParsedData(null);
                setError(null);
                setSuccessMessage(null);
              }}
              icon={X}
              variant="outline"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={cn('flex items-start gap-3 p-4 rounded-lg border', 'bg-red-50 border-red-200')}>
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className={cn('flex items-start gap-3 p-4 rounded-lg border', 'bg-emerald-50 border-emerald-200')}>
          <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-900">Success</p>
            <p className="text-sm text-emerald-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Parsed Data Preview */}
      {parsedData && (
        <div className={cn('rounded-lg border p-6 space-y-4', theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <h3 className={cn('text-lg font-bold', theme.text.primary)}>
              Extracted Case Data
            </h3>
            <Button
              onClick={() => setEditMode(!editMode)}
              icon={Edit2}
              variant="outline"
              size="sm"
            >
              {editMode ? 'View Mode' : 'Edit Mode'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(parsedData).map(([key, value]) => {
              if (!value || key === 'metadata') return null;
              
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              const isRequired = key === 'title' || key === 'caseNumber';

              return (
                <div key={key} className="space-y-1">
                  <label className={cn('text-xs font-semibold', theme.text.secondary)}>
                    {label}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {editMode ? (
                    <input
                      type={key.includes('Date') ? 'date' : 'text'}
                      value={typeof value === 'string' ? value : JSON.stringify(value)}
                      onChange={(e) => updateField(key as keyof ParsedCaseData, e.target.value)}
                      className={cn(
                        'w-full px-3 py-2 rounded-md border text-sm',
                        theme.background,
                        theme.border.default,
                        theme.text.primary
                      )}
                    />
                  ) : (
                    <div className={cn('px-3 py-2 rounded-md border text-sm', theme.surface.highlight, theme.border.default)}>
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleCreateCase}
              disabled={!canCreateCase || isProcessing}
              icon={Plus}
              variant="primary"
            >
              Create Case
            </Button>
            
            <Button
              onClick={() => {
                setParsedData(null);
                setEditMode(false);
              }}
              icon={X}
              variant="outline"
            >
              Cancel
            </Button>
          </div>

          {!canCreateCase && (
            <p className="text-xs text-amber-600">
              ⚠️ Title and Case Number are required to create a case
            </p>
          )}
        </div>
      )}
    </div>
  );
};
